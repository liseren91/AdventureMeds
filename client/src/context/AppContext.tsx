import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Notification {
  id: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: Date;
}

interface AppContextType {
  favorites: Set<string>;
  comparing: Set<string>;
  history: string[];
  notifications: Notification[];
  selectedCategory: string;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  addToCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  toggleCompare: (id: string) => boolean;
  clearCompare: () => void;
  addToHistory: (id: string) => void;
  clearHistory: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotificationsCount: number;
  setSelectedCategory: (category: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [comparing, setComparing] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('comparing');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      return JSON.parse(saved).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));
    }
    return [
      {
        id: "1",
        message: "New AI service 'Claude 3' added to the Copywriting category",
        category: "copywriting",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "2",
        message: "Price update: ChatGPT Plus is now $25/month",
        category: "chat",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('comparing', JSON.stringify(Array.from(comparing)));
  }, [comparing]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addFavorite = (id: string) => {
    setFavorites(prev => new Set(Array.from(prev).concat(id)));
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleFavorite = (id: string) => {
    if (favorites.has(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  const clearFavorites = () => {
    setFavorites(new Set());
  };

  const addToCompare = (id: string): boolean => {
    if (comparing.size >= 4) {
      return false;
    }
    setComparing(prev => new Set(Array.from(prev).concat(id)));
    return true;
  };

  const removeFromCompare = (id: string) => {
    setComparing(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleCompare = (id: string): boolean => {
    if (comparing.has(id)) {
      removeFromCompare(id);
      return true;
    } else {
      return addToCompare(id);
    }
  };

  const clearCompare = () => {
    setComparing(new Set());
  };

  const addToHistory = (id: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item !== id);
      return [id, ...filtered].slice(0, 20);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const value = {
    favorites,
    comparing,
    history,
    notifications,
    selectedCategory,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    addToHistory,
    clearHistory,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    unreadNotificationsCount,
    setSelectedCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
