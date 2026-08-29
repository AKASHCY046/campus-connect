// OpenAI API integration for chat functionality
import { config } from '@/lib/config';
import appGuide from '@/lib/app_guide.json';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  reply: string;
  success: boolean;
  error?: string;
}

// Real OpenAI API call
export const sendOpenAIMessage = async (message: string): Promise<ChatResponse> => {
  if (!config.openai.enabled || !config.openai.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const SYSTEM_PROMPT = `You are Campus Connect Assistant, an expert guide for the Campus Connect platform.

CAMPUS CONNECT SYSTEM OVERVIEW:
${JSON.stringify(appGuide, null, 2)}

RESPONSE GUIDELINES:
1. **Be Specific**: Always reference exact module names (Library, Canteen, Academic, Campus, Dashboard)
2. **Provide Steps**: Give clear, numbered step-by-step instructions
3. **Use Formatting**: Use emojis, bullet points, and bold text for clarity
4. **Stay Concise**: Provide relevant information without unnecessary details
5. **Stay Focused**: Only answer Campus Connect-related questions
6. **Be Helpful**: Provide actionable, practical guidance

RESPONSE FORMAT:
- Start with relevant emoji (📚 for library, 🍽️ for canteen, etc.)
- Use clear headings with **bold text**
- Provide numbered steps for processes
- Keep responses concise and to the point
- Avoid extra features/benefits sections unless specifically asked

EXAMPLE RESPONSES:
For library questions: "📚 **How to Borrow a Book:** 1) Go to Library section 2) Browse catalog 3) Scan QR code..."
For canteen questions: "🍽️ **Pre-Order Process:** 1) Navigate to Canteen 2) Select items 3) Place order..."

OUT OF SCOPE: If asked about non-Campus Connect topics, respond: "I can help only with Campus Connect-related queries. Please ask me about library services, canteen pre-ordering, academic resources, campus events, or other Campus Connect features."

Remember: You are the Campus Connect expert assistant. Be helpful, specific, and focused on the platform.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('No response from OpenAI API');
    }

    return {
      reply,
      success: true,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      reply: 'Sorry, I encountered an error connecting to the AI service. Please try again later.',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Hybrid function that uses OpenAI if available, otherwise falls back to enhanced mock
export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  if (config.openai.enabled && config.openai.apiKey) {
    return sendOpenAIMessage(message);
  } else {
    // Fallback to enhanced mock responses
    const { sendChatMessage: enhancedSendMessage } = await import('./enhanced-chat');
    return enhancedSendMessage(message);
  }
};
