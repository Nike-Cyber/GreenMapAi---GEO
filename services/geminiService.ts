import { Report, Feedback, FeedbackCategory, NewsArticle, ChatMessage } from "../types";

// This is a centralized function to communicate with our backend API proxy.
// It simplifies making requests and handling errors.
async function callApi(task: string, payload: any) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, payload }),
    });

    // For non-streaming JSON responses, check for errors and parse the message.
    if (!response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
        const errorData = await response.json().catch(() => ({ error: `API Error: ${response.statusText}` }));
        throw new Error(errorData.error || `An unknown API error occurred.`);
    }
    
    // For streaming or other non-JSON errors, throw a generic error.
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
}


export const getChatbotResponse = async (
    message: string, 
    history: Omit<ChatMessage, 'id' | 'isTyping'>[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
): Promise<void> => {
    try {
        const response = await callApi('getChatbotResponse', { message, history });
        
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Failed to get response body reader.');
        }

        const decoder = new TextDecoder();
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            onChunk(decoder.decode(value, { stream: true }));
        }
        onComplete();
    } catch (error) {
        console.error("Chatbot streaming error:", error);
        onError(error as Error);
    }
};

export const getAiAnalysis = async (reports: Report[]): Promise<string> => {
    try {
        const response = await callApi('getAiAnalysis', { reports });
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error("Error generating AI analysis:", error);
        // Let the view component handle the specific error message
        throw error;
    }
};

export const generateAiFeedbackSuggestions = async (existingFeedback: Feedback[]): Promise<{ category: FeedbackCategory; message:string } | null> => {
  try {
    const response = await callApi('generateAiFeedbackSuggestions', { existingFeedback });
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error generating AI feedback suggestions:", error);
    return null;
  }
};

export const generateGeneralAiFeedbackSuggestion = async (): Promise<{ category: FeedbackCategory; message: string } | null> => {
  try {
    const response = await callApi('generateGeneralAiFeedbackSuggestion', {});
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error generating general AI feedback suggestion:", error);
    return null;
  }
};

export const getAiNewsArticles = async (): Promise<Omit<NewsArticle, 'id'>[]> => {
  try {
    const response = await callApi('getAiNewsArticles', {});
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching AI news articles:", error);
    // The error will be caught by the calling hook (useNews) and displayed in the UI.
    throw error;
  }
};
