import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'can you help me with a math problem?' },
    ],
    model: 'gpt-4o-mini',
  });

  console.log(completion.choices[0]);
}

main();
