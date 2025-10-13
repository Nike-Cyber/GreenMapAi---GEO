import React from 'react';
import { useReports } from '../hooks/useReports';
import Card from './ui/Card';
import { ReportType } from '../types';
import { FaTree, FaExclamationTriangle, FaClipboardList, FaStar } from 'react-icons/fa';
import { calculateUserStats } from '../utils/userStats';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="text-center p-4 transition-transform hover:scale-105">
        <div className="text-4xl text-lime-green dark:text-light-green mx-auto mb-2">{icon}</div>
        <p className="text-3xl font-bold text-forest-green dark:text-dark-text">{value}</p>
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{title}</p>
    </Card>
);

interface ProfileViewProps {
    username: string;
}

const ProfileView: React.FC<ProfileViewProps> = ({ username }) => {
    const { reports } = useReports();
    // NOTE: This filter is based on mock data. In a real app, you'd filter by a user ID.
    const userReports = reports.filter(r => r.user.name === "Current User");
    const stats = calculateUserStats(userReports);
    const recentUserReports = userReports.slice(-5).reverse();

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row items-center gap-6">
                <img 
                    src={`https://i.pravatar.cc/150?u=${username}`} 
                    alt="User Avatar"
                    className="w-32 h-32 rounded-full border-4 border-lime-green shadow-lg"
                />
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">{username}</h1>
                        <span className="px-3 py-1 text-sm font-semibold text-lime-green bg-lime-green/20 rounded-full flex items-center gap-2">
                           <span className="text-lg" title={stats.rank.name}>{stats.rank.icon}</span> {stats.rank.name}
                        </span>
                    </div>
                    <p className="text-lg text-lime-green dark:text-light-green mt-1">{username.toLowerCase()}@greenmap.com</p>
                    
                    <div className="w-full mt-4 max-w-sm mx-auto md:mx-0">
                        <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                            <span>Points: {stats.points}</span>
                            <span>Next Rank: {stats.rank.nextRankPoints !== Infinity ? stats.rank.nextRankPoints : 'Max'}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                            <div 
                                className="bg-gradient-to-r from-light-green to-lime-green h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${stats.progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </header>

            <section>
                <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text mb-4">Your Contribution Stats</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Your Points" value={stats.points} icon={<FaStar />} />
                    <StatCard title="Total Reports" value={stats.reportsCount} icon={<FaClipboardList />} />
                    <StatCard title="Trees Planted" value={stats.treesPlanted} icon={<FaTree />} />
                    <StatCard title="Pollution Hotspots" value={stats.pollutionHotspots} icon={<FaExclamationTriangle />} />
                </div>
            </section>

            <section>
                <Card>
                    <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text mb-4">Your Recent Activity</h2>
                     <div className="space-y-4">
                        {userReports.length > 0 ? (
                            recentUserReports.map(report => (
                                <div key={report.id} className="flex items-start p-3 bg-white/50 dark:bg-dark-bg/50 rounded-lg">
                                    <div className={`mr-4 mt-1 p-2 rounded-full ${report.type === ReportType.TreePlantation ? 'bg-lime-green/20 text-lime-green' : 'bg-earth-red/20 text-earth-red'}`}>
                                        {report.type === ReportType.TreePlantation ? <FaTree /> : <FaExclamationTriangle />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-forest-green dark:text-dark-text">{report.location}</p>
                                        <p className="text-sm text-gray-700 dark:text-dark-text-secondary">{report.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.reportedAt.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600 dark:text-dark-text-secondary py-4">You haven't submitted any reports yet. Go to the map to add one!</p>
                        )}
                    </div>
                </Card>
            </section>

        </div>
    );
};

export default ProfileView;
