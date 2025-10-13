
import { Feedback, FeedbackCategory, FeedbackStatus } from '../types';

const mockFeedback: Feedback[] = [
    {
        id: 1,
        user: { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        category: FeedbackCategory.Feature,
        message: 'It would be great to have different map layers, like a satellite view or a terrain map!',
        submittedAt: new Date('2023-11-10T10:00:00Z'),
        status: FeedbackStatus.InProgress,
        isImportant: false,
    },
    {
        id: 2,
        user: { name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
        category: FeedbackCategory.Bug,
        message: 'Sometimes the map doesn\'t center on my location when I search for it.',
        submittedAt: new Date('2023-11-12T14:30:00Z'),
        status: FeedbackStatus.Completed,
        isImportant: true,
    },
    {
        id: 3,
        user: { name: 'Diana Miller', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
        category: FeedbackCategory.General,
        message: 'Loving the app! The dark mode is fantastic. Keep up the great work.',
        submittedAt: new Date('2023-11-14T09:00:00Z'),
        status: FeedbackStatus.Received,
        isImportant: false,
    },
];

export const getFeedback = (): Promise<Feedback[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockFeedback]), 300);
    });
};

export const addFeedback = (feedbackData: Omit<Feedback, 'id' | 'submittedAt' | 'user' | 'status'>): Promise<Feedback> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newFeedback: Feedback = {
                ...feedbackData,
                id: mockFeedback.length + 1,
                submittedAt: new Date(),
                user: { name: 'Current User', avatar: 'https://i.pravatar.cc/150?u=currentUser' },
                status: FeedbackStatus.Received,
                isImportant: false,
            };
            mockFeedback.unshift(newFeedback); // Add to the top
            resolve(newFeedback);
        }, 500);
    });
};

export const deleteFeedback = (feedbackId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockFeedback.findIndex(f => f.id === feedbackId);
            if (index !== -1) {
                mockFeedback.splice(index, 1);
                resolve();
            } else {
                reject(new Error('Feedback not found'));
            }
        }, 500);
    });
};

export const toggleFeedbackImportance = (feedbackId: number): Promise<Feedback> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const feedback = mockFeedback.find(f => f.id === feedbackId);
            if (feedback) {
                feedback.isImportant = !feedback.isImportant;
                resolve(feedback);
            } else {
                reject(new Error('Feedback not found'));
            }
        }, 300);
    });
}