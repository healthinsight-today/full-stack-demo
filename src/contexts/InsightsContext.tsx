import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Insight, CreateInsightPayload, UpdateInsightPayload } from '../types/Insights';
import { insightsApi } from '../services/api/insights';
import { useReports } from './ReportsContext';

interface InsightsContextType {
  insights: Insight[];
  loading: boolean;
  error: string | null;
  fetchInsights: () => Promise<void>;
  createInsight: (payload: CreateInsightPayload) => Promise<void>;
  updateInsight: (payload: UpdateInsightPayload) => Promise<void>;
  deleteInsight: (insightId: string) => Promise<void>;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
};

export const InsightsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reports } = useReports();

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedInsights = await insightsApi.fetchInsights();
      setInsights(fetchedInsights);
    } catch (err) {
      setError('Failed to fetch insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createInsight = async (payload: CreateInsightPayload) => {
    try {
      setLoading(true);
      setError(null);
      const newInsight = await insightsApi.createInsight(payload);
      setInsights(prev => [...prev, newInsight]);
    } catch (err) {
      setError('Failed to create insight');
      console.error('Error creating insight:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInsight = async (payload: UpdateInsightPayload) => {
    try {
      setLoading(true);
      setError(null);
      const updatedInsight = await insightsApi.updateInsight(payload);
      setInsights(prev => 
        prev.map(insight => 
          insight.id === updatedInsight.id ? updatedInsight : insight
        )
      );
    } catch (err) {
      setError('Failed to update insight');
      console.error('Error updating insight:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInsight = async (insightId: string) => {
    try {
      setLoading(true);
      setError(null);
      await insightsApi.deleteInsight(insightId);
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (err) {
      setError('Failed to delete insight');
      console.error('Error deleting insight:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reports.length > 0) {
      fetchInsights();
    } else {
      setInsights([]);
    }
  }, [reports, fetchInsights]);

  const value = {
    insights,
    loading,
    error,
    fetchInsights,
    createInsight,
    updateInsight,
    deleteInsight,
  };

  return (
    <InsightsContext.Provider value={value}>
      {children}
    </InsightsContext.Provider>
  );
}; 