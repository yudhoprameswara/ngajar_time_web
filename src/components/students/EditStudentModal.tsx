import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { StudentModel } from '../../types';
import { X, User, BookOpen, Info, Loader2 } from 'lucide-react';
import { formatNumberDots, parseNumberDots } from '../../utils/currency';

interface EditStudentModalProps {
  student: StudentModel | null;
  onClose: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose }) => {
  if (!student) return null;

  const [name, setName] = useState(student.name);
  const [hourlyRate, setHourlyRate] = useState(formatNumberDots(student.hourlyRate));
  const [notes, setNotes] = useState(student.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseNumberDots(hourlyRate);
    if (!name || rate <= 0) {
      alert("Nama dan tarif per jam wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'students', student.id), {
        name: name.trim(),
        hourlyRate: rate,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      alert("Gagal memperbarui data murid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Edit Data Murid</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-light text-primary rounded-md">
              Ubah Tarif
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Perubahan tarif hanya berlaku untuk sesi baru. Sesi dan laporan yang sudah dicatat sebelumnya tetap aman menggunakan tarif lama.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Murid</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif per Jam (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-primary select-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(formatNumberDots(e.target.value))}
                placeholder="Contoh: 100.000"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / Jenjang (Opsional)</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Kelas 8 SMP"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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
              disabled={loading}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Perbarui Murid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
