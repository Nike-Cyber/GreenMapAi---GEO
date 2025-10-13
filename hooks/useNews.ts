
import { useState, useEffect, useCallback } from 'react';
import { NewsArticle } from '../types';
import { getNews as fetchNews, addNews as postNews, deleteNews as postDeleteNews } from '../services/newsService';

export const useNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedNews = await fetchNews();
      setArticles(fetchedNews);
    } catch (err) {
      setError('Failed to fetch news articles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const addNews = useCallback(async (articleData: Omit<NewsArticle, 'id' | 'publishedAt'>) => {
    try {
      const newArticle = await postNews(articleData);
      setArticles(prevArticles => [newArticle, ...prevArticles]);
    } catch (err) {
      setError('Failed to add news article.');
      console.error(err);
      throw err;
    }
  }, []);

  const deleteNews = useCallback(async (articleId: number) => {
    try {
      await postDeleteNews(articleId);
      setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
    } catch (err) {
      setError('Failed to delete news article.');
      console.error(err);
      throw err;
    }
  }, []);

  return { articles, isLoading, error, addNews, deleteNews };
};
