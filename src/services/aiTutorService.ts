const API_KEY = "AIzaSyCpN4C0NYL0sdZ7tKhlZkYA_chSual7Zdk";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Function to preprocess AI response for proper markdown rendering
const preprocessMarkdown = (text: string): string => {
  return text
    // Fix any custom formatting markers
    .replace(/@@([^@]+)@@/g, '**$1**') // Convert custom @@text@@ format to bold
    .replace(/\[\[(.*?)\]\]/g, '`$1`')  // Convert [[text]] to inline code
    
    // Ensure proper spacing for markdown elements
    .replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$1$2$3') // Ensure bold text is properly formatted
    .replace(/(\*|_)(.*?)(\*|_)/g, '$1$2$3')       // Ensure italic text is properly formatted
    
    // Fix code blocks
    .replace(/```(\w*)\s*\n/g, '```$1\n')          // Ensure language is properly set for code blocks
    
    // Add extra line break before and after lists for proper rendering
    .replace(/\n([-*+]|\d+\.)\s/g, '\n\n$1 ')
    .replace(/(\n[-*+]|\d+\.)\s(.*?)(?=\n\n)/g, '$1 $2\n');
};

export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    // Add instructions for the AI to use markdown
    const enhancedPrompt = `${prompt}\n\nPlease format your response using Markdown for readability. Use **bold** for emphasis, headings with #, code blocks with triple backticks, and other markdown formatting as appropriate.`;
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: enhancedPrompt }]
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as GeminiResponse;
    const rawText = data.candidates[0]?.content.parts[0]?.text || "I couldn't generate a response. Please try again.";
    
    // Preprocess the response for proper markdown rendering
    return preprocessMarkdown(rawText);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Sorry, there was an error connecting to the AI service. Please try again later.";
  }
}; 