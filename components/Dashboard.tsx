import React, { useMemo } from 'react';
import { useReports } from '../hooks/useReports';
import Card from './ui/Card';
import { Report, ReportType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTree, FaExclamationTriangle, FaClipboardList, FaCrown } from 'react-icons/fa';
import { calculateUserStats } from '../utils/userStats';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; darkColor: string; }> = ({ title, value, icon, color, darkColor }) => (
    <Card className={`flex items-center p-4`}>
        <div className={`p-3 rounded-full mr-4 text-white`} style={{ backgroundColor: color }}>{icon}</div>
        <div>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-forest-green dark:text-dark-text">{value}</p>
        </div>
    </Card>
);

interface DashboardProps {
    username: string;
}

const Dashboard: React.FC<DashboardProps> = ({ username }) => {
    const { reports, isLoading, treePlantationCount, pollutionHotspotCount } = useReports();
    
    const chartData = reports.reduce((acc, report) => {
        const month = report.reportedAt.toLocaleString('default', { month: 'short' });
        let monthEntry = acc.find(item => item.name === month);
        if (!monthEntry) {
            monthEntry = { name: month, trees: 0, pollution: 0 };
            acc.push(monthEntry);
        }
        if (report.type === ReportType.TreePlantation) {
            monthEntry.trees += 1;
        } else {
            monthEntry.pollution += 1;
        }
        return acc;
    }, [] as { name: string; trees: number; pollution: number }[]);

    const recentReports = [...reports].sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()).slice(0, 5);
    
    const leaderboardData = useMemo(() => {
        if (isLoading || !reports.length) return [];
            
        const reportsByUser: { [key: string]: { user: Report['user']; reports: Report[] } } = reports.reduce((acc, report) => {
            const userName = report.user.name;
            if (!acc[userName]) {
                acc[userName] = { user: report.user, reports: [] };
            }
            acc[userName].reports.push(report);
            return acc;
        }, {});

        const stats = Object.values(reportsByUser).map(userData => {
            const userStats = calculateUserStats(userData.reports);
            return {
                user: userData.user,
                ...userStats,
            };
        });

        return stats.sort((a, b) => b.points - a.points);
    }, [reports, isLoading]);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
            <header>
                <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">Your Dashboard</h1>
                <p className="text-lg text-lime-green dark:text-light-green mt-1">An overview of community contributions.</p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Reports" value={reports.length} icon={<FaClipboardList />} color="#A3CC3A" darkColor="#A3CC3A" />
                <StatCard title="Trees Planted" value={treePlantationCount} icon={<FaTree />} color="#5A8C33" darkColor="#5A8C33" />
                <StatCard title="Pollution Hotspots" value={pollutionHotspotCount} icon={<FaExclamationTriangle />} color="#B94A48" darkColor="#B94A48" />
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <section className="lg:col-span-3">
                    <Card>
                        <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text mb-4">Reports Overview</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" className="dark:stroke-gray-600" />
                                    <XAxis dataKey="name" stroke="currentColor" className="text-forest-green dark:text-dark-text-secondary" />
                                    <YAxis stroke="currentColor" className="text-forest-green dark:text-dark-text-secondary" />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #F5F5DC)', border: '1px solid #A3CC3A' }} 
                                      wrapperClassName="dark:[--tooltip-bg:theme(colors.dark-card)]"
                                    />
                                    <Legend wrapperStyle={{color: 'var(--legend-color)'}} className="dark:[--legend-color:theme(colors.dark.text-secondary)]" />
                                    <Bar dataKey="trees" fill="#5A8C33" name="Tree Plantations" />
                                    <Bar dataKey="pollution" fill="#B94A48" name="Pollution Hotspots" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </section>

                <section className="lg:col-span-2">
                    <Card>
                        <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text mb-4">Community Rankings</h2>
                        {isLoading ? (
                            <p className="dark:text-dark-text-secondary text-center py-4">Loading rankings...</p>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {leaderboardData.map((stat, index) => {
                                    const isCurrentUser = stat.user.name === 'Current User';
                                    return (
                                        <div key={stat.user.avatar} className={`flex items-center p-2 rounded-lg transition-all ${isCurrentUser ? 'bg-lime-green/20 scale-[1.03] shadow-md' : 'bg-white/50 dark:bg-dark-bg/50'}`}>
                                            <div className="w-8 text-center font-bold text-lg text-forest-green dark:text-dark-text-secondary">{index + 1}</div>
                                            <img src={stat.user.avatar} alt={stat.user.name} className="w-10 h-10 rounded-full mx-2" />
                                            <div className="flex-grow">
                                                <p className="font-bold text-forest-green dark:text-dark-text">{isCurrentUser ? username : stat.user.name} {index === 0 && <FaCrown className="inline-block text-yellow-500 mb-1 ml-1" title="Top Contributor" />}</p>
                                                <p className="text-sm text-lime-green dark:text-light-green">{stat.rank.icon} {stat.rank.name}</p>
                                            </div>
                                            <div className="text-right ml-2">
                                                <p className="font-bold text-lg text-forest-green dark:text-dark-text">{stat.points}</p>
                                                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">points</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </Card>
                </section>
            </div>


            <section>
                <Card>
                    <h2 className="text-2xl font-bold text-forest-green dark:text-dark-text mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {isLoading ? (
                            <p className="dark:text-dark-text-secondary">Loading recent reports...</p>
                        ) : (
                            recentReports.map(report => (
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
                        )}
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default Dashboard;
