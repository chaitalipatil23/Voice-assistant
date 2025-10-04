const GEMINI_API_KEY = "AIzaSyBJvWXhCjAIbkhHuebtsaLXhs6xXkOYxE4"; 

let btn = document.querySelector("#btn");
let voice = document.querySelector("#voice");
let chatBox = document.getElementById("chatBox");
let input = document.getElementById("chatInput");
let stopBtn = document.getElementById("stopBtn");
let typingIndicator = document.getElementById("typingIndicator");
let voiceStatus = document.getElementById("voiceStatus");
let helpSection = document.getElementById("helpSection");
let settingsPanel = document.getElementById("settingsPanel");
let speechToggle = document.getElementById("speechToggle");

// Speech settings
let speechEnabled = false; // Default to disabled

// Initialize welcome message timestamp and help features
document.addEventListener("DOMContentLoaded", function() {
  const welcomeTime = document.getElementById("welcomeTime");
  if (welcomeTime) {
    welcomeTime.textContent = new Date().toLocaleTimeString();
  }
  
  // Add help tooltip functionality
  addHelpTooltips();
  
  // Initialize voice recognition error handling
  setupVoiceRecognition();
  
  // Initialize settings panel
  setupSettingsPanel();
  
  // Initialize speech toggle
  setupSpeechToggle();
  
  // Initialize speech synthesis
  initializeSpeechSynthesis();
});

// Initialize speech synthesis
function initializeSpeechSynthesis() {
  // Check if speech synthesis is supported
  if ('speechSynthesis' in window) {
    console.log("Speech synthesis is supported");
    
    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Available voices:", voices.length);
    };
    
    // Load voices when they become available
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
  } else {
    console.error("Speech synthesis is not supported");
  }
}

// Add help tooltips to buttons
function addHelpTooltips() {
  const micBtn = document.getElementById("btn");
  const sendBtn = document.querySelector('button[onclick="handleChat()"]');
  const stopBtn = document.getElementById("stopBtn");
  
  if (micBtn) {
    micBtn.setAttribute("title", "Click to start voice recording (Ctrl+Enter)");
  }
  
  if (sendBtn) {
    sendBtn.setAttribute("title", "Send your message (Enter)");
  }
  
  if (stopBtn) {
    stopBtn.setAttribute("title", "Stop speaking (Escape)");
  }
}

// Setup voice recognition with error handling
function setupVoiceRecognition() {
  if (!recognition) return;
  
  recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
    let errorMessage = "Sorry, there was an error with voice recognition.";
    
    switch(event.error) {
      case "no-speech":
        errorMessage = "No speech detected. Please try again.";
        break;
      case "audio-capture":
        errorMessage = "No microphone found. Please check your microphone.";
        break;
      case "not-allowed":
        errorMessage = "Microphone access denied. Please allow microphone access.";
        break;
      case "network":
        errorMessage = "Network error. Please check your connection.";
        break;
    }
    
    displayChat("Shifra", errorMessage);
    btn.style.display = "flex";
    voice.style.display = "none";
    voiceStatus.style.display = "none";
    stopBtn.style.display = "none";
  };
  
  recognition.onend = function() {
    btn.style.display = "flex";
    voice.style.display = "none";
    voiceStatus.style.display = "none";
    stopBtn.style.display = "none";
  };
}

// Setup settings panel functionality
function setupSettingsPanel() {
  const voiceRate = document.getElementById("voiceRate");
  const voicePitch = document.getElementById("voicePitch");
  const rateValue = document.getElementById("rateValue");
  const pitchValue = document.getElementById("pitchValue");
  
  if (voiceRate && rateValue) {
    voiceRate.addEventListener("input", function() {
      rateValue.textContent = this.value;
    });
  }
  
  if (voicePitch && pitchValue) {
    voicePitch.addEventListener("input", function() {
      pitchValue.textContent = this.value;
    });
  }
}

// Toggle settings panel
function toggleSettings() {
  if (settingsPanel) {
    settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
  }
}

// Setup speech toggle functionality
function setupSpeechToggle() {
  if (speechToggle) {
    updateSpeechToggleUI();
    speechToggle.addEventListener("click", toggleSpeech);
  }
}

// Toggle speech on/off
function toggleSpeech() {
  speechEnabled = !speechEnabled;
  updateSpeechToggleUI();
  
  // Stop any current speech when disabling
  if (!speechEnabled) {
    window.speechSynthesis.cancel();
    displayChat("Shifra", "Speech disabled. I'll only show text responses.");
  } else {
    displayChat("Shifra", "Speech enabled! I'll now speak my responses.");
    // Test speech immediately when enabled
    setTimeout(() => {
      speak("Speech is now enabled and working!");
    }, 1000);
  }
}

// Update speech toggle button UI
function updateSpeechToggleUI() {
  if (speechToggle) {
    if (speechEnabled) {
      speechToggle.innerHTML = "🔊<span class='btn-label'>Speaker</span>";
      speechToggle.title = "Speaker - Disable Speech";
      speechToggle.classList.remove("disabled");
    } else {
      speechToggle.innerHTML = "🔇<span class='btn-label'>Speaker</span>";
      speechToggle.title = "Speaker - Enable Speech";
      speechToggle.classList.add("disabled");
    }
  }
}

// Function to clean asterisks and formatting from text
function cleanText(text) {
  if (!text) return text;
  
  // Remove asterisks and other markdown formatting
  return text
    .replace(/\*+/g, '') // Remove asterisks
    .replace(/_+/g, '') // Remove underscores
    .replace(/`+/g, '') // Remove backticks
    .replace(/#+/g, '') // Remove hash symbols
    .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    .trim();
}

function stopSpeaking() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

stopBtn.addEventListener("click", stopSpeaking);  

function speak(text, autoDisable = false) {
  // Only speak if speech is enabled
  if (!speechEnabled) {
    console.log("Speech is disabled, not speaking:", text);
    return;
  }

  console.log("Speaking:", text);

  // Stop any current speech first
  window.speechSynthesis.cancel();

  // Wait a moment for cancellation to complete
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceRate = document.getElementById("voiceRate");
    const voicePitch = document.getElementById("voicePitch");

    utterance.rate = voiceRate ? parseFloat(voiceRate.value) : 1;
    utterance.pitch = voicePitch ? parseFloat(voicePitch.value) : 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    // Add event listeners for debugging
    utterance.onstart = function() {
      console.log("Speech started");
    };

    utterance.onend = function() {
      console.log("Speech ended");
      if (autoDisable) {
        speechEnabled = false;
        updateSpeechToggleUI();
      }
    };

    utterance.onerror = function(event) {
      console.error("Speech error:", event.error);
    };

    window.speechSynthesis.speak(utterance);
  }, 100);
}

function wishMe() {
  const hours = new Date().getHours();
  let greeting = "";
  if (hours >= 0 && hours < 12) greeting = "Good Morning!";
  else if (hours >= 12 && hours < 17) greeting = "Good Afternoon!";
  else greeting = "Good Evening!";

  // Only speak if speech is enabled
  if (speechEnabled) {
    speak(greeting, false);
  }
}
window.addEventListener("load", wishMe);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const transcript = event.results[event.resultIndex][0].transcript;
  displayChat("You", transcript);
  takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
  recognition.start();
  btn.style.display = "none";
  voice.style.display = "block";
  voiceStatus.style.display = "flex";
  stopBtn.style.display = "inline-block";
});

function handleChat() {
  const userInput = input.value.trim();
  if (userInput !== "") {
    displayChat("You", userInput);
    takeCommand(userInput.toLowerCase());
    input.value = "";
  }
}

function displayChat(sender, message) {
  const div = document.createElement("div");
  div.className = sender === "You" ? "user" : "assistant";
  const timestamp = new Date().toLocaleTimeString();
  div.innerHTML = `<b>${sender}:</b> ${message} <span class="message-time">${timestamp}</span>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Hide help section after first interaction
  if (helpSection && helpSection.style.display !== "none") {
    helpSection.style.display = "none";
  }
}

function takeCommand(message) {
  btn.style.display = "flex";
  voice.style.display = "none";
  voiceStatus.style.display = "none";
  stopBtn.style.display = "none";

  if (["hello", "hey"].some(g => message.includes(g))) {
    const reply = "Hello! How can I assist you today?";
    speak(reply, true);
    displayChat("Shifra", reply);
  } else if (message.includes("who are you")) {
    const reply = "I am Shifra, your virtual assistant created by Chaitali.";
    speak(reply, true);
    displayChat("Shifra", reply);
  } else if (message.includes("open youtube")) {
    speak("Opening YouTube", true);
    window.open("https://www.youtube.com", "_blank");
  } else if (message.includes("open google")) {
    speak("Opening Google", true);
    window.open("https://www.google.com", "_blank");
  } else if (message.includes("open instagram")) {
    speak("Opening Instagram", true);
    window.open("https://www.instagram.com", "_blank");
  } else if (message.includes("time")) {
    const time = new Date().toLocaleTimeString();
    const reply = `Current time is ${time}`;
    speak(reply, true);
    displayChat("Shifra", reply);
  } else if (message.includes("date")) {
    const date = new Date().toDateString();
    const reply = `Today's date is ${date}`;
    speak(reply, true);
    displayChat("Shifra", reply);
  } else if (message.includes("help") || message.includes("what can you do")) {
    const reply = "I can help you with various tasks! I can tell you the time and date, open websites like YouTube, Google, and Instagram, answer questions using AI, and much more. Just ask me anything!";
    speak(reply, true);
    displayChat("Shifra", reply);
  } else if (message.includes("clear") || message.includes("reset")) {
    chatBox.innerHTML = '<div class="assistant"><b>Shifra:</b> Hi, I\'m Shifra! Ask me anything… <span class="message-time">' + new Date().toLocaleTimeString() + '</span></div>';
    helpSection.style.display = "block";
    speak("Chat cleared! How can I help you?", true);
  } else {
    // Show typing indicator
    typingIndicator.style.display = "flex";
    
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    })
      .then(res => {
        if (!res.ok) throw new Error(`API Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sorry, I couldn't understand that.";
        const cleanReply = cleanText(rawReply);
        speak(cleanReply, true);
        displayChat("Shifra", cleanReply);
      })
      .catch(err => {
        const fallback = "Sorry, I'm having trouble connecting to Gemini.";
        speak(fallback, true);
        displayChat("Shifra", fallback);
        console.error("Gemini API Error:", err);
      })
      .finally(() => {
        // Hide typing indicator
        typingIndicator.style.display = "none";
      });
  }
}

// Function to use example prompts
function usePrompt(prompt) {
  input.value = prompt;
  handleChat();
}

// Enhanced stop speaking function
function stopSpeaking() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  // Reset voice UI elements
  btn.style.display = "flex";
  voice.style.display = "none";
  voiceStatus.style.display = "none";
  stopBtn.style.display = "none";
}

// Keyboard navigation and accessibility
document.addEventListener("keydown", function(event) {
  // Escape key to stop speaking
  if (event.key === "Escape") {
    stopSpeaking();
  }
  
  // Ctrl/Cmd + Enter to start voice recording
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    btn.click();
  }
  
  // Focus management for better accessibility
  if (event.key === "Tab") {
    // Ensure focus is visible
    document.body.classList.add("keyboard-navigation");
  }
});

// Remove keyboard navigation class on mouse use
document.addEventListener("mousedown", function() {
  document.body.classList.remove("keyboard-navigation");
});

// Add focus styles for keyboard navigation
const style = document.createElement("style");
style.textContent = `
  .keyboard-navigation *:focus {
    outline: 2px solid #00ffee !important;
    outline-offset: 2px !important;
  }
  
  .keyboard-navigation button:focus,
  .keyboard-navigation input:focus {
    box-shadow: 0 0 0 2px #00ffee !important;
  }
`;
document.head.appendChild(style);