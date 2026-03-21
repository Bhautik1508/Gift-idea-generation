import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;
  const genAI = new GoogleGenerativeAI(apiKey);
  // wait we don't have a listModels built in to this sdk version easily, let's just do a fetch
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log(data.models.map((m: any) => m.name).filter((n: string) => n.includes('flash') || n.includes('pro')));
  } catch(e) { console.error(e); }
}

listModels();
