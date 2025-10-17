import { GoogleGenAI, Type } from "@google/genai";
import { Report, Feedback, FeedbackCategory, ChatMessage } from '../types';

// The API key is sourced from the environment variables,
// ensuring a secure and standardized deployment process.
// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This function will handle all incoming requests to /api/gemini
export default async function handler(req: any, res: any) {
    if (!process.env.API_KEY) {
         return res.status(500).json({ error: 'API key not configured on the server.' });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { task, payload } = req.body;

    try {
        switch (task) {
            // --- AI CHATBOT ---
            case 'getChatbotResponse': {
                const { message, history } = payload as { message: string, history: Omit<ChatMessage, 'id' | 'isTyping'>[] };
                const contents = [
                    ...history.map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }]
                    })),
                    { role: 'user', parts: [{ text: message }] }
                ];

                const responseStream = await ai.models.generateContentStream({
                    model: "gemini-2.5-flash",
                    contents: contents,
                    config: {
                        systemInstruction: "You are GreenBot, a helpful and friendly AI assistant for the GreenMap application. GreenMap is a tool for users to report and visualize environmental data like tree plantations and pollution hotspots. Your goal is to answer user questions about environmental topics, provide information about GreenMap's features, and encourage community participation in making the world greener. Keep your responses concise, positive, and helpful.",
                        temperature: 0.5, // Lowered for potentially faster, more deterministic responses
                        topP: 0.95,
                        thinkingConfig: { thinkingBudget: 0 } // For faster, conversational responses
                    },
                });

                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.setHeader('Transfer-Encoding', 'chunked');

                for await (const chunk of responseStream) {
                    if (chunk.text) {
                        res.write(chunk.text);
                    }
                }
                res.end();
                return; // End execution for streaming response
            }

            // --- AI REPORT ANALYSIS ---
            case 'getAiAnalysis': {
                const { reports } = payload as { reports: Report[] };
                 const analysisPrompt = `
                    As an expert environmental data analyst for GreenMap, analyze the following user-submitted report data.
                    Provide a concise, insightful summary in Markdown format. Your response should be HTML-compatible.

                    Your analysis must include these sections:
                    1.  **Overall Summary:** A brief overview of the total reports, highlighting the ratio of tree plantations to pollution hotspots.
                    2.  **Key Trends:** Identify any emerging patterns. Are there clusters of pollution reports in specific areas? Is there a surge in tree planting activities during certain times?
                    3.  **Areas of Concern:** Point out the most critical pollution hotspots based on user descriptions.
                    4.  **Positive Highlights:** Celebrate the most significant tree plantation efforts.
                    5.  **Actionable Suggestions:** Based on the data, suggest 2-3 simple actions for the GreenMap community (e.g., "Focus cleanup efforts near Oakland Estuary," or "Organize a tree planting event in the most reported barren area.").

                    Data (JSON format):
                    ${JSON.stringify(reports.map(r => ({type: r.type, location: r.location, description: r.description, date: new Date(r.reportedAt).toISOString().substring(0, 10)})), null, 2)}
                `;

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: analysisPrompt,
                     config: {
                        temperature: 0.5,
                    },
                });
                res.status(200).json({ result: response.text ?? '' });
                break;
            }
            
            // --- AI FEEDBACK SYNTHESIS (ADMIN) ---
            case 'generateAiFeedbackSuggestions': {
                const { existingFeedback } = payload as { existingFeedback: Feedback[] };
                if (existingFeedback.length === 0) {
                     res.status(200).json({ result: {
                        category: FeedbackCategory.Feature,
                        message: "Since there's no feedback yet, how about adding a 'Community Events' feature where users can organize clean-ups or tree plantings through the app?"
                    }});
                    return;
                }
                
                const prompt = `
                    You are an expert product manager for GreenMap, an app for reporting tree plantations and pollution.
                    Analyze the following user feedback and synthesize it into a single, insightful, and actionable new feedback item that addresses the core themes.
                    Return a single JSON object with "category" and "message" keys.

                    Existing Feedback:
                    ${JSON.stringify(existingFeedback)}
                `;
                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                       category: { type: Type.STRING, enum: Object.values(FeedbackCategory) },
                       message: { type: Type.STRING, description: 'The detailed, synthesized feedback message.' }
                    },
                    required: ['category', 'message']
                };

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema },
                });
                
                const text = response.text;
                if (!text) {
                    throw new Error("AI returned an empty response for feedback synthesis.");
                }
                res.status(200).json({ result: JSON.parse(text.trim()) });
                break;
            }

            // --- AI FEEDBACK SUGGESTION (GENERAL) ---
            case 'generateGeneralAiFeedbackSuggestion': {
                 const prompt = `
                    You are a creative user of "GreenMap", an app for reporting tree plantations and pollution.
                    Come up with one creative and helpful feedback suggestion for the GreenMap team.
                    Return the feedback as a single JSON object with "category" and "message" keys.
                `;
                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, enum: Object.values(FeedbackCategory) },
                        message: { type: Type.STRING, description: 'The detailed, helpful feedback message.' }
                    },
                    required: ['category', 'message']
                };
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema },
                });

                const text = response.text;
                if (!text) {
                    throw new Error("AI returned an empty response for general feedback suggestion.");
                }
                res.status(200).json({ result: JSON.parse(text.trim()) });
                break;
            }

            // --- AI NEWS ARTICLES ---
            case 'getAiNewsArticles': {
                const prompt = `
                    Using Google Search, find the top 4 latest and most relevant news articles about community-led environmental efforts, reforestation, or pollution cleanup.
                    For each article, provide a title, source, summary, URL, a high-quality image URL, and publication date.
                    Parse this information and return it as a JSON array of objects.
                `;
                 const responseSchema = {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            source: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            url: { type: Type.STRING },
                            imageUrl: { type: Type.STRING },
                            publishedAt: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
                        },
                        required: ["title", "source", "summary", "url", "imageUrl", "publishedAt"]
                    }
                };

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: { 
                        tools: [{ googleSearch: {} }],
                        responseMimeType: "application/json",
                        responseSchema: responseSchema,
                    },
                });

                const text = response.text;
                if (!text) {
                    throw new Error("AI returned an empty response for news articles.");
                }
                const articles = JSON.parse(text.trim());
                res.status(200).json({ result: articles });
                break;
            }

            default:
                return res.status(400).json({ error: `Unknown task: ${task}` });
        }
    } catch (error: any) {
        console.error(`Error in /api/gemini for task: ${task}`, error);
        res.status(500).json({ error: error.message || 'An error occurred while processing your request with the AI.' });
    }
}