// AI provider singletons (lazy — importing this module never hits network).
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

let _genAI = null;
let _groq = null;
function getGenAI() {
  if (!_genAI)
    _genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'missing-key',
    );
  return _genAI;
}
function getGroq() {
  if (!_groq)
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'missing-key' });
  return _groq;
}
function aiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
}

module.exports = { getGenAI, getGroq, aiConfigured };
