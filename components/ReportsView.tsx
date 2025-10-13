import React, { useState, useMemo } from 'react';
import { useReports } from '../hooks/useReports';
import { Report, ReportType } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { FaTree, FaExclamationTriangle, FaDownload, FaSearch, FaTrash } from 'react-icons/fa';
import Modal from './ui/Modal';

const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
        return text;
    }
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-500 rounded p-0 m-0 text-black">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const ReportCard: React.FC<{ report: Report; onDeleteClick: (report: Report) => void; isAdmin: boolean; searchQuery: string; }> = ({ report, onDeleteClick, isAdmin, searchQuery }) => {
    const isOwner = report.user.name === 'Current User';
    return (
        <div className="flex items-start p-4 bg-white/60 dark:bg-dark-bg/50 rounded-lg shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md">
            <div className={`mr-4 mt-1 p-3 rounded-full ${report.type === ReportType.TreePlantation ? 'bg-lime-green/20 text-lime-green' : 'bg-earth-red/20 text-earth-red'}`}>
                {report.type === ReportType.TreePlantation ? <FaTree size={20} /> : <FaExclamationTriangle size={20} />}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-forest-green dark:text-dark-text">{highlightText(report.location, searchQuery)}</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">{report.type}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{report.reportedAt.toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-300 mt-2">{highlightText(report.description, searchQuery)}</p>
                <div className="flex items-center mt-3 justify-between">
                    <div className="flex items-center">
                        <img src={report.user.avatar} alt={report.user.name} className="w-6 h-6 rounded-full mr-2" />
                        <p className="text-xs text-gray-600 dark:text-dark-text-secondary">Reported by {report.user.name}</p>
                    </div>
                    {(isOwner || isAdmin) && (
                        <button
                            onClick={() => onDeleteClick(report)}
                            className="p-2 text-gray-500 hover:text-earth-red rounded-full hover:bg-earth-red/10 transition-colors"
                            aria-label="Delete report"
                        >
                            <FaTrash />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

type SortOption = 'newest' | 'oldest' | 'type_trees_first' | 'type_pollution_first';

interface ReportsViewProps {
    isAdmin: boolean;
}

const ReportsView: React.FC<ReportsViewProps> = ({ isAdmin }) => {
    const { reports, isLoading, deleteReport } = useReports();
    const [filter, setFilter] = useState<'all' | ReportType>('all');
    const [sort, setSort] = useState<SortOption>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteConfirm = (report: Report) => {
        setReportToDelete(report);
    };

    const closeDeleteConfirm = () => {
        setReportToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (reportToDelete) {
            setIsDeleting(true);
            try {
                await deleteReport(reportToDelete.id);
                closeDeleteConfirm();
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };


    const filteredAndSortedReports = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return [...reports]
            .filter(report => {
                const typeMatch = filter === 'all' || report.type === filter;

                if (!searchQuery.trim()) {
                    return typeMatch;
                }
                
                const searchMatch = report.location.toLowerCase().includes(lowercasedQuery) ||
                                    report.description.toLowerCase().includes(lowercasedQuery);

                return typeMatch && searchMatch;
            })
            .sort((a, b) => {
                switch (sort) {
                    case 'oldest':
                        return a.reportedAt.getTime() - b.reportedAt.getTime();
                    case 'type_trees_first':
                        // 'Tree Plantation' comes after 'Pollution Hotspot' alphabetically, so we reverse it
                        return b.type.localeCompare(a.type);
                    case 'type_pollution_first':
                        return a.type.localeCompare(b.type);
                    case 'newest':
                    default:
                        return b.reportedAt.getTime() - a.reportedAt.getTime();
                }
            });
    }, [reports, filter, sort, searchQuery]);

    const handleDownloadCSV = () => {
        if (filteredAndSortedReports.length === 0) {
            alert("No reports to download.");
            return;
        }

        const headers = ["ID", "Type", "Location", "Description", "Latitude", "Longitude", "Reported At", "User Name"];
        
        const escapeCSV = (field: any): string => {
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = [
            headers.join(','),
            ...filteredAndSortedReports.map(report => [
                report.id,
                report.type,
                report.location,
                report.description,
                report.coords.lat,
                report.coords.lng,
                report.reportedAt.toISOString(),
                report.user.name
            ].map(escapeCSV).join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'greenmap_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
            <header>
                <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">All Reports</h1>
                <p className="text-lg text-lime-green dark:text-light-green mt-1">Browse all contributions from the community.</p>
            </header>
            <Card>
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4 p-4 bg-white/50 dark:bg-dark-bg/50 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaSearch className="text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-1.5 border border-lime-green/50 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-green bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="font-semibold text-sm dark:text-dark-text-secondary">Filter:</label>
                            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-white dark:bg-gray-700 dark:text-white border border-lime-green/50 dark:border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-lime-green">
                                <option value="all">All Types</option>
                                <option value={ReportType.TreePlantation}>Tree Plantations</option>
                                <option value={ReportType.PollutionHotspot}>Pollution Hotspots</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="font-semibold text-sm dark:text-dark-text-secondary">Sort:</label>
                            <select value={sort} onChange={e => setSort(e.target.value as SortOption)} className="bg-white dark:bg-gray-700 dark:text-white border border-lime-green/50 dark:border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-lime-green">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="type_trees_first">Type (Trees First)</option>
                                <option value="type_pollution_first">Type (Pollution First)</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={handleDownloadCSV} variant="secondary" size="sm" className="flex items-center gap-2 w-full sm:w-auto lg:w-auto flex-shrink-0">
                        <FaDownload />
                        <span>Download CSV</span>
                    </Button>
                </div>
            </Card>
            {isLoading ? (
                <div className="text-center py-10">
                    <p className="dark:text-dark-text-secondary">Loading reports...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAndSortedReports.map(report => (
                        <ReportCard key={report.id} report={report} onDeleteClick={openDeleteConfirm} isAdmin={isAdmin} searchQuery={searchQuery} />
                    ))}
                     {filteredAndSortedReports.length === 0 && (
                        <div className="lg:col-span-2 text-center py-10">
                            <p className="text-gray-600 dark:text-dark-text-secondary">No reports match the current filters.</p>
                        </div>
                    )}
                </div>
            )}
             <Modal isOpen={!!reportToDelete} onClose={closeDeleteConfirm} title="Confirm Deletion">
                {reportToDelete && (
                    <div className="text-center">
                        <p className="text-lg text-gray-700 dark:text-dark-text-secondary mb-4">
                            Are you sure you want to delete this report for <span className="font-bold">{reportToDelete.location}</span>?
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

export default ReportsView;