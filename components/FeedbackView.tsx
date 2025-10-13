
import React, { useState, useMemo } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { Feedback, FeedbackCategory, FeedbackStatus } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { generateAiFeedbackSuggestions, generateGeneralAiFeedbackSuggestion } from '../services/geminiService';
import { FaRobot, FaTrash, FaStar, FaRegStar } from 'react-icons/fa';

// Status Badge Component
const StatusBadge: React.FC<{ status: FeedbackStatus }> = ({ status }) => {
    const statusStyles: { [key in FeedbackStatus]: string } = {
        [FeedbackStatus.Received]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [FeedbackStatus.InProgress]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [FeedbackStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

// Feedback Card Component
const FeedbackCard: React.FC<{ 
    feedback: Feedback; 
    isAdmin: boolean; 
    onDeleteClick: (feedback: Feedback) => void;
    onToggleImportance: (id: number) => void;
}> = ({ feedback, isAdmin, onDeleteClick, onToggleImportance }) => (
    <Card className={`flex flex-col h-full relative group transition-all duration-300 ${feedback.isImportant ? 'border-2 border-yellow-400 dark:border-yellow-500 shadow-lg' : ''}`}>
         <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
                <>
                    <button
                        onClick={() => onToggleImportance(feedback.id)}
                        className="p-2 bg-white/70 rounded-full hover:bg-white hover:scale-110"
                        aria-label="Mark as important"
                    >
                        {feedback.isImportant ? <FaStar className="text-yellow-500" /> : <FaRegStar className="text-gray-600" />}
                    </button>
                    <button
                        onClick={() => onDeleteClick(feedback)}
                        className="p-2 bg-white/70 text-earth-red rounded-full hover:bg-white hover:scale-110"
                        aria-label="Delete feedback"
                    >
                        <FaTrash />
                    </button>
                </>
            )}
        </div>
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
                <img src={feedback.user.avatar} alt={feedback.user.name} className="w-8 h-8 rounded-full mr-3" />
                <div>
                    <p className="font-bold text-forest-green dark:text-dark-text">{feedback.user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">{new Date(feedback.submittedAt).toLocaleString()}</p>
                </div>
            </div>
            <StatusBadge status={feedback.status} />
        </div>
        <p className="font-semibold text-lime-green dark:text-light-green mb-2">{feedback.category}</p>
        <p className="flex-grow text-gray-700 dark:text-dark-text-secondary">{feedback.message}</p>
    </Card>
);

// Feedback Form Component
const FeedbackForm: React.FC<{ onAddFeedback: (data: { category: FeedbackCategory; message: string }) => Promise<void> }> = ({ onAddFeedback }) => {
    const [category, setCategory] = useState<FeedbackCategory>(FeedbackCategory.General);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setIsSubmitting(true);
        await onAddFeedback({ category, message });
        setIsSubmitting(false);
        setIsSubmitted(true);
        setMessage('');
        setCategory(FeedbackCategory.General);
        setTimeout(() => setIsSubmitted(false), 3000); // Reset submitted state after 3s
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="category" className="block text-sm font-medium text-forest-green dark:text-dark-text-secondary mb-1">
                    Category
                </label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full px-3 py-2 border border-lime-green/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-green bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                    <option value={FeedbackCategory.General}>General Feedback</option>
                    <option value={FeedbackCategory.Bug}>Bug Report</option>
                    <option value={FeedbackCategory.Feature}>Feature Request</option>
                </select>
            </div>
            <div>
                <label htmlFor="feedback-message" className="block text-sm font-medium text-forest-green dark:text-dark-text-secondary mb-1">Message</label>
                <textarea 
                    id="feedback-message" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    rows={4} 
                    className="w-full px-3 py-2 border border-lime-green/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-green transition bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                    placeholder="Tell us how we can improve GreenMap..." 
                    required
                ></textarea>
            </div>
            <div className="flex items-center justify-between">
                <Button type="submit" disabled={isSubmitting || !message.trim()}>
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                {isSubmitted && <p className="text-lime-green font-semibold">Thank you for your feedback!</p>}
            </div>
        </form>
    );
};

interface FeedbackViewProps {
    isAdmin: boolean;
}

// Main FeedbackView Component
const FeedbackView: React.FC<FeedbackViewProps> = ({ isAdmin }) => {
    const { feedbackList, isLoading, addFeedback, deleteFeedback, toggleFeedbackImportance } = useFeedback();
    const [filter, setFilter] = useState<'all' | FeedbackCategory>('all');
    const [isAdminAiLoading, setIsAdminAiLoading] = useState(false);
    const [isGeneralAiLoading, setIsGeneralAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<{ category: FeedbackCategory; message: string } | null>(null);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const sortedAndFilteredFeedback = useMemo(() => {
        let processedFeedback = [...feedbackList];

        // Filter
        if (filter !== 'all') {
            processedFeedback = processedFeedback.filter(f => f.category === filter);
        }

        // Sort: Important items first, then by date (newest first)
        processedFeedback.sort((a, b) => {
            if (a.isImportant && !b.isImportant) return -1;
            if (!a.isImportant && b.isImportant) return 1;
            return b.submittedAt.getTime() - a.submittedAt.getTime();
        });

        return processedFeedback;
    }, [feedbackList, filter]);

    const handleAdminAiSuggest = async () => {
        setIsAdminAiLoading(true);
        try {
            const suggestion = await generateAiFeedbackSuggestions(feedbackList);
            if (suggestion) {
                await addFeedback(suggestion);
            }
        } catch (error) {
            console.error("Failed to add AI suggestion:", error);
        }
        setIsAdminAiLoading(false);
    };

    const handleGeneralAiSuggest = async () => {
        setIsGeneralAiLoading(true);
        setAiSuggestion(null);
        try {
            const suggestion = await generateGeneralAiFeedbackSuggestion();
            if (suggestion) {
                setAiSuggestion(suggestion);
                setIsSuggestionModalOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch general AI suggestion:", error);
        }
        setIsGeneralAiLoading(false);
    };

    const handleSubmitAiSuggestion = async () => {
        if (aiSuggestion) {
            await addFeedback(aiSuggestion);
            setIsSuggestionModalOpen(false);
            setAiSuggestion(null);
        }
    };
    
    const openDeleteConfirm = (feedback: Feedback) => {
        setFeedbackToDelete(feedback);
    };

    const closeDeleteConfirm = () => {
        setFeedbackToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (feedbackToDelete) {
            setIsDeleting(true);
            try {
                await deleteFeedback(feedbackToDelete.id);
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
            <header>
                <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">Community Feedback</h1>
                <p className="text-lg text-lime-green dark:text-light-green mt-1">See what the community is saying and share your own ideas.</p>
            </header>

            <section>
                <Card>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text mb-2 sm:mb-0">Share Your Thoughts</h2>
                        {isAdmin && (
                            <Button onClick={handleAdminAiSuggest} disabled={isAdminAiLoading} variant="secondary" size="sm" className="flex items-center gap-2">
                                <FaRobot />
                                {isAdminAiLoading ? 'Synthesizing...' : 'Admin: Synthesize Feedback'}
                            </Button>
                        )}
                    </div>
                    <FeedbackForm onAddFeedback={addFeedback} />
                </Card>
            </section>
            
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text">Submitted Feedback</h2>
                     <div className="flex items-center gap-2">
                        <label className="font-semibold text-sm dark:text-dark-text-secondary">Filter:</label>
                        <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-white dark:bg-gray-700 dark:text-white border border-lime-green/50 dark:border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-lime-green">
                            <option value="all">All Categories</option>
                            <option value={FeedbackCategory.General}>General</option>
                            <option value={FeedbackCategory.Bug}>Bugs</option>
                            <option value={FeedbackCategory.Feature}>Features</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-center dark:text-dark-text-secondary">Loading feedback...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedAndFilteredFeedback.length > 0 ? (
                            sortedAndFilteredFeedback.map(f => <FeedbackCard key={f.id} feedback={f} isAdmin={isAdmin} onDeleteClick={openDeleteConfirm} onToggleImportance={toggleFeedbackImportance} />)
                        ) : (
                            <p className="md:col-span-2 lg:col-span-3 text-center text-gray-600 dark:text-dark-text-secondary py-10">
                                No feedback matching this category. Be the first to submit one!
                            </p>
                        )}
                    </div>
                )}
                 <div className="mt-8 text-center">
                    <Card className="inline-block">
                        <div className="flex flex-col items-center gap-2 p-4">
                             <p className="text-forest-green dark:text-dark-text-secondary">Need inspiration? Let our AI suggest a feedback idea!</p>
                             <Button onClick={handleGeneralAiSuggest} disabled={isGeneralAiLoading} variant="secondary">
                                 <div className="flex items-center gap-2">
                                    <FaRobot />
                                    {isGeneralAiLoading ? 'Thinking...' : 'AI Suggest Feedback'}
                                 </div>
                             </Button>
                        </div>
                    </Card>
                </div>
            </section>
            
            <Modal isOpen={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)} title="AI Feedback Suggestion">
                {aiSuggestion && (
                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-dark-text-secondary">
                            Here's an idea from our AI assistant:
                        </p>
                        <blockquote className="border-l-4 border-lime-green pl-4 italic text-forest-green dark:text-dark-text">
                            {aiSuggestion.message}
                        </blockquote>
                        <div className="flex justify-end gap-4 mt-4">
                            <Button variant="secondary" onClick={() => setIsSuggestionModalOpen(false)}>
                                Discard
                            </Button>
                            <Button onClick={handleSubmitAiSuggestion}>
                                Submit This Feedback
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!feedbackToDelete} onClose={closeDeleteConfirm} title="Confirm Deletion">
                {feedbackToDelete && (
                    <div className="text-center">
                        <p className="text-lg text-gray-700 dark:text-dark-text-secondary mb-4">
                            Are you sure you want to delete this feedback from <span className="font-bold">{feedbackToDelete.user.name}</span>?
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

export default FeedbackView;