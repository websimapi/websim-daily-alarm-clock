document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const permissionOverlay = document.getElementById('permission-overlay');
  const enableAudioBtn = document.getElementById('enable-audio');
  const mainApp = document.getElementById('main-app');
  const currentTimeEl = document.getElementById('current-time');
  const alarmTimeInput = document.getElementById('alarm-time');
  const setAlarmBtn = document.getElementById('set-alarm');
  const testAlarmBtn = document.getElementById('test-alarm');
  const clearAlarmBtn = document.getElementById('clear-alarm');
  const alarmStatusEl = document.getElementById('alarm-status');
  const alarmControlsEl = document.getElementById('alarm-controls');
  const alarmSound = document.getElementById('alarm-sound');
  const secondAlarmSound = document.getElementById('second-alarm-sound');
  
  // Variables
  let alarmTime = null;
  let isAlarmRinging = false;
  let audioEnabled = false;
  
  // Start by requesting user interaction
  enableAudioBtn.addEventListener('click', () => {
    // Initialize audio context with user interaction
    const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
    silentAudio.play().then(() => {
      audioEnabled = true;
      permissionOverlay.style.display = 'none';
      mainApp.classList.remove('hidden');
      init();
    }).catch(e => {
      console.log("Audio context not enabled:", e);
      alert("Unable to enable audio. Please try again.");
    });
  });
  
  function init() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Load saved alarm from local storage
    const savedAlarm = localStorage.getItem('dailyAlarm');
    if (savedAlarm) {
      alarmTime = savedAlarm;
      alarmTimeInput.value = alarmTime;
      updateAlarmStatus();
      alarmControlsEl.classList.remove('hidden');
    }
    
    // Add event listeners
    setAlarmBtn.addEventListener('click', setAlarm);
    testAlarmBtn.addEventListener('click', testAlarm);
    clearAlarmBtn.addEventListener('click', clearAlarm);
  }
  
  function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Check if alarm should ring
    checkAlarm(hours, minutes);
  }
  
  function checkAlarm(hours, minutes) {
    if (!alarmTime || isAlarmRinging || !audioEnabled) return;
    
    const currentTime = `${hours}:${minutes}`;
    if (currentTime === alarmTime) {
      ringAlarm();
    }
  }
  
  function ringAlarm() {
    isAlarmRinging = true;
    alarmSound.loop = false;
    alarmSound.play();
    
    // Add event listener for when first sound ends
    alarmSound.addEventListener('ended', playSecondSound, { once: true });
    
    // Add visual indication
    alarmStatusEl.textContent = 'ALARM RINGING! Click to stop.';
    alarmStatusEl.classList.add('alarm-active');
    
    // Add click event to stop alarm
    alarmStatusEl.addEventListener('click', stopAlarm);
    
    // Auto-stop alarm after 1 minute if not manually stopped
    setTimeout(() => {
      if (isAlarmRinging) {
        stopAlarm();
      }
    }, 60000);
  }
  
  function playSecondSound() {
    if (isAlarmRinging) {
      secondAlarmSound.loop = true;
      secondAlarmSound.play();
    }
  }
  
  function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    secondAlarmSound.pause();
    secondAlarmSound.currentTime = 0;
    alarmSound.removeEventListener('ended', playSecondSound);
    isAlarmRinging = false;
    alarmStatusEl.classList.remove('alarm-active');
    alarmStatusEl.removeEventListener('click', stopAlarm);
    updateAlarmStatus();
  }
  
  function testAlarm() {
    alarmSound.loop = false;
    alarmSound.addEventListener('ended', () => {
      secondAlarmSound.loop = false;
      secondAlarmSound.play();
    }, { once: true });
    alarmSound.play();
  }
  
  function setAlarm() {
    const timeValue = alarmTimeInput.value;
    
    if (!timeValue) {
      alert('Please select a time for your alarm.');
      return;
    }
    
    alarmTime = timeValue;
    localStorage.setItem('dailyAlarm', alarmTime);
    
    updateAlarmStatus();
    alarmControlsEl.classList.remove('hidden');
  }
  
  function clearAlarm() {
    alarmTime = null;
    alarmTimeInput.value = '';
    localStorage.removeItem('dailyAlarm');
    
    alarmStatusEl.textContent = 'No alarm set';
    alarmControlsEl.classList.add('hidden');
    
    if (isAlarmRinging) {
      stopAlarm();
    }
  }
  
  function updateAlarmStatus() {
    if (alarmTime) {
      const [hours, minutes] = alarmTime.split(':');
      const formattedTime = formatTimeForDisplay(hours, minutes);
      alarmStatusEl.textContent = `Alarm set for ${formattedTime} daily`;
    } else {
      alarmStatusEl.textContent = 'No alarm set';
    }
  }
  
  function formatTimeForDisplay(hours, minutes) {
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  }
});