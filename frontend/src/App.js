import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showMoreResources, setShowMoreResources] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [darkMode, setDarkMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const moodEmoji = {
    happy: '😄',
    sad: '😢',
    anxious: '😰',
    calm: '😌',
    angry: '😠',
    tired: '😴',
    stressed: '😣',
    hopeful: '🌟',
    neutral: '🔍',
  };

  const detectMood = (text) => {
    const moodKeywords = {
      sad: ['sad', 'sadness', 'depressed', 'down', 'unhappy', 'cry'],
      anxious: ['anxious', 'anxiety', 'nervous', 'worried', 'panic', 'tense'],
      stressed: ['stressed', 'stress', 'overwhelmed', 'burnt', 'exhausted', 'burnout'],
      happy: ['happy', 'joyful', 'excited', 'grateful', 'content', 'glad'],
      angry: ['angry', 'mad', 'frustrated', 'irritated', 'upset'],
      tired: ['tired', 'sleepy', 'drained', 'fatigued'],
      calm: ['calm', 'peaceful', 'relaxed', 'chill'],
      hopeful: ['hopeful', 'hope', 'optimistic'],
    };
    const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''));
    const score = {};
    for (const mood in moodKeywords) {
      score[mood] = words.filter(word =>
        moodKeywords[mood].some(kw => word.startsWith(kw))
      ).length;
    }
    const [bestMood, bestScore] = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return bestScore > 0 ? bestMood : 'neutral';
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
      angry: [
        { title: "Managing Anger — Mind Tools", url: "https://www.mindtools.com/ak3w7r2/managing-anger" },
        { title: "Anger Management Techniques", url: "https://www.psychologytoday.com/us/blog/in-flux/201912/19-anger-management-techniques" },
      ],
      tired: [
        { title: "Sleep Hygiene — Sleep Foundation", url: "https://www.sleepfoundation.org/sleep-hygiene" },
        { title: "Breathing for Rest — 4-7-8", url: "https://www.healthline.com/health/4-7-8-breathing" },
      ],
      happy: [
        { title: "Gratitude Journaling Prompts", url: "https://positivepsychology.com/gratitude-journal/" },
        { title: "Acts of Kindness Ideas", url: "https://www.randomactsofkindness.org/kindness-ideas" },
      ],
      calm: [
        { title: "Body Scan Meditation", url: "https://www.mindful.org/a-3-minute-body-scan-meditation/" },
        { title: "Box Breathing Guide", url: "https://www.healthline.com/health/box-breathing" },
      ],
      hopeful: [
        { title: "Hope Exercises — PositivePsychology", url: "https://positivepsychology.com/hope-therapy/" },
        { title: "Future Self Journaling", url: "https://www.theholisticpsychologist.com/future-self-journaling" },
      ],
      neutral: [
        { title: "Emotional Wellness Toolkit (NIH)", url: "https://www.nih.gov/health-information/your-healthiest-self-wellness-toolkits/emotional-wellness-toolkit/emotional-wellness-toolkit-more-resources" },
        { title: "Guided Meditations Collection", url: "https://curiocounselling.ca/free-mental-health-wellness-resources/" },
      ],
    };
    return resources[mood] || resources['neutral'];
  };

  const speakReply = (text) => {
    if (!voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    if (!hasStarted) setHasStarted(true);

    const mood = detectMood(userInput);
    setMoodHistory(prev => [...prev, { mood, time: new Date().toLocaleTimeString() }]);
    setCurrentMood(mood);

    const newMessage = { sender: 'user', text: userInput };
    setChatHistory(prev => [...prev, newMessage]);

    try {
      const res = await axios.post(
        'http://localhost:4000/chat',
        { message: userInput },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botReply = { sender: 'bot', text: res.data.reply };
      setChatHistory(prev => [...prev, botReply]);
      speakReply(res.data.reply);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorReply = { sender: 'bot', text: 'Something went wrong.' };
      setChatHistory(prev => [...prev, errorReply]);
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
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Voice input error:', event.error);
      setListening(false);
    };
  };

  // Daily check-in only after onboarding is completed
  useEffect(() => {
    if (!hasStarted) return;
    const today = new Date().toLocaleDateString();
    const last = localStorage.getItem('lastCheckInDate');
    if (last !== today) {
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', text: '🌅 Daily Check‑In: How are you feeling today?' }
      ]);
      localStorage.setItem('lastCheckInDate', today);
    }
  }, [hasStarted]);

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''} ${!hasStarted ? 'welcome-state' : ''}`}>
      {!hasStarted ? (
        <div className="welcome-box">
          <h1 className="welcome-title">🌿 FeelBetter AI</h1>
          <div className="chat-bubble bot">
            Welcome — how are you feeling today?
          </div>

          <div className="welcome-input">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type here..."
            />
            <div className="welcome-actions">
              <button onClick={sendMessage}>Send</button>
              <button onClick={handleVoiceInput}>
                🎙️ Voice {listening ? <span className="voice-active" /> : null}
              </button>
              <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="sidebar fade-in">
            <h2>Mood Tracker</h2>
            <ul>
              {moodHistory.map((entry, index) => (
                <li key={index}>
                  <span className="mood-icon">{moodEmoji[entry.mood] || moodEmoji.neutral}</span>
                  <span className="mood-time">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="app-container fade-in">
            <header className="app-header">
              <span>🌿 FeelBetter AI</span>
              <div className="header-actions">
                <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </header>

            <div className="mood-badge">
              <span className="mood-emoji">{moodEmoji[currentMood] || moodEmoji.neutral}</span>
              <span className="mood-text">{currentMood}</span>
            </div>

            <div className="chat-window expanded">
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
              <div className="input-controls">
                <button onClick={sendMessage}>Send</button>
                <button onClick={handleVoiceInput}>
                  🎙️ Voice {listening ? <span className="voice-active" /> : null}
                </button>
                <button onClick={() => setVoiceEnabled(!voiceEnabled)}>
                  {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                </button>
              </div>
            </div>

            <div className="resource-section">
              <h3>Helpful resources {moodEmoji[currentMood] || moodEmoji.neutral}</h3>
              <ul>
                {(showMoreResources
                  ? getResourcesForMood(currentMood)
                  : getResourcesForMood(currentMood).slice(0, 2)
                ).map((res, index) => (
                  <li key={index}>
                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                      {res.title}
                    </a>
                  </li>
                ))}
              </ul>
              {getResourcesForMood(currentMood).length > 2 && (
                <button
                  className="show-more"
                  onClick={() => setShowMoreResources(!showMoreResources)}
                >
                  {showMoreResources ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
