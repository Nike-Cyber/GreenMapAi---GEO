import { Report, Feedback, FeedbackCategory, NewsArticle, ChatMessage } from "../types";

// A single, reusable function to call our serverless API backend for non-streaming tasks.
async function callApi(task: string, payload: any) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task, payload }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: "An unknown API error occurred." }));
            console.error(`API Error (${response.status}):`, errorBody);
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error(`Failed to call API task '${task}':`, error);
        throw error;
    }
}

export const getChatbotResponse = async (
    message: string, 
    history: Omit<ChatMessage, 'id' | 'isTyping'>[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
): Promise<void> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                task: 'getChatbotResponse', 
                payload: { message, history } 
            }),
        });

        if (!response.ok || !response.body) {
            const errorBody = await response.json().catch(() => ({ error: "An unknown API error occurred." }));
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const read = async () => {
            const { done, value } = await reader.read();
            if (done) {
                onComplete();
                return;
            }
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
            await read(); // Continue reading
        };
        
        await read();

    } catch (error) {
        console.error("Chatbot streaming error:", error);
        onError(error as Error);
    }
};

export const getAiAnalysis = async (reports: Report[]): Promise<string> => {
    try {
        return await callApi('getAiAnalysis', { reports });
    } catch (error) {
        return "An error occurred while generating the analysis. It seems my circuits are a bit tangled. Please try again later.";
    }
};

export const generateAiFeedbackSuggestions = async (existingFeedback: Feedback[]): Promise<{ category: FeedbackCategory; message: string } | null> => {
  try {
    return await callApi('generateAiFeedbackSuggestions', { existingFeedback });
  } catch (error) {
    console.error("Error generating AI feedback suggestions:", error);
    return null;
  }
};

export const generateGeneralAiFeedbackSuggestion = async (): Promise<{ category: FeedbackCategory; message: string } | null> => {
  try {
    return await callApi('generateGeneralAiFeedbackSuggestion', {});
  } catch (error) {
    console.error("Error generating general AI feedback suggestion:", error);
    return null;
  }
};

export const getAiNewsArticles = async (): Promise<Omit<NewsArticle, 'id'>[]> => {
  try {
    const articles = await callApi('getAiNewsArticles', {});
    return articles || []; // Ensure it returns an array even if the result is null/undefined
  } catch (error) {
    console.error("Error fetching AI news articles from API backend:", error);
    // The error will be caught by the calling hook (useNews) and displayed in the UI.
    throw error;
  }
};