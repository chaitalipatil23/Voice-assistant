const GEMINI_API_KEY = "AIzaSyBJvWXhCjAIbkhHuebtsaLXhs6xXkOYxE4"; 

let btn = document.querySelector("#btn");
let voice = document.querySelector("#voice");
let chatBox = document.getElementById("chatBox");
let input = document.getElementById("chatInput");
let stopBtn = document.getElementById("stopBtn");

function stopSpeaking() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

stopBtn.addEventListener("click", stopSpeaking);  

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = "en-GB";
  window.speechSynthesis.speak(utterance);
}

function wishMe() {
  const hours = new Date().getHours();
  if (hours >= 0 && hours < 12) speak("Good Morning!");
  else if (hours >= 12 && hours < 17) speak("Good Afternoon!");
  else speak("Good Evening!");
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
  div.innerHTML = `<b>${sender}:</b> ${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function takeCommand(message) {
  btn.style.display = "flex";
  voice.style.display = "none";

  if (["hello", "hey"].some(g => message.includes(g))) {
    const reply = "Hello! How can I assist you today?";
    speak(reply);
    displayChat("Shifra", reply);
  } else if (message.includes("who are you")) {
    const reply = "I am Shifra, your virtual assistant created by Chaitali.";
    speak(reply);
    displayChat("Shifra", reply);
  } else if (message.includes("open youtube")) {
    speak("Opening YouTube");
    window.open("https://www.youtube.com", "_blank");
  } else if (message.includes("open google")) {
    speak("Opening Google");
    window.open("https://www.google.com", "_blank");
  } else if (message.includes("open instagram")) {
    speak("Opening Instagram");
    window.open("https://www.instagram.com", "_blank");
  } else if (message.includes("time")) {
    const time = new Date().toLocaleTimeString();
    const reply = `Current time is ${time}`;
    speak(reply);
    displayChat("Shifra", reply);
  } else if (message.includes("date")) {
    const date = new Date().toDateString();
    const reply = `Today's date is ${date}`;
    speak(reply);
    displayChat("Shifra", reply);
  } else {
    displayChat("Shifra", "Thinking...");

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
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sorry, I couldn't understand that.";
        speak(reply);
        const lastBotMessage = chatBox.querySelector(".assistant:last-of-type");
        if (lastBotMessage && lastBotMessage.innerText.includes("Thinking")) {
          lastBotMessage.innerHTML = `<b>Shifra:</b> ${reply}`;
        } else {
          displayChat("Shifra", reply);
        }
      })
      .catch(err => {
        const fallback = "Sorry, I'm having trouble connecting to Gemini.";
        speak(fallback);
        displayChat("Shifra", fallback);
        console.error("Gemini API Error:", err);
      });
  }
}