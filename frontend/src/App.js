import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/chat', { message });
      setReply(res.data.reply);
    } catch (error) {
      console.error('Error sending message:', error);
      setReply('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>🧠 FeelBetter AI</h1>
      <textarea
        rows="5"
        placeholder="How are you feeling today?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Thinking...' : 'Send'}
      </button>
      <div className="reply">
        {reply && (
          <>
            <h3>Response:</h3>
            <p>{reply}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

