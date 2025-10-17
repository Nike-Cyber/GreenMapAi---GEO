
import { useState, useEffect, useCallback } from 'react';
import { NewsArticle } from '../types';
import { getNews as fetchNews, addNews as postNews, deleteNews as postDeleteNews, replaceNews as postReplaceNews } from '../services/newsService';
import { getAiNewsArticles } from '../services/geminiService';
import { useError } from '../contexts/ErrorContext';

export const useNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showError } = useError();

  const loadNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedNews = await fetchNews();
      setArticles(fetchedNews);
    } catch (err) {
      showError('Failed to fetch news articles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const addNews = useCallback(async (articleData: Omit<NewsArticle, 'id' | 'publishedAt'>) => {
    try {
      const newArticle = await postNews(articleData);
      setArticles(prevArticles => [newArticle, ...prevArticles]);
    } catch (err) {
      showError('Failed to add news article.');
      console.error(err);
      throw err;
    }
  }, [showError]);

  const deleteNews = useCallback(async (articleId: number) => {
    try {
      await postDeleteNews(articleId);
      setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
    } catch (err) {
      showError('Failed to delete news article.');
      console.error(err);
      throw err;
    }
  }, [showError]);
  
  const fetchAiNews = useCallback(async () => {
    try {
      const newArticlesData = await getAiNewsArticles();
      if (newArticlesData && newArticlesData.length > 0) {
        const newArticles = await postReplaceNews(newArticlesData);
        setArticles(newArticles);
      } else {
        showError('The AI could not find any relevant news articles at this time.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI-powered news.';
      showError(errorMessage);
      console.error(err);
      // We don't re-throw, allowing the component to simply finish its loading state.
    }
  }, [showError]);

  return { articles, isLoading, addNews, deleteNews, fetchAiNews };
};
