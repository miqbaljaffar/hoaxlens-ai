import React from 'react';
import { ShieldCheck, Calendar, History, ShieldAlert, BarChart3, Image, User, LogOut } from 'lucide-react';
import { AppUser } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onSwitchUser: () => void;
}

export default function Navigation({ activeTab, setActiveTab, currentUser, onLogout, onSwitchUser }: NavigationProps) {
  const tabs = [
    { id: 'landing', label: 'Home', icon: ShieldCheck },
    { id: 'checker', label: 'Fact Checker', icon: ShieldAlert },
    { id: 'ocr', label: 'OCR Vision', icon: Image },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Claim History', icon: History },
  ];

  if (currentUser?.role === 'admin') {
    tabs.push({ id: 'admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand Title */}
        <div 
          onClick={() => setActiveTab('landing')} 
          className="flex cursor-pointer items-center space-x-2 group"
          id="brand-logo-container"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 shadow-md shadow-emerald-500/10 transition-transform group-hover:scale-105 duration-300">
            <ShieldCheck className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              HoaxLens <span className="text-white font-medium text-xs bg-slate-800 px-1.5 py-0.5 rounded ml-1">AI</span>
            </span>
            <p className="text-[9px] text-slate-400 font-mono tracking-widest hidden sm:block">AI VERIFICATION ENGINE</p>
          </div>
        </div>

        {/* Tab List */}
        <nav className="hidden md:flex space-x-1" id="desktop-navbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-sans text-sm font-medium tracking-wide transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side user status & login switcher */}
        <div className="flex items-center space-x-3" id="user-actions-area">
          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-1.5 pr-3 rounded-xl">
              <button
                onClick={onSwitchUser}
                title="Switch test accounts"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition"
              >
                <User className="h-4 w-4" />
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{currentUser.role}</p>
              </div>
              <button
                id="btn-logout"
                onClick={onLogout}
                title="Logout"
                className="text-slate-400 hover:text-rose-400 p-1 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSwitchUser}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-all font-sans text-xs font-semibold text-slate-950"
            >
              <span>Connect Sandbox</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex overflow-x-auto justify-around bg-slate-950 border-t border-slate-900 py-2 px-1" id="mobile-tabs-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded text-[10px] font-sans transition-all duration-200 ${
                isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
