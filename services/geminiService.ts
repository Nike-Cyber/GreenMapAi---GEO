

import { GoogleGenAI, Type } from "@google/genai";
import { Report, Feedback, FeedbackCategory } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Chatbot and AI Analysis functionality will be limited.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const chatbotSystemInstruction = `You are "Leafy", a friendly and helpful AI assistant for the GreenMap application. Your goal is to provide concise, positive, and informative answers related to environmental topics, conservation, and how to use the GreenMap app. Keep your responses short and encouraging. If asked about something unrelated, gently steer the conversation back to environmental themes. You can use emojis to make your tone more friendly. 🌱🌍♻️`;

export const getChatbotResponse = async (message: string): Promise<string> => {
  if (!API_KEY) {
    return "Hello! I'm Leafy, your eco-assistant. My connection to my AI brain is currently offline, but I'm here to help you navigate GreenMap!";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: chatbotSystemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return "Oops! I seem to have lost my train of thought. Could you please ask me again?";
  }
};

export const getAiAnalysis = async (reports: Report[]): Promise<string> => {
    if (!API_KEY) {
        return "AI Analysis is currently unavailable. Please check the API key configuration.";
    }

    const analysisPrompt = `
        As an expert environmental data analyst for GreenMap, analyze the following user-submitted report data.
        Provide a concise, insightful summary in Markdown format.

        Your analysis should include:
        1.  **Overall Summary:** A brief overview of the total reports, highlighting the ratio of tree plantations to pollution hotspots.
        2.  **Key Trends:** Identify any emerging patterns. Are there clusters of pollution reports in specific areas? Is there a surge in tree planting activities during certain times?
        3.  **Areas of Concern:** Point out the most critical pollution hotspots based on user descriptions.
        4.  **Positive Highlights:** Celebrate the most significant tree plantation efforts.
        5.  **Actionable Suggestions:** Based on the data, suggest 2-3 simple actions for the GreenMap community (e.g., "Focus cleanup efforts near Oakland Estuary," or "Organize a tree planting event in the most reported barren area.").

        Here is the data (in JSON format):
        ${JSON.stringify(reports.map(r => ({type: r.type, location: r.location, description: r.description, date: r.reportedAt.toISOString().split('T')[0]})), null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: analysisPrompt,
             config: {
                temperature: 0.5,
                topP: 0.95,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI analysis from Gemini API:", error);
        return "An error occurred while generating the analysis. It seems my circuits are a bit tangled. Please try again later.";
    }
};

export const generateAiFeedbackSuggestions = async (existingFeedback: Feedback[]): Promise<{ category: FeedbackCategory; message: string } | null> => {
  if (!API_KEY) {
    console.warn("Gemini API key not found. AI suggestions are disabled.");
    return null;
  }
  if (existingFeedback.length === 0) {
    // Cannot synthesize from nothing, return a default suggestion.
    return {
        category: FeedbackCategory.Feature,
        message: "Since there's no feedback yet, how about adding a 'Community Events' feature where users can organize clean-ups or tree plantings through the app?"
    };
  }

  const prompt = `
    You are an expert product manager for a web app called "GreenMap". The app allows users to report tree plantations and pollution hotspots on a map.
    
    You have been given a list of raw user feedback. Your task is to analyze all of it and synthesize it into a single, insightful, and actionable new feedback item. This new item should represent a meta-idea, a solution to a recurring theme, or a logical next step based on the existing user comments.
    
    For example, if multiple users mention map issues, you could suggest a "Comprehensive Map Tools Upgrade" feature. If users are requesting social features, you could suggest "Gamification with Badges and Points".
    
    Here is the existing user feedback:
    ${JSON.stringify(existingFeedback.map(f => ({ category: f.category, message: f.message })))}
    
    Based on this, generate one new feedback item. The category should be 'Feature Request' if it's a new idea, or 'General Feedback' if it's a summary or meta-comment. The message should be well-written, as if from a power user who has thought deeply about the app.
    
    Return the feedback as a single JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: `The category of the feedback. Must be one of: "${FeedbackCategory.Feature}", "${FeedbackCategory.Bug}", or "${FeedbackCategory.General}".`
      },
      message: {
        type: Type.STRING,
        description: 'The detailed, synthesized feedback message.'
      }
    },
    required: ['category', 'message']
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const suggestion = JSON.parse(jsonText);
    
    if (suggestion && 
        suggestion.category && 
        Object.values(FeedbackCategory).includes(suggestion.category) && 
        suggestion.message) {
      return suggestion as { category: FeedbackCategory; message: string };
    }
    return null;
  } catch (error) {
    console.error("Error generating AI feedback suggestions:", error);
    return null;
  }
};

export const generateGeneralAiFeedbackSuggestion = async (): Promise<{ category: FeedbackCategory; message: string } | null> => {
  if (!API_KEY) {
    console.warn("Gemini API key not found. AI suggestions are disabled.");
    return null;
  }

  const prompt = `
    You are an expert product user for a web app called "GreenMap". The app allows users to report tree plantations and pollution hotspots on a map.
    
    Your task is to come up with one creative and helpful feedback suggestion for the GreenMap team. This could be a new feature idea, a quality-of-life improvement, or a general suggestion.
    
    The feedback should be constructive and well-explained. For example, instead of "add more features", suggest something specific like "It would be great to have a 'Community Events' section where users can organize local clean-ups or tree planting gatherings."
    
    Return the feedback as a single JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: `The category of the feedback. Must be one of: "${FeedbackCategory.Feature}", "${FeedbackCategory.Bug}", or "${FeedbackCategory.General}".`
      },
      message: {
        type: Type.STRING,
        description: 'The detailed, helpful feedback message.'
      }
    },
    required: ['category', 'message']
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const suggestion = JSON.parse(jsonText);
    
    if (suggestion && 
        suggestion.category && 
        Object.values(FeedbackCategory).includes(suggestion.category) && 
        suggestion.message) {
      return suggestion as { category: FeedbackCategory; message: string };
    }
    return null;
  } catch (error) {
    console.error("Error generating general AI feedback suggestion:", error);
    return null;
  }
};
