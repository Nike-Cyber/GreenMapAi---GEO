import { useState, useEffect, useCallback } from 'react';
import { Report, ReportType } from '../types';
import { getReports as fetchReports, addReport as postReport, deleteReport as postDeleteReport } from '../services/reportService';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedReports = await fetchReports();
      setReports(fetchedReports);
    } catch (err) {
      setError('Failed to fetch reports.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addReport = useCallback(async (reportData: Omit<Report, 'id' | 'coords' | 'reportedAt' | 'user'>, newCoords?: { lat: number; lng: number }) => {
    try {
      const newReport = await postReport(reportData, newCoords);
      setReports(prevReports => [...prevReports, newReport]);
    } catch (err) {
      setError('Failed to add report.');
      console.error(err);
    }
  }, []);
  
  const deleteReport = useCallback(async (reportId: number) => {
    try {
      await postDeleteReport(reportId);
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    } catch (err) {
      setError('Failed to delete report.');
      console.error(err);
      throw err;
    }
  }, []);

  const treePlantationCount = reports.filter(r => r.type === ReportType.TreePlantation).length;
  const pollutionHotspotCount = reports.filter(r => r.type === ReportType.PollutionHotspot).length;

  return { reports, isLoading, error, addReport, deleteReport, treePlantationCount, pollutionHotspotCount, refreshReports: loadReports };
};