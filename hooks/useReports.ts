import { useState, useEffect, useCallback } from 'react';
import { Report, ReportType } from '../types';
import { getReports as fetchReports, addReport as postReport, deleteReport as postDeleteReport } from '../services/reportService';
import { useError } from '../contexts/ErrorContext';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showError } = useError();

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedReports = await fetchReports();
      setReports(fetchedReports);
    } catch (err) {
      showError('Failed to fetch reports. The server might be temporarily down.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addReport = useCallback(async (reportData: Omit<Report, 'id' | 'coords' | 'reportedAt' | 'user'>, newCoords?: { lat: number; lng: number }) => {
    try {
      const newReport = await postReport(reportData, newCoords);
      setReports(prevReports => [...prevReports, newReport]);
    } catch (err) {
      showError('Failed to add the new report. Please check your connection and try again.');
      console.error(err);
    }
  }, [showError]);
  
  const deleteReport = useCallback(async (reportId: number) => {
    try {
      await postDeleteReport(reportId);
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    } catch (err) {
      showError('Failed to delete the report. Please try again.');
      console.error(err);
      throw err;
    }
  }, [showError]);

  const treePlantationCount = reports.filter(r => r.type === ReportType.TreePlantation).length;
  const pollutionHotspotCount = reports.filter(r => r.type === ReportType.PollutionHotspot).length;

  return { reports, isLoading, addReport, deleteReport, treePlantationCount, pollutionHotspotCount, refreshReports: loadReports };
};
