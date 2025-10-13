
import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { useNews } from '../hooks/useNews';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import { FaPlus, FaTrash } from 'react-icons/fa';

const NewsCard: React.FC<{ article: NewsArticle; isAdmin: boolean; onDeleteClick: (article: NewsArticle) => void; }> = ({ article, isAdmin, onDeleteClick }) => (
    <Card className="flex flex-col overflow-hidden h-full transition-transform transform hover:scale-105 hover:shadow-xl relative group">
        <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
        {isAdmin && (
            <button
                onClick={() => onDeleteClick(article)}
                className="absolute top-2 right-2 z-10 p-2 bg-white/70 text-earth-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
                aria-label="Delete article"
            >
                <FaTrash />
            </button>
        )}
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-forest-green dark:text-dark-text mb-2">{article.title}</h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">
                {article.source} - <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
            </p>
            <p className="text-gray-700 dark:text-gray-300 flex-grow mb-4">{article.summary}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lime-green hover:text-forest-green dark:text-light-green dark:hover:text-lime-green self-start">
                Read More &rarr;
            </a>
        </div>
    </Card>
);

const AddNewsForm: React.FC<{
    onAddNews: (data: Omit<NewsArticle, 'id' | 'publishedAt'>) => Promise<void>;
    onDone: () => void;
}> = ({ onAddNews, onDone }) => {
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [summary, setSummary] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAddNews({ title, source, summary, imageUrl, url });
        setIsSubmitting(false);
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Global Reforestation Efforts" required />
            <Input id="source" label="Source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g., Eco Watch" required />
            <div>
                <label htmlFor="summary" className="block text-sm font-medium text-forest-green dark:text-dark-text-secondary mb-1">Summary</label>
                <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="w-full px-3 py-2 border border-lime-green/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-green transition bg-white dark:bg-gray-700 dark:text-dark-text dark:border-gray-600" placeholder="A short summary of the article..." required></textarea>
            </div>
            <Input id="imageUrl" label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" placeholder="https://images.unsplash.com/..." required />
            <Input id="url" label="Article URL ('Read More' link)" value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://example.com/article" required />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Article'}
            </Button>
        </form>
    );
};

interface NewsViewProps {
    isAdmin: boolean;
}

const NewsView: React.FC<NewsViewProps> = ({ isAdmin }) => {
    const { articles, isLoading, addNews, deleteNews } = useNews();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAddNews = async (articleData: Omit<NewsArticle, 'id' | 'publishedAt'>) => {
        try {
            await addNews(articleData);
        } catch (error) {
            console.error("Failed to add news article:", error);
        }
    };

    const openDeleteConfirm = (article: NewsArticle) => {
        setArticleToDelete(article);
    };

    const closeDeleteConfirm = () => {
        setArticleToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (articleToDelete) {
            setIsDeleting(true);
            try {
                await deleteNews(articleToDelete.id);
                closeDeleteConfirm();
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">Environmental News</h1>
                    <p className="text-lg text-lime-green dark:text-light-green mt-1">Stay informed on the latest eco-friendly updates.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 self-start sm:self-center">
                    <FaPlus />
                    <span>Add News Article</span>
                </Button>
            </header>

            {isLoading ? (
                <div className="text-center py-10">
                    <p className="dark:text-dark-text-secondary">Loading news...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map(article => (
                        <NewsCard key={article.id} article={article} isAdmin={isAdmin} onDeleteClick={openDeleteConfirm} />
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New News Article">
                <AddNewsForm onAddNews={handleAddNews} onDone={() => setIsModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={!!articleToDelete} onClose={closeDeleteConfirm} title="Confirm Deletion">
                {articleToDelete && (
                    <div className="text-center">
                        <p className="text-lg text-gray-700 dark:text-dark-text-secondary mb-4">
                            Are you sure you want to delete the article "<span className="font-bold">{articleToDelete.title}</span>"?
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <Button variant="secondary" onClick={closeDeleteConfirm} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="bg-earth-red hover:bg-red-700 focus:ring-earth-red"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NewsView;
