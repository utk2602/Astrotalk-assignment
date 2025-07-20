const axios = require('axios');

// Configure OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Generate AI response using OpenAI API
const generateAIResponse = async (prompt, context = '') => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemMessage = `You are an AI assistant specialized in astrology and spiritual guidance. 
    You provide helpful, respectful, and informative responses about astrology, numerology, 
    spiritual practices, and general life guidance. Always be supportive and encouraging. 
    If you don't know something specific, acknowledge it and suggest consulting a professional astrologer.`;

    const userMessage = context 
      ? `Context: ${context}\n\nUser Question: ${prompt}`
      : prompt;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    
    // Fallback response if API fails
    return `I apologize, but I'm currently unable to process your request. 
    Please try again later or consider reaching out to one of our professional astrologers 
    for personalized guidance.`;
  }
};

// Generate horoscope based on zodiac sign
const generateHoroscope = async (zodiacSign, date = new Date()) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemMessage = `You are a professional astrologer. Generate a daily horoscope for the given zodiac sign. 
    Make it positive, encouraging, and insightful. Include guidance for love, career, health, and general well-being. 
    Keep it concise but meaningful.`;

    const userMessage = `Generate a daily horoscope for ${zodiacSign} for ${date.toDateString()}. 
    Include specific guidance for love, career, health, and general well-being.`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Horoscope generation error:', error.response?.data || error.message);
    return `I'm sorry, I couldn't generate your horoscope at the moment. 
    Please try again later or consult with one of our professional astrologers.`;
  }
};

// Analyze birth chart (simplified version)
const analyzeBirthChart = async (birthDate, birthTime, birthPlace) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemMessage = `You are an expert astrologer. Provide a simplified birth chart analysis 
    based on the given birth details. Focus on sun sign, moon sign, and rising sign interpretations. 
    Be encouraging and provide practical insights.`;

    const userMessage = `Please provide a birth chart analysis for someone born on ${birthDate} 
    at ${birthTime} in ${birthPlace}. Include insights about their personality, strengths, 
    and life path based on their astrological profile.`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 600,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Birth chart analysis error:', error.response?.data || error.message);
    return `I'm sorry, I couldn't analyze your birth chart at the moment. 
    Please try again later or schedule a consultation with one of our professional astrologers 
    for a detailed reading.`;
  }
};

module.exports = {
  generateAIResponse,
  generateHoroscope,
  analyzeBirthChart
}; 