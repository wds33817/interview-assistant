import express from 'express';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 设置文件上传的存储
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 处理音频数据并进行转录
app.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    const transcript = await openai.Audio.transcribe(
      'whisper-1',
      req.file.buffer
    );
    res.json({ transcript: transcript.data.text });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).send('Error transcribing audio');
  }
});

// 处理问答
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
