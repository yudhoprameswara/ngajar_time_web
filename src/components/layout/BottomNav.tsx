import React from 'react';
import { LayoutDashboard, GraduationCap, ReceiptText } from 'lucide-react';

interface BottomNavProps {
  activeTab: number;
  onChangeTab: (tab: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const items = [
    { label: 'Beranda', icon: LayoutDashboard },
    { label: 'Murid', icon: GraduationCap },
    { label: 'Laporan', icon: ReceiptText },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-2 z-30 flex items-center justify-around"
      style={{
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeTab === idx;
        return (
          <button
            key={item.label}
            onClick={() => onChangeTab(idx)}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition ${
              isActive ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${isActive ? 'bg-primary-light' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
