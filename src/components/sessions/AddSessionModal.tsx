import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { StudentModel, SessionModel } from '../../types';
import { formatRupiah, formatNumberDots, parseNumberDots } from '../../utils/currency';
import { calculateMinutes, formatDurationHuman, calculateFee } from '../../utils/calculator';
import { X, Calendar, Clock, BookOpen, ListPlus, Loader2 } from 'lucide-react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: SessionModel | null;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  sessionToEdit,
}) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentModel | null>(null);

  const [dateStr, setDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('15:30');
  const [endTimeStr, setEndTimeStr] = useState('17:00');
  const [topic, setTopic] = useState('Les Reguler');
  const [rateStr, setRateStr] = useState('100.000');
  const [loading, setLoading] = useState(false);

  const customRate = parseNumberDots(rateStr);

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    // Fetch students list
    const fetchStudents = async () => {
      const q = query(collection(db, 'students'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StudentModel, 'id'>) }));
      setStudents(list);

      if (sessionToEdit) {
        setSelectedStudentId(sessionToEdit.studentId);
        const st = list.find((s) => s.id === sessionToEdit.studentId);
        setSelectedStudent(st || null);
        setRateStr(formatNumberDots(sessionToEdit.hourlyRate));
        setTopic(sessionToEdit.topic);

        const d = new Date(sessionToEdit.startTime);
        setDateStr(d.toISOString().split('T')[0]);

        const startH = d.getHours().toString().padStart(2, '0');
        const startM = d.getMinutes().toString().padStart(2, '0');
        setStartTimeStr(`${startH}:${startM}`);

        const endD = new Date(sessionToEdit.endTime);
        const endH = endD.getHours().toString().padStart(2, '0');
        const endM = endD.getMinutes().toString().padStart(2, '0');
        setEndTimeStr(`${endH}:${endM}`);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setDateStr(today);
        if (list.length > 0) {
          setSelectedStudentId(list[0].id);
          setSelectedStudent(list[0]);
          setRateStr(formatNumberDots(list[0].hourlyRate));
        }
      }
    };

    fetchStudents();
  }, [currentUser, isOpen, sessionToEdit]);

  if (!isOpen || !currentUser) return null;

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find((s) => s.id === id);
    setSelectedStudent(found || null);
    if (found) {
      setRateStr(formatNumberDots(found.hourlyRate));
    }
  };

  const handleAddBulletPoint = () => {
    const trimmed = topic.trim();
    if (!trimmed) {
      setTopic('• ');
      return;
    }
    const prefix = topic.endsWith('\n') ? '• ' : '\n• ';
    setTopic((prev) => `${prev}${prefix}`);
  };

  // Live calculation
  const startDateTime = new Date(`${dateStr}T${startTimeStr}:00`);
  const endDateTime = new Date(`${dateStr}T${endTimeStr}:00`);
  const actualMinutes = calculateMinutes(startDateTime, endDateTime);
  const totalFee = calculateFee(actualMinutes, customRate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || actualMinutes <= 0) {
      alert("Jam selesai harus lebih besar dari jam mulai!");
      return;
    }

    setLoading(true);
    try {
      const studentName = selectedStudent?.name || sessionToEdit?.studentName || 'Murid';
      const sessionData = {
        userId: currentUser.uid,
        studentId: selectedStudentId,
        studentName: studentName,
        hourlyRate: customRate,
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        actualDurationMinutes: actualMinutes,
        billedDurationMinutes: actualMinutes,
        topic: topic.trim() || 'Les Reguler',
        totalFee: totalFee,
      };

      if (sessionToEdit) {
        await updateDoc(doc(db, 'sessions', sessionToEdit.id), sessionData);
      } else {
        await addDoc(collection(db, 'sessions'), sessionData);
      }

      onClose();
    } catch (err) {
      alert("Gagal menyimpan sesi mengajar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {sessionToEdit ? 'Edit Sesi Mengajar' : 'Catat Sesi Mengajar'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Pilih Murid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Murid</label>
            {students.length === 0 ? (
              <p className="text-xs text-red-500 py-1">Belum ada murid. Tambahkan murid terlebih dahulu di tab Murid.</p>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({formatRupiah(s.hourlyRate)} / jam)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Topik / Materi Pembahasan (Textarea with + Poin) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Materi / Topik Pembahasan</label>
              <button
                type="button"
                onClick={handleAddBulletPoint}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover bg-primary-light/60 px-2 py-0.5 rounded-md transition cursor-pointer"
                title="Tambah Poin Materi"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>+ Poin</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`Tuliskan topik atau poin-poin materi:\n• Bab 2: Persamaan Kuadrat\n• Latihan Soal No. 1-10\n• PR Halaman 45`}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800 leading-relaxed resize-none"
              required
            />
          </div>

          {/* Tanggal Sesi */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Tanggal Sesi</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDateStr(new Date().toISOString().split('T')[0])}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
                    dateStr === new Date().toISOString().split('T')[0]
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setDateStr(yesterday.toISOString().split('T')[0]);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
                    (() => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      return dateStr === y.toISOString().split('T')[0];
                    })()
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Kemarin
                </button>
              </div>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800 cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Waktu Mengajar: Jam Mulai & Jam Selesai */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Waktu Mengajar</label>
              <span className="text-[11px] text-slate-400 font-medium">Format 24 jam</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Mulai</span>
                  <input
                    type="time"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none p-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Selesai</span>
                  <input
                    type="time"
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none p-0 cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-3.5 bg-primary-light/40 border border-primary/20 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Durasi</span>
              <span className="text-sm font-bold text-slate-900">
                {actualMinutes > 0 ? formatDurationHuman(actualMinutes) : '0 menit'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium block">Total Honor Sesi</span>
              <span className="text-sm font-extrabold text-primary">
                {actualMinutes > 0 ? formatRupiah(totalFee) : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Tarif Override Option */}
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">
              Tarif per Jam Khusus Sesi Ini (Bisa Disesuaikan)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-primary select-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={rateStr}
                onChange={(e) => setRateStr(formatNumberDots(e.target.value))}
                placeholder="Contoh: 100.000"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || students.length === 0}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : sessionToEdit ? (
                'Perbarui Sesi'
              ) : (
                'Simpan Sesi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
