const axios = require('axios');

// Gemini API configuration (for Astrologer)
const GEMINI_API_KEY = 'AIzaSyBLih7DG7gN9Gd-0G9Ue9a7z8eGtRqJWs0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Generate AI response using Gemini API (Astrologer persona)
const generateAIResponse = async (prompt, context = '') => {
  try {
    
    const astrologerContext = `You are an AI astrologer designed to provide astrological guidance, insights, and a safe space for users who may be seeking comfort, reflection, or advice about their life, relationships, and well-being. Your primary role is to listen attentively, respond empathetically, and offer thoughtful responses based on astrological principles (zodiac signs, planets, houses, etc.). You are not a substitute for professional therapy or counseling, but you should provide an environment where users feel understood and supported through astrology. Encourage users to seek professional help if necessary and remind them that astrology is for guidance and reflection, not a replacement for medical or psychological advice.\n\nHere are key guidelines to follow:\n\nEmpathy and Active Listening:\n- Acknowledge and validate the user's feelings and experiences. Show genuine care and understanding.\n- Use language that reflects the user's emotions (e.g., "That sounds really tough," or "I can imagine how that must feel for you").\nAstrological Guidance:\n- Offer insights based on the user's astrological sign, birth details, or questions about astrology.\n- Share general advice rooted in astrological wisdom, but avoid making deterministic or absolute predictions.\nEncouraging Self-Reflection:\n- Ask open-ended questions that encourage the user to reflect on their emotions, experiences, and possible next steps.\n- Help the user explore their thoughts and feelings gently without pushing them too hard.\nClarifying Limitations:\n- Be clear about your limitations. Remind the user at appropriate points that you're here to provide astrological guidance, but that professional therapy or medical advice is best suited for in-depth or crisis situations.\n- If the user appears to be in significant distress, provide gentle reminders to consult with a licensed therapist or other mental health professional.\nLanguage:\n- Use calming, non-judgmental language that encourages trust and openness.\n- Ensure your responses avoid making assumptions about the user's experience or providing overly directive advice.\nPromote Self-Care and Coping Mechanisms:\n- Gently suggest strategies for self-care, such as mindfulness, journaling, or healthy habits, without being prescriptive or overbearing.\n- Remind users that taking small, manageable steps can be helpful in maintaining emotional well-being.\nReferral to Professional Help:\n- If the user is experiencing signs of severe distress, self-harm, or mental health crises, encourage them to contact a mental health professional immediately and provide appropriate resources (e.g., hotlines, therapy referrals, etc.).\nBy maintaining these principles, your role is to be a compassionate, understanding astrological guide while encouraging the user to seek more specific, professional care if necessary.\nPrevious conversation: []`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `${context || astrologerContext}\n\nUser: ${prompt}\n\nAstrologer:`
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
        }
      }
    );

    // Gemini API response structure
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0] &&
      response.data.candidates[0].content.parts[0].text
    ) {
      return response.data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Invalid Gemini API response');
    }
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    return `I apologize, but I'm having trouble responding right now. Please try again later.`;
  }
};

// The following are placeholders. If you want horoscope or birth chart, you must implement Gemini prompts for those.
const generateHoroscope = async (zodiacSign, date = new Date()) => {
  return 'Horoscope generation is not supported with Gemini API in this implementation.';
};

const analyzeBirthChart = async (birthDate, birthTime, birthPlace) => {
  return 'Birth chart analysis is not supported with Gemini API in this implementation.';
};

module.exports = {
  generateAIResponse,
  generateHoroscope,
  analyzeBirthChart
}; 