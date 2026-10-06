import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { StudentModel, SessionModel } from '../../types';
import { formatRupiah } from '../../utils/currency';
import { formatMonthYear, formatShortDate } from '../../utils/date';
import { formatDurationHuman } from '../../utils/calculator';
import { PrintableInvoice } from './PrintableInvoice';
import { FileText, BarChart3, ChevronLeft, ChevronRight, Printer, Clock, Layers, Users, Loader2 } from 'lucide-react';

export const ReportsTab: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'invoice' | 'analytics'>('invoice');

  const [students, setStudents] = useState<StudentModel[]>([]);
  const [sessions, setSessions] = useState<SessionModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice Filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Analytics Period
  const [analyticsDate, setAnalyticsDate] = useState<Date>(new Date());
  const [analyticsMode, setAnalyticsMode] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (!currentUser) return;

    // Fetch students
    const qStudents = query(collection(db, 'students'), where('userId', '==', currentUser.uid));
    const unsubStudents = onSnapshot(
      qStudents,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StudentModel, 'id'>) }));
        setStudents(list);
        if (list.length > 0 && !selectedStudentId) {
          setSelectedStudentId(list[0].id);
        }
      },
      (error) => {
        console.error("Error fetching students in reports:", error);
      }
    );

    // Fetch sessions
    const qSessions = query(collection(db, 'sessions'), where('userId', '==', currentUser.uid));
    const unsubSessions = onSnapshot(
      qSessions,
      (snap) => {
        const list: SessionModel[] = snap.docs.map((d) => {
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
        setSessions(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching sessions in reports:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubStudents();
      unsubSessions();
    };
  }, [currentUser]);

  if (loading || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // --- INVOICE TAB CALCULATIONS ---
  const invoiceSessions = sessions
    .filter((s) => {
      const d = s.startTime;
      const matchStudent = s.studentId === selectedStudentId;
      const matchMonth = d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      return matchStudent && matchMonth;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const invoiceTotalFee = invoiceSessions.reduce((acc, s) => acc + s.totalFee, 0);
  const invoiceTotalMinutes = invoiceSessions.reduce((acc, s) => acc + s.billedDurationMinutes, 0);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // --- ANALYTICS TAB CALCULATIONS ---
  const filteredAnalyticsSessions = sessions.filter((s) => {
    const d = s.startTime;
    if (analyticsMode === 'monthly') {
      return d.getMonth() === analyticsDate.getMonth() && d.getFullYear() === analyticsDate.getFullYear();
    } else {
      return d.getFullYear() === analyticsDate.getFullYear();
    }
  });

  const analyticsTotalFee = filteredAnalyticsSessions.reduce((acc, s) => acc + s.totalFee, 0);
  const analyticsTotalMinutes = filteredAnalyticsSessions.reduce((acc, s) => acc + s.billedDurationMinutes, 0);

  // Per student breakdown
  const studentRevenueMap: { [id: string]: { name: string; fee: number; minutes: number } } = {};
  filteredAnalyticsSessions.forEach((s) => {
    if (!studentRevenueMap[s.studentId]) {
      studentRevenueMap[s.studentId] = { name: s.studentName, fee: 0, minutes: 0 };
    }
    studentRevenueMap[s.studentId].fee += s.totalFee;
    studentRevenueMap[s.studentId].minutes += s.billedDurationMinutes;
  });

  const studentBreakdown = Object.values(studentRevenueMap).sort((a, b) => b.fee - a.fee);

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 overflow-y-auto no-scrollbar">
      {/* Tab Switcher */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center mb-4">
        <button
          onClick={() => setActiveSubTab('invoice')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'invoice'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Faktur Invoice</span>
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analitik Pendapatan</span>
        </button>
      </div>

      {activeSubTab === 'invoice' ? (
        /* --- SUB TAB 1: INVOICE GENERATOR --- */
        <div className="space-y-4">
          {/* Filter Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Murid</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Stepper */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan Tagihan</label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() =>
                    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800">
                  {formatMonthYear(selectedDate)}
                </span>
                <button
                  onClick={() =>
                    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Summary Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Total Tagihan Murid</span>
              <span className="text-xl font-extrabold text-primary">
                {formatRupiah(invoiceTotalFee)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {invoiceSessions.length} sesi • {formatDurationHuman(invoiceTotalMinutes)}
              </span>
            </div>

            <button
              disabled={invoiceSessions.length === 0 || !selectedStudent}
              onClick={() => setShowPrintModal(true)}
              className="py-2.5 px-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
          </div>

          {/* Sessions List for Selected Student & Month */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">Rincian Sesi di Invoice</h4>

            {invoiceSessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center">
                <p className="text-xs text-slate-400">
                  Tidak ada sesi mengajar untuk murid ini pada {formatMonthYear(selectedDate)}.
                </p>
              </div>
            ) : (
              invoiceSessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">{s.topic}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatShortDate(s.startTime)} • {s.billedDurationMinutes} mnt
                    </span>
                  </div>
                  <span className="font-bold text-primary">{formatRupiah(s.totalFee)}</span>
                </div>
              ))
            )}
          </div>

          {/* Printable Invoice Modal */}
          {showPrintModal && selectedStudent && (
            <PrintableInvoice
              user={currentUser}
              student={selectedStudent}
              sessions={invoiceSessions}
              monthYearStr={formatMonthYear(selectedDate)}
              onClose={() => setShowPrintModal(false)}
            />
          )}
        </div>
      ) : (
        /* --- SUB TAB 2: REVENUE ANALYTICS --- */
        <div className="space-y-4">
          {/* Period Mode Toggle & Stepper */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setAnalyticsMode('monthly')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  analyticsMode === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setAnalyticsMode('yearly')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  analyticsMode === 'yearly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                }`}
              >
                Tahunan
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => {
                  if (analyticsMode === 'monthly') {
                    setAnalyticsDate(new Date(analyticsDate.getFullYear(), analyticsDate.getMonth() - 1, 1));
                  } else {
                    setAnalyticsDate(new Date(analyticsDate.getFullYear() - 1, 1, 1));
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800">
                {analyticsMode === 'monthly' ? formatMonthYear(analyticsDate) : `Tahun ${analyticsDate.getFullYear()}`}
              </span>
              <button
                onClick={() => {
                  if (analyticsMode === 'monthly') {
                    setAnalyticsDate(new Date(analyticsDate.getFullYear(), analyticsDate.getMonth() + 1, 1));
                  } else {
                    setAnalyticsDate(new Date(analyticsDate.getFullYear() + 1, 1, 1));
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats 3-Col Card */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-400 font-medium block">Total Honor</span>
              <span className="text-xs font-extrabold text-primary block mt-0.5">
                {formatRupiah(analyticsTotalFee)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-400 font-medium block">Durasi</span>
              <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                {formatDurationHuman(analyticsTotalMinutes)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-400 font-medium block">Total Sesi</span>
              <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                {filteredAnalyticsSessions.length}
              </span>
            </div>
          </div>

          {/* Student Contribution Bars */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Kontribusi Honor per Murid</h4>

            {studentBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Belum ada data sesi pada periode ini.
              </p>
            ) : (
              <div className="space-y-3">
                {studentBreakdown.map((item) => {
                  const percent = analyticsTotalFee > 0 ? Math.round((item.fee / analyticsTotalFee) * 100) : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="font-semibold text-primary">{formatRupiah(item.fee)} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
