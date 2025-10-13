
import { useState, useEffect, useCallback } from 'react';
import { Feedback, FeedbackCategory } from '../types';
import { 
    getFeedback as fetchFeedback, 
    addFeedback as postFeedback, 
    deleteFeedback as postDeleteFeedback,
    toggleFeedbackImportance as postToggleImportance,
} from '../services/feedbackService';

export const useFeedback = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedFeedback = await fetchFeedback();
      setFeedbackList(fetchedFeedback);
    } catch (err) {
      setError('Failed to fetch feedback.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const addFeedback = useCallback(async (feedbackData: { category: FeedbackCategory; message: string }) => {
    try {
      const newFeedback = await postFeedback(feedbackData);
      setFeedbackList(prevFeedback => [newFeedback, ...prevFeedback]);
    } catch (err) {
      setError('Failed to add feedback.');
      console.error(err);
    }
  }, []);
  
  const deleteFeedback = useCallback(async (feedbackId: number) => {
    try {
      await postDeleteFeedback(feedbackId);
      setFeedbackList(prevFeedback => prevFeedback.filter(f => f.id !== feedbackId));
    } catch (err) {
      setError('Failed to delete feedback.');
      console.error(err);
      throw err;
    }
  }, []);

  const toggleFeedbackImportance = useCallback(async (feedbackId: number) => {
    try {
      const updatedFeedback = await postToggleImportance(feedbackId);
      setFeedbackList(prevList => 
        prevList.map(item => item.id === feedbackId ? updatedFeedback : item)
      );
    } catch (err) {
       setError('Failed to update feedback importance.');
       console.error(err);
       throw err;
    }
  }, []);
  
  return { feedbackList, isLoading, error, addFeedback, deleteFeedback, toggleFeedbackImportance };
};