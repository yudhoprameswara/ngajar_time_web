import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { SessionModel } from '../../types';
import { formatRupiah } from '../../utils/currency';
import { formatMonthYear, formatShortDate, formatTimeOnly } from '../../utils/date';
import { formatDurationHuman } from '../../utils/calculator';
import { Plus, UserPlus, Clock, BookOpen, Edit2, Trash2, CalendarCheck, Loader2 } from 'lucide-react';

interface DashboardTabProps {
  onOpenAddSession: () => void;
  onOpenAddStudent: () => void;
  onEditSession: (session: SessionModel) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onOpenAddSession,
  onOpenAddStudent,
  onEditSession,
}) => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<SessionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SessionModel[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          studentId: data.studentId,
          studentName: data.studentName,
          hourlyRate: data.hourlyRate || 0,
          startTime: data.startTime ? data.startTime.toDate() : new Date(),
          endTime: data.endTime ? data.endTime.toDate() : new Date(),
          actualDurationMinutes: data.actualDurationMinutes || 0,
          billedDurationMinutes: data.billedDurationMinutes || 0,
          topic: data.topic || 'Les Reguler',
          totalFee: data.totalFee || 0,
        };
      });
      list.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
      setSessions(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Calculations for current month
  const currentMonthSessions = sessions.filter((s) => {
    const d = s.startTime;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthTotalFee = currentMonthSessions.reduce((acc, s) => acc + s.totalFee, 0);
  const monthTotalMinutes = currentMonthSessions.reduce((acc, s) => acc + s.billedDurationMinutes, 0);

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan sesi ini?")) return;
    try {
      await deleteDoc(doc(db, 'sessions', id));
    } catch (e) {
      alert("Gagal menghapus sesi.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 overflow-y-auto no-scrollbar">
      {/* 1. HERO BANNER PENDAPATAN BULANAN */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-5 text-white shadow-lg mb-4">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full blur-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-12 h-12 bg-accent/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Pendapatan Bulan Ini
            </span>
            <span className="text-[11px] bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full font-medium text-white/90">
              {formatMonthYear(now)}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight mt-2 mb-4">
            {formatRupiah(monthTotalFee)}
          </h2>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/15">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <span className="text-[10px] text-white/70 block">Jam Mengajar</span>
                <span className="text-xs font-bold text-white">
                  {formatDurationHuman(monthTotalMinutes)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <CalendarCheck className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <span className="text-[10px] text-white/70 block">Total Sesi</span>
                <span className="text-xs font-bold text-white">
                  {currentMonthSessions.length} sesi les
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <button
          onClick={onOpenAddSession}
          className="py-3 px-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Sesi</span>
        </button>
        <button
          onClick={onOpenAddStudent}
          className="py-3 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <UserPlus className="w-4 h-4 text-primary" />
          <span>Tambah Murid</span>
        </button>
      </div>

      {/* 3. RECENT SESSIONS SECTION */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Sesi Mengajar Terbaru</h3>
        <span className="text-xs text-slate-400 font-medium">
          {sessions.length} riwayat
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Belum ada catatan sesi</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
            Klik tombol "Catat Sesi" di atas untuk mencatat sesi pertama.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-2 hover:border-primary/30 transition group"
            >
              {/* Left Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {session.studentName}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-md">
                    {formatShortDate(session.startTime)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-1 font-medium whitespace-pre-line leading-relaxed">
                  {session.topic}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>
                    {formatTimeOnly(session.startTime)} - {formatTimeOnly(session.endTime)}
                  </span>
                  <span>•</span>
                  <span>{formatDurationHuman(session.actualDurationMinutes)}</span>
                </div>
              </div>

              {/* Right Fee & Actions */}
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-xs font-extrabold text-primary mb-1">
                  {formatRupiah(session.totalFee)}
                </span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEditSession(session)}
                    className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-slate-100"
                    title="Edit Sesi"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Hapus Sesi"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
