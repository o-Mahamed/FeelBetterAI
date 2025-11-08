import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: 'user', text: userInput };
    setChatHistory((prev) => [...prev, newMessage]);

    try {
      const res = await axios.post('http://localhost:4000/chat', {
        message: userInput,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const botReply = { sender: 'bot', text: res.data.reply };
      setChatHistory((prev) => [...prev, botReply]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorReply = { sender: 'bot', text: 'Sorry, something went wrong.' };
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
    <div className="app-container">
      <header className="app-header">🌿 FeelBetter AI</header>
      <div className="chat-window">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
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
  );
}

export default App;
