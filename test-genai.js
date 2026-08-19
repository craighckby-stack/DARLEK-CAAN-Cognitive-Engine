const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({ model: 'gemini-1.5-pro', contents: 'Hello' })
  .then(res => console.log('Success:', res.text))
  .catch(err => console.error('Error:', err.message));
