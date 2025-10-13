import { Report, ReportType } from '../types';

export const calculateUserStats = (reports: Report[]) => {
    const pointsPerReport = 10;
    const points = reports.length * pointsPerReport;
    
    let rank: { name: string; icon: string; nextRankPoints: number; };
    if (points >= 300) {
        rank = { name: 'Planet Hero', icon: '🌍', nextRankPoints: Infinity };
    } else if (points >= 150) {
        rank = { name: 'Forest Champion', icon: '🌳', nextRankPoints: 300 };
    } else if (points >= 50) {
        rank = { name: 'Green Guardian', icon: '🛡️', nextRankPoints: 150 };
    } else {
        rank = { name: 'Eco Sprout', icon: '🌱', nextRankPoints: 50 };
    }
    
    const progress = rank.nextRankPoints !== Infinity ? (points / rank.nextRankPoints) * 100 : 100;

    return {
        points,
        rank,
        progress,
        reportsCount: reports.length,
        treesPlanted: reports.filter(r => r.type === ReportType.TreePlantation).length,
        pollutionHotspots: reports.filter(r => r.type === ReportType.PollutionHotspot).length,
    };
};
