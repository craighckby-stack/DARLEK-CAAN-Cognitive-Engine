require('dotenv').config({ path: '.env' });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Hello',
    });
    console.log("SUCCESS:", res.text);
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
test();
