const axios = require('axios');

// Use environment variables for API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Validate API key
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Move context to a separate constant for better maintainability
const ASTROLOGER_CONTEXT = `You are an AI astrologer designed to provide astrological guidance, insights, and a safe space for users who may be seeking comfort, reflection, or advice about their life, relationships, and well-being. Your primary role is to listen attentively, respond empathetically, and offer thoughtful responses based on astrological principles (zodiac signs, planets, houses, etc.).

Key guidelines:
- Acknowledge and validate the user's feelings and experiences
- Offer insights based on astrological principles
- Encourage self-reflection through open-ended questions
- Be clear about limitations - you're not a substitute for professional therapy
- Use calming, non-judgmental language
- Suggest self-care strategies when appropriate
- Refer to professional help for serious mental health concerns

Remember: Astrology is for guidance and reflection, not a replacement for medical or psychological advice.`;

// Generate AI response using Gemini API
const generateAIResponse = async (prompt, context = '') => {
  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Valid prompt is required');
    }

    const contextToUse = context || ASTROLOGER_CONTEXT;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `${contextToUse}\n\nUser: ${prompt}\n\nAstrologer:`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Extract response text
    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response candidates from Gemini API');
    }

    const text = candidates[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return text.trim();

  } catch (error) {
    console.error('Gemini API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Return appropriate error messages based on error type
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return "I'm having trouble connecting to my services right now. Please check your internet connection and try again.";
    } else if (error.response?.status === 429) {
      return "I'm receiving too many requests right now. Please wait a moment and try again.";
    } else if (error.response?.status === 401) {
      return "There's an authentication issue. Please contact support.";
    } else {
      return "I apologize, but I'm having trouble responding right now. Please try again in a few moments.";
    }
  }
};

// Generate horoscope using Gemini API
const generateHoroscope = async (zodiacSign, date = new Date()) => {
  try {
    if (!zodiacSign || typeof zodiacSign !== 'string') {
      throw new Error('Valid zodiac sign is required');
    }

    const dateStr = date.toDateString();
    const prompt = `Generate a daily horoscope for ${zodiacSign} for ${dateStr}. Include insights about love, career, health, and general guidance. Keep it positive and encouraging while being authentic to astrological principles.`;
    
    return await generateAIResponse(prompt, ASTROLOGER_CONTEXT);
  } catch (error) {
    console.error('Horoscope generation error:', error.message);
    return "I'm unable to generate your horoscope right now. Please try again later.";
  }
};

// Analyze birth chart using Gemini API
const analyzeBirthChart = async (birthDate, birthTime, birthPlace) => {
  try {
    if (!birthDate || !birthTime || !birthPlace) {
      throw new Error('Birth date, time, and place are all required');
    }

    const prompt = `Provide a birth chart analysis for someone born on ${birthDate} at ${birthTime} in ${birthPlace}. Include insights about their sun, moon, and rising signs, major planetary aspects, and key personality traits. Focus on positive guidance and self-understanding.`;
    
    return await generateAIResponse(prompt, ASTROLOGER_CONTEXT);
  } catch (error) {
    console.error('Birth chart analysis error:', error.message);
    return "I'm unable to analyze the birth chart right now. Please ensure all birth details are provided and try again.";
  }
};

module.exports = {
  generateAIResponse,
  generateHoroscope,
  analyzeBirthChart
};