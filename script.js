document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const currentTimeEl = document.getElementById('current-time');
  const alarmTimeInput = document.getElementById('alarm-time');
  const setAlarmBtn = document.getElementById('set-alarm');
  const testAlarmBtn = document.getElementById('test-alarm');
  const clearAlarmBtn = document.getElementById('clear-alarm');
  const alarmStatusEl = document.getElementById('alarm-status');
  const alarmControlsEl = document.getElementById('alarm-controls');
  const alarmSound = document.getElementById('alarm-sound');
  
  // Variables
  let alarmTime = null;
  let isAlarmRinging = false;
  
  // Initialize the app
  init();
  
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
    
    // Check for user interaction to enable audio
    document.addEventListener('click', () => {
      if (alarmSound.paused) {
        // Create a silent audio context to enable audio
        const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        silentAudio.play().catch(e => console.log("Audio context not yet enabled"));
      }
    });
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
    if (!alarmTime || isAlarmRinging) return;
    
    const currentTime = `${hours}:${minutes}`;
    if (currentTime === alarmTime) {
      ringAlarm();
    }
  }
  
  function ringAlarm() {
    isAlarmRinging = true;
    alarmSound.loop = true;
    
    // Try to play the alarm
    playAlarm();
    
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
  
  function playAlarm() {
    alarmSound.play().catch(e => {
      console.log("Couldn't play alarm automatically:", e);
      // Show a message to the user that they need to interact
      alarmStatusEl.textContent = 'ALARM TIME! Click here to play sound.';
      alarmStatusEl.addEventListener('click', function clickToPlay() {
        alarmSound.play();
        alarmStatusEl.removeEventListener('click', clickToPlay);
      });
    });
  }
  
  function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    isAlarmRinging = false;
    alarmStatusEl.classList.remove('alarm-active');
    alarmStatusEl.removeEventListener('click', stopAlarm);
    updateAlarmStatus();
  }
  
  function testAlarm() {
    alarmSound.loop = false;
    alarmSound.play().catch(e => {
      console.log("Couldn't play test sound:", e);
      alert("Please interact with the page first to enable sound testing.");
    });
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

