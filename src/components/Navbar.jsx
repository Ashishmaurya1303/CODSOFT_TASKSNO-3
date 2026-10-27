'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function Navbar({ user, toggleSidebar }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignore background error
    }
  };

  // Connect to Real-time SSE
  useEffect(() => {
    fetchNotifications();

    let eventSource;
    try {
      eventSource = new EventSource('/api/realtime');

      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };

      eventSource.addEventListener('status_change', () => {
        setIsLiveConnected(true);
        fetchNotifications();
      });

      eventSource.addEventListener('shipment_created', () => {
        setIsLiveConnected(true);
        fetchNotifications();
      });

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch {
      setIsLiveConnected(false);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/track/${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
    setSearchQuery('');
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      //
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Global Quick Tracker Search */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Quick Track ID (e.g. FF-89210-IN)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 md:w-80 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        {/* Live SSE Status Badge */}
        <div
          title={isLiveConnected ? 'Live Real-time WebSockets/SSE active' : 'Connecting to Live Stream'}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          <Radio className={`h-3 w-3 ${isLiveConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
          <span className="hidden md:inline">{isLiveConnected ? 'Live Stream Active' : 'Connecting'}</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              <div
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-white">Live Alerts</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {unreadCount} new
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 text-xs transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          !item.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {item.type === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />}
                          {item.type === 'ALERT' && <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5" />}
                          {item.type === 'WARNING' && <Clock className="h-4 w-4 text-amber-500 mt-0.5" />}
                          {item.type === 'INFO' && <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white text-xs shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="block text-[10px] text-slate-400 capitalize">
              {user?.role?.toLowerCase() || 'admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
