import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({ status: 'FocusPDF API is running' });
});

app.post('/api/explain', async (req, res) => {
  const { selectedText, pageText, pageNumber } = req.body ?? {};
  if (!selectedText) {
    return res.status(400).json({ error: 'selectedText is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({
      explanation: 'AI is not configured yet. Add your OPENAI_API_KEY in server/.env to enable live explanations.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You explain highlighted textbook snippets in very simple beginner-friendly language.'
          },
          {
            role: 'user',
            content: `PDF page ${pageNumber ?? '?'} context:\n${pageText || 'No page text available.'}\n\nPlease explain the highlighted passage: ${selectedText}`
          }
        ],
        temperature: 0.2,
        max_tokens: 180
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error', response.status, errorText);
      return res.status(502).json({ error: 'AI service failed', details: errorText });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ explanation: explanation || 'No explanation received.' });
  } catch (error) {
    console.error('Explain endpoint failed', error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.listen(PORT, () => {
  console.log(`FocusPDF API listening on http://localhost:${PORT}`);
});
