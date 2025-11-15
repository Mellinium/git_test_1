import { NextResponse } from 'next/server';

type ExplainRequest = {
  selectedText: string;
  pageText: string;
  pageNumber: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ExplainRequest;
  const { selectedText, pageText, pageNumber } = body;

  if (!selectedText || !pageText || typeof pageNumber !== 'number') {
    return NextResponse.json({ error: 'selectedText, pageText and pageNumber are required.' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY. Please add it to your environment.' }, { status: 500 });
  }

  const prompt = `You are a concise tutoring assistant. Explain the selected passage from a PDF to a beginner.\n\nFull page context:\n${pageText}\n\nSelected passage:\n${selectedText}\n\nProvide a short, plain-language explanation without introducing new topics.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You help learners understand PDFs. Keep answers short and simple.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 250
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Explain API failed', errorText);
      return NextResponse.json({ error: 'Failed to fetch explanation.' }, { status: 500 });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim() ?? '';

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Explain API error', error);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
