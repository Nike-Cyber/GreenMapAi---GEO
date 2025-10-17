import React, { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { getAiAnalysis } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import { FaBrain } from 'react-icons/fa';
import { useError } from '../contexts/ErrorContext';

const AiAnalysisView: React.FC = () => {
    const { reports } = useReports();
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useError();

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        try {
            const result = await getAiAnalysis(reports);
            setAnalysis(result);
        } catch (err) {
            showError('Failed to generate AI analysis. The AI may be busy or an error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
            <header>
                <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">AI-Powered Analysis</h1>
                <p className="text-lg text-lime-green dark:text-light-green mt-1">Uncover trends and insights from community data.</p>
            </header>
            
            <Card className="text-center">
                <div className="flex flex-col items-center">
                    <FaBrain className="text-5xl text-lime-green mb-4" />
                    <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text">Analyze All Reports</h2>
                    <p className="max-w-2xl mx-auto my-2 text-gray-700 dark:text-dark-text-secondary">
                        Use the power of AI to analyze all {reports.length} community reports. The AI will identify trends, highlight areas of concern and positivity, and provide actionable suggestions.
                    </p>
                    <Button onClick={handleGenerateAnalysis} disabled={isLoading} size="lg">
                        {isLoading ? 'Analyzing Data...' : 'Generate Analysis'}
                    </Button>
                </div>
            </Card>

            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center">
                         <svg className="w-16 h-16 text-lime-green animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-lg font-semibold text-forest-green dark:text-dark-text">The AI is thinking...</p>
                    </div>
                </div>
            )}

            {analysis && (
                <Card className="prose max-w-none dark:prose-invert">
                    <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text mb-4">Analysis Results</h2>
                    <div 
                        className="text-gray-800 dark:text-dark-text-secondary" 
                        style={{ whiteSpace: 'pre-wrap' }}
                        dangerouslySetInnerHTML={{ __html: analysis.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>').replace(/\n/g, '<br />') }}
                    />
                </Card>
            )}
        </div>
    );
};

export default AiAnalysisView;