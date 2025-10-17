import { GoogleGenAI, Type } from "@google/genai";
import { Report, Feedback, FeedbackCategory, NewsArticle, ChatMessage } from "../types";

// Per your request, the API key is hardcoded and will not be removed.
const ai = new GoogleGenAI({ apiKey: "AIzaSyDbtfQcsPNucoeTcXibPH6BRh2eUagrch4" });


export const getChatbotResponse = async (message: string, history: Omit<ChatMessage, 'id' | 'isTyping'>[]): Promise<string> => {
    try {
        const contents = [
            ...history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: "You are GreenBot, a helpful and friendly AI assistant for the GreenMap application. GreenMap is a tool for users to report and visualize environmental data like tree plantations and pollution hotspots. Your goal is to answer user questions about environmental topics, provide information about GreenMap's features, and encourage community participation in making the world greener. Keep your responses concise, positive, and helpful.",
                temperature: 0.7,
                topP: 0.95,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching chatbot response from Gemini API:", error);
        return "I'm having a little trouble connecting to my circuits right now. Please try again in a moment.";
    }
};

export const getAiAnalysis = async (reports: Report[]): Promise<string> => {
    const analysisPrompt = `
        As an expert environmental data analyst for GreenMap, analyze the following user-submitted report data.
        Provide a concise, insightful summary in Markdown format.

        Your analysis should include:
        1.  *Overall Summary:* A brief overview of the total reports, highlighting the ratio of tree plantations to pollution hotspots.
        2.  *Key Trends:* Identify any emerging patterns. Are there clusters of pollution reports in specific areas? Is there a surge in tree planting activities during certain times?
        3.  *Areas of Concern:* Point out the most critical pollution hotspots based on user descriptions.
        4.  *Positive Highlights:* Celebrate the most significant tree plantation efforts.
        5.  *Actionable Suggestions:* Based on the data, suggest 2-3 simple actions for the GreenMap community (e.g., "Focus cleanup efforts near Oakland Estuary," or "Organize a tree planting event in the most reported barren area.").

        Here is the data (in JSON format):
        ${JSON.stringify(reports.map(r => ({type: r.type, location: r.location, description: r.description, date: r.reportedAt.toISOString().split('T')[0]})), null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
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
  if (existingFeedback.length === 0) {
    return {
        category: FeedbackCategory.Feature,
        message: "Since there's no feedback yet, how about adding a 'Community Events' feature where users can organize clean-ups or tree plantings through the app?"
    };
  }

  const prompt = `
    You are an expert product manager for a web app called "GreenMap". The app allows users to report tree plantations and pollution hotspots on a map.
    You have been given a list of raw user feedback. Your task is to analyze all of it and synthesize it into a single, insightful, and actionable new feedback item.
    Return the feedback as a single JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: `The category of the feedback. Must be one of: "${FeedbackCategory.Feature}", "${FeedbackCategory.Bug}", or "${FeedbackCategory.General}".` },
      message: { type: Type.STRING, description: 'The detailed, synthesized feedback message.' }
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

    const suggestion = JSON.parse(response.text.trim());
    if (suggestion && suggestion.category && Object.values(FeedbackCategory).includes(suggestion.category) && suggestion.message) {
      return suggestion;
    }
    return null;
  } catch (error) {
    console.error("Error generating AI feedback suggestions:", error);
    return null;
  }
};

export const generateGeneralAiFeedbackSuggestion = async (): Promise<{ category: FeedbackCategory; message: string } | null> => {
  const prompt = `
    You are an expert product user for a web app called "GreenMap". The app allows users to report tree plantations and pollution hotspots on a map.
    Your task is to come up with one creative and helpful feedback suggestion for the GreenMap team.
    Return the feedback as a single JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: `The category of the feedback. Must be one of: "${FeedbackCategory.Feature}", "${FeedbackCategory.Bug}", or "${FeedbackCategory.General}".` },
      message: { type: Type.STRING, description: 'The detailed, helpful feedback message.' }
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
    
    const suggestion = JSON.parse(response.text.trim());
    if (suggestion && suggestion.category && Object.values(FeedbackCategory).includes(suggestion.category) && suggestion.message) {
      return suggestion;
    }
    return null;
  } catch (error) {
    console.error("Error generating general AI feedback suggestion:", error);
    return null;
  }
};

export const getAiNewsArticles = async (): Promise<Omit<NewsArticle, 'id'>[]> => {
  const prompt = `
    Fetch the top 4 latest and most important environmental news articles from the web.
    For each article, provide the following information in this exact format, with each field on a new line:

    TITLE: [Article Title]
    SOURCE: [News Source]
    URL: [Article URL]
    PUBLISHED_AT: [Publication date in YYYY-MM-DD format]
    SUMMARY: [A concise one or two-sentence summary of the article.]
    IMAGE_URL: [A relevant, publicly accessible, high-quality image URL for the article.]

    Separate each article with "---".
    Do not include any other text or introductory phrases in your response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const responseText = response.text;
    const articles: Omit<NewsArticle, 'id'>[] = [];
    const articlesText = responseText.split('---').filter(t => t.trim());

    for (const articleText of articlesText) {
        const lines = articleText.trim().split('\n');
        const articleData: Partial<NewsArticle> = {};
        for (const line of lines) {
            if (line.startsWith('TITLE:')) articleData.title = line.substring(7).trim();
            else if (line.startsWith('SOURCE:')) articleData.source = line.substring(8).trim();
            else if (line.startsWith('URL:')) articleData.url = line.substring(5).trim();
            else if (line.startsWith('PUBLISHED_AT:')) articleData.publishedAt = line.substring(14).trim();
            else if (line.startsWith('SUMMARY:')) articleData.summary = line.substring(9).trim();
            else if (line.startsWith('IMAGE_URL:')) articleData.imageUrl = line.substring(11).trim();
        }

        if (articleData.title && articleData.source && articleData.url && articleData.summary && articleData.imageUrl) {
            articles.push({
                title: articleData.title,
                source: articleData.source,
                publishedAt: articleData.publishedAt || new Date().toISOString().split('T')[0], // Fallback date
                summary: articleData.summary,
                imageUrl: articleData.imageUrl,
                url: articleData.url,
            });
        }
    }
    return articles;

  } catch (error) {
    console.error("Error fetching AI news from Gemini API:", error);
    throw new Error("An error occurred while fetching news from the AI. Please try again later.");
  }
};
