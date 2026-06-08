import React, { createContext, useContext, useState, useEffect } from 'react';
import { HistoryItem, AppSettings, AppTheme } from '../types';

interface AppContextType {
  history: HistoryItem[];
  settings: AppSettings;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => HistoryItem;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isHistoryOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  quality: 0.9,
  autoDownload: false,
  theme: 'slate',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('liquidconvert_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('liquidconvert_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('liquidconvert_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('liquidconvert_settings', JSON.stringify(settings));
  }, [settings]);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50)); // Limit to last 50 items
    return newItem;
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        history,
        settings,
        addHistoryItem,
        clearHistory,
        deleteHistoryItem,
        updateSettings,
        isHistoryOpen,
        setHistoryOpen,
        isSettingsOpen,
        setSettingsOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
