import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../auth/UserAvatar';

interface AppBarProps {
  activeTab: number;
  onOpenProfile: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ activeTab, onOpenProfile }) => {
  const { currentUser } = useAuth();
  const titles = ['Ngajar Time', 'Kelola Murid', 'Laporan'];

  return (
    <header
      className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 pb-3 flex items-center justify-between transition-all"
      style={{
        paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-slate-900 leading-tight">
          {activeTab === 0 ? `Halo, ${currentUser?.displayName || 'Pengajar'}` : titles[activeTab]}
        </h1>
        {activeTab === 0 && (
          <span className="text-[11px] text-slate-400 font-medium">
            Selamat mengajar hari ini
          </span>
        )}
      </div>

      <button
        onClick={onOpenProfile}
        className="p-0.5 rounded-full hover:ring-2 hover:ring-primary/30 transition focus:outline-none"
        title="Profil Pengajar"
      >
        <UserAvatar user={currentUser} size="sm" />
      </button>
    </header>
  );
};
