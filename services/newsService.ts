
import { NewsArticle } from '../types';

const mockNews: NewsArticle[] = [
  {
    id: 1,
    title: 'Global Reforestation Efforts Reach New Heights in 2023',
    source: 'Eco Watch',
    publishedAt: '2023-11-15',
    summary: 'A new report indicates that coordinated global efforts have led to a 15% increase in reforestation projects compared to the previous year, with community-led initiatives playing a crucial role.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800',
    url: '#',
  },
  {
    id: 2,
    title: 'Innovative Technology Turns Plastic Waste into Building Materials',
    source: 'GreenTech Today',
    publishedAt: '2023-11-14',
    summary: 'A startup in California has developed a groundbreaking process to convert non-recyclable plastics into durable, low-cost bricks for construction, tackling two environmental problems at once.',
    imageUrl: 'https://images.unsplash.com/photo-1611289041253-29e634d5f2a4?q=80&w=800',
    url: '#',
  },
  {
    id: 3,
    title: 'Urban Gardens Are Cooling Cities and Improving Food Security',
    source: 'Urban Ecology Magazine',
    publishedAt: '2023-11-12',
    summary: 'Across major metropolitan areas, community gardens and rooftop farms are helping to reduce the urban heat island effect while providing fresh, local produce to residents.',
    imageUrl: 'https://images.unsplash.com/photo-1599785237562-f10557870026?q=80&w=800',
    url: '#',
  },
   {
    id: 4,
    title: 'Major Breakthrough in Ocean Cleanup Technology',
    source: 'Oceanic Preservation Society',
    publishedAt: '2023-11-10',
    summary: 'A new fleet of autonomous drones has been successfully deployed in the Great Pacific Garbage Patch, collecting plastic waste at a rate ten times faster than previous methods.',
    imageUrl: 'https://images.unsplash.com/photo-1621489422018-b21f0a153283?q=80&w=800',
    url: '#',
  }
];

export const getNews = (): Promise<NewsArticle[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockNews]);
    }, 500); // Simulate network delay
  });
};

export const addNews = (articleData: Omit<NewsArticle, 'id' | 'publishedAt'>): Promise<NewsArticle> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newArticle: NewsArticle = {
                ...articleData,
                id: mockNews.reduce((maxId, article) => Math.max(article.id, maxId), 0) + 1,
                publishedAt: new Date().toISOString().split('T')[0],
            };
            mockNews.unshift(newArticle);
            resolve(newArticle);
        }, 500);
    });
};

export const deleteNews = (newsId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockNews.findIndex(n => n.id === newsId);
      if (index !== -1) {
        mockNews.splice(index, 1);
        resolve();
      } else {
        reject(new Error('News article not found'));
      }
    }, 500);
  });
};

export const replaceNews = (articlesData: Omit<NewsArticle, 'id'>[]): Promise<NewsArticle[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockNews.length = 0; // Clear the array
            let idCounter = 0;
            for (const articleData of articlesData) {
                const newArticle: NewsArticle = {
                    ...articleData,
                    id: ++idCounter,
                };
                mockNews.push(newArticle);
            }
            resolve([...mockNews].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
        }, 500);
    });
};
