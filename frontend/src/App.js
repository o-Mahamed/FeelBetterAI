import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);

  const emojiMap = {
    happy: '😄',
    sad: '😢',
    anxious: '😰',
    calm: '😌',
    angry: '😠',
    love: '❤️',
    tired: '😴',
    okay: '👌',
    support: '🤗',
    better: '🌈',
    good: '👍',
    bad: '👎',
    thank: '🙏',
    help: '🆘',
    breathe: '🫁',
    relax: '🧘',
    strong: '💪',
    hope: '🌟',
    you: '👉',
    me: '🙋',
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
    const moodKeywords = {
      happy: '😄',
      sad: '😢',
      anxious: '😰',
      calm: '😌',
      angry: '😠',
      tired: '😴',
      hopeful: '🌟',
    };

    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (moodKeywords[word]) return moodKeywords[word];
    }
    return '🔍'; // default mood
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
    } catch (error) {
      console.error('Error sending message:', error);
      const errorReply = { sender: 'bot', text: '🆘 🔹 🔹 🔹' };
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

  return (
    <div className="app-wrapper">
      <div className="sidebar">
        <h2>Mood Tracker</h2>
        <ul>
          {moodHistory.map((entry, index) => (
            <li key={index}>
              <span className="mood-icon">{entry.mood}</span>
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
        </div>
      </div>
    </div>
  );
}

export default App;
