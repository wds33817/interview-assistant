import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: question },
      ],
      max_tokens: 800,
    });

    if (response.choices && response.choices.length > 0) {
      res.json({ answer: response.choices[0].message.content });
    } else {
      res.status(500).send('No response from OpenAI');
    }
  } catch (error) {
    console.error('Error generating response from OpenAI:', error);
    res.status(500).send('Error generating response from OpenAI');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
