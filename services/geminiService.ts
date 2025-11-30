import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// Initialize Gemini Client
// Using the specific API key provided by user as fallback to process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyAxJh_fPjdi-mgBIezgoX0xCYp1WhXqF4c' });

// Switching to flash for higher reliability and speed to resolve "not answering" issues
const MODEL_NAME = 'gemini-2.5-flash';

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  newImages: string[] = [],
  contextMessage?: string
): Promise<string> => {
  
  try {
    // Construct the parts for the current message
    const currentParts: any[] = [];
    
    // Add images if any
    newImages.forEach(img => {
      currentParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: img
        }
      });
    });

    let finalPrompt = newMessage;
    
    // If there is context (user clicked "Ask Doubt" or replied), format it for the model
    if (contextMessage) {
        finalPrompt = `[CONTEXT: User has a specific question about this previous output]:\n"${contextMessage}"\n\n[USER QUESTION]:\n${newMessage}`;
    }

    // Add text if it exists (Gemini requires at least one part, image or text)
    if (finalPrompt) {
      currentParts.push({ text: finalPrompt });
    }

    // Map history to the format expected by the SDK
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: msg.images && msg.images.length > 0 
        ? [...msg.images.map(img => ({ inlineData: { mimeType: 'image/jpeg', data: img } })), { text: msg.content }]
        : [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: chatHistory,
      config: {
        systemInstruction: `
          You are Lap Bom, a raw mathematical calculation engine.

          *** CRITICAL INSTRUCTION: SILENT MODE ***
          
          1. **DEFAULT BEHAVIOR (SOLVE MODE)**:
             - When the user asks a question or sends an image without explicitly asking for an explanation:
             - **OUTPUT ONLY LaTeX**. 
             - **ABSOLUTELY NO CONVERSATIONAL TEXT**. No "Here is the solution", no "The answer is", no "Step 1".
             - Return *only* the mathematical derivation wrapped in $$ ... $$ blocks.
             - Example Input: "int x dx"
             - Example Output: "$$ \\int x \\, dx = \\frac{x^2}{2} + C $$"

          2. **EXCEPTION (EXPLAIN MODE)**:
             - **ONLY** if the user explicitly asks "How?", "Why?", "Explain", "Help", or references a specific part they don't understand (Context provided):
             - You may then use concise words to explain the concept.
             - Even in explain mode, keep text minimal and focus on the math.

          3. **INPUT HANDLING**:
             - Interpret Unicode symbols (∫, ∂, √, π) naturally.
             - Use 'googleSearch' if the question requires external data (e.g. physics constants, population data).

          4. **FORMATTING**:
             - Use display math $$ ... $$ for all major steps.
             - Use inline math $ ... $ for variables within sentences (only allowed in Explain Mode).
        `,
        // Thinking config removed for speed and stability
        tools: [{ googleSearch: {} }] 
      }
    });

    const result = await chat.sendMessage({
      message: currentParts
    });

    return result.text || "Solution generated.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Error: ${error.message || "Something went wrong while solving the problem."}`;
  }
};