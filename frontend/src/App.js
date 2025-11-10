import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showMoreResources, setShowMoreResources] = useState(false);

  const emojiMap = {
    happy: '😄', sad: '😢', anxious: '😰', calm: '😌', angry: '😠',
    love: '❤️', tired: '😴', okay: '👌', support: '🤗', better: '🌈',
    good: '👍', bad: '👎', thank: '🙏', help: '🆘', breathe: '🫁',
    relax: '🧘', strong: '💪', hope: '🌟', you: '👉', me: '🙋',
  };

  const convertToEmoji = (text) => {
    return text
      .split(/\b/)
      .map(word => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        return emojiMap[clean] ? `${word} ${emojiMap[clean]}` : word;
      })
      .join('');
  };

  const detectMood = (text) => {
    const moodScores = {
      sad: ['sad', 'depressed', 'down', 'unhappy', 'cry'],
      anxious: ['anxious', 'nervous', 'worried', 'panic', 'tense'],
      stressed: ['stressed', 'overwhelmed', 'burnt out', 'exhausted'],
      happy: ['happy', 'joyful', 'excited', 'grateful', 'content'],
      angry: ['angry', 'mad', 'frustrated', 'irritated'],
      tired: ['tired', 'sleepy', 'drained', 'fatigued'],
      calm: ['calm', 'peaceful', 'relaxed', 'chill'],
    };

    const words = text.toLowerCase().split(/\s+/);
    const score = {};
    for (const mood in moodScores) {
      score[mood] = words.filter(word => moodScores[mood].includes(word)).length;
    }

    const detected = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return detected[1] > 0 ? detected[0] : 'neutral';
  };

  const getResourcesForMood = (mood) => {
    const resources = {
      sad: [
        { title: "BounceBack Ontario", url: "https://bouncebackontario.ca/" },
        { title: "CAMH Mental Health Toolkit", url: "https://toolkit.camh.ca/" },
        { title: "Mood Disorders Association", url: "https://www.mooddisorders.ca/" },
        { title: "Depression Self-Help Guide", url: "https://www.heretohelp.bc.ca/infosheet/depression-self-help-strategies" },
      ],
      anxious: [
        { title: "Ontario Shores Anxiety Support", url: "https://www.ontarioshores.ca/resources-support/self-help-resources/anxiety-resources-and-support" },
        { title: "Curio Counselling Tools", url: "https://curiocounselling.ca/free-mental-health-wellness-resources/" },
        { title: "Anxiety Canada", url: "https://www.anxietycanada.com/" },
        { title: "MindShift CBT App", url: "https://www.anxietycanada.com/resources/mindshift-cbt/" },
      ],
      stressed: [
        { title: "NIH Wellness Toolkit", url: "https://www.nih.gov/health-information/your-healthiest-self-wellness-toolkits/emotional-wellness-toolkit/emotional-wellness-toolkit-more-resources" },
        { title: "UCLA Guided Meditations", url: "https://curiocounselling.ca/free-mental-health-wellness-resources/" },
        { title: "CDC Stress Tips", url: "https://www.cdc.gov/mentalhealth/stress-coping/index.html" },
        { title: "CAMH Coping Strategies", url: "https://www.camh.ca/en/health-info/mental-health-and-covid-19/coping-with-stress-and-anxiety" },
      ],
    };

    return resources[mood] || [];
  };

  const speakReply = (text) => {
    if (!voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const mood = detectMood(userInput);
    setMoodHistory(prev => [...prev, { mood, time: new Date().toLocaleTimeString() }]);

    const newMessage = { sender: 'user', text: userInput };
    setChatHistory((prev) => [...prev, newMessage]);

    try {
      const res = await axios.post('http://localhost:4000/chat', {
        message: userInput,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const emojiOnly = convertToEmoji(res.data.reply);
      const botReply = { sender: 'bot', text: emojiOnly };
      setChatHistory((prev) => [...prev, botReply]);
      speakReply(res.data.reply);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorReply = { sender: 'bot', text: '🆘 Something went wrong.' };
      setChatHistory((prev) => [...prev, errorReply]);
    }

    setUserInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Voice input error:', event.error);
    };
  };

  const currentMood = detectMood(userInput);

  return (
    <div className="app-wrapper">
      <div className="sidebar">
        <h2>Mood Tracker</h2>
        <ul>
          {moodHistory.map((entry, index) => (
            <li key={index}>
              <span className="mood-icon">{emojiMap[entry.mood] || '🔍'}</span>
              <span className="mood-time">{entry.time}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="app-container">
        <header className="app-header">🌿 FeelBetter AI</header>
        <div className="chat-window">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender}`}>
              <span className="emoji">
                {msg.sender === 'user' ? '🙂' : '💬'}
              </span>{' '}
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="How are you feeling today?"
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={handleVoiceInput}>🎙️</button>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)}>
            {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>
        </div>
        <div className="resource-section">
          <h3>Helpful Resources</h3>
          <ul>
            {(showMoreResources
              ? getResourcesForMood(currentMood)
              : getResourcesForMood(currentMood).slice(0, 2)
            ).map((res, index) => (
              <li key={index}>
                <a href={res.url} target="_blank" rel="noopener noreferrer">{res.title}</a>
              </li>
            ))}
          </ul>
          {getResourcesForMood(currentMood).length > 2 && (
            <button onClick={() => setShowMoreResources(!showMoreResources)}>
              {showMoreResources ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App