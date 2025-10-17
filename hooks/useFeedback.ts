
import { useState, useEffect, useCallback } from 'react';
import { Feedback, FeedbackCategory } from '../types';
import { 
    getFeedback as fetchFeedback, 
    addFeedback as postFeedback, 
    deleteFeedback as postDeleteFeedback,
    toggleFeedbackImportance as postToggleImportance,
} from '../services/feedbackService';
import { useError } from '../contexts/ErrorContext';

export const useFeedback = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showError } = useError();

  const loadFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedFeedback = await fetchFeedback();
      setFeedbackList(fetchedFeedback);
    } catch (err) {
      showError('Failed to fetch feedback.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const addFeedback = useCallback(async (feedbackData: { category: FeedbackCategory; message: string }) => {
    try {
      const newFeedback = await postFeedback(feedbackData);
      setFeedbackList(prevFeedback => [newFeedback, ...prevFeedback]);
    } catch (err) {
      showError('Failed to add feedback.');
      console.error(err);
    }
  }, [showError]);
  
  const deleteFeedback = useCallback(async (feedbackId: number) => {
    try {
      await postDeleteFeedback(feedbackId);
      setFeedbackList(prevFeedback => prevFeedback.filter(f => f.id !== feedbackId));
    } catch (err) {
      showError('Failed to delete feedback.');
      console.error(err);
      throw err;
    }
  }, [showError]);

  const toggleFeedbackImportance = useCallback(async (feedbackId: number) => {
    try {
      const updatedFeedback = await postToggleImportance(feedbackId);
      setFeedbackList(prevList => 
        prevList.map(item => item.id === feedbackId ? updatedFeedback : item)
      );
    } catch (err) {
       showError('Failed to update feedback importance.');
       console.error(err);
       throw err;
    }
  }, [showError]);
  
  return { feedbackList, isLoading, addFeedback, deleteFeedback, toggleFeedbackImportance };
};