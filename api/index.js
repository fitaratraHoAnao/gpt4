
import express from 'express';
import OpenAI from 'openai';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store conversation history
const conversationHistory = new Map();

app.get('/chatgpt', async (req, res) => {
  try {
    const { question, uid } = req.query;
    
    if (!question || !uid) {
      return res.status(400).json({ error: 'Question and UID are required' });
    }

    // Get or initialize conversation history for this user
    if (!conversationHistory.has(uid)) {
      conversationHistory.set(uid, []);
    }
    const userHistory = conversationHistory.get(uid);
    
    // Add new user message
    userHistory.push({ role: "user", content: question });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: userHistory,
    });

    const aiResponse = completion.choices[0].message;
    
    // Add AI response to history
    userHistory.push(aiResponse);
    
    // Keep only last 10 messages to manage memory
    if (userHistory.length > 10) {
      userHistory.splice(0, 2);
    }

    res.json({
      response: aiResponse.content
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
      
