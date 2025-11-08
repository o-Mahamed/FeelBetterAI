const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();

// ✅ CORS middleware — handles all origins and preflight
app.use(cors());
app.use(express.json());

// ✅ Test route to confirm backend is reachable
app.get('/ping', (req, res) => {
  res.send('pong');
});

// ✅ OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Chat route
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received message:', message);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.choices[0].message.content;
    console.log('AI reply:', reply);
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI error:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Something went wrong with the AI response.' });
  }
});

// ✅ Start server on port 4000
app.listen(4000, () => {
  console.log('✅ Backend running on http://localhost:4000');
});
