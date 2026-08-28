/**
 * @file test-genai.js
 * @description Optimized Gemini API interaction utility with environment validation, 
 * robust error handling, and modern async/await execution pattern.
 * @version 2.0.0-EMG
 */

'use strict';

const { GoogleGenAI } = require('@google/genai');

/**
 * Initializes and executes a test generation request against the Gemini API.
 * @async
 * @returns {Promise<void>}
 */
async function executeGeminiTest() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('CRITICAL: GEMINI_API_KEY environment variable is not defined.');
  }

  // Initialize the GoogleGenAI client with explicit configuration context
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: 'Hello',
    });

    if (!response || typeof response.text !== 'string') {
      throw new Error('Received malformed response structure from Gemini API.');
    }

    console.log('Success:', response.text);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error:', errorMessage);
    process.exitCode = 1;
  }
}

// Execute the sovereign routine immediately
executeGeminiTest();