import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { StudentModel } from '../../types';
import { formatRupiah } from '../../utils/currency';
import { EditStudentModal } from './EditStudentModal';
import { AddStudentModal } from './AddStudentModal';
import { Plus, Edit2, Trash2, GraduationCap, Loader2 } from 'lucide-react';

export const StudentsTab: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<StudentModel | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentModel | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'students'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: StudentModel[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StudentModel, 'id'>),
        }));
        setStudents(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await deleteDoc(doc(db, 'students', deletingStudent.id));
      setDeletingStudent(null);
    } catch (e) {
      alert("Gagal menghapus murid.");
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
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daftar Murid</h2>
          <p className="text-xs text-slate-500">Total {students.length} murid aktif</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      {students.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
          <div className="w-20 h-20 bg-indigo-50 text-primary rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Belum ada data murid</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5 max-w-xs">
            Tambahkan murid pertama kamu untuk mulai mencatat jam les dan honor.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Murid Baru</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {students.map((st) => (
            <div
              key={st.id}
              onClick={() => setEditingStudent(st)}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition group"
            >
              {/* Left: Avatar with Initial */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-base shrink-0 select-none">
                  {st.name[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition leading-tight">
                    {st.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-emerald-600">
                      {formatRupiah(st.hourlyRate)} / jam
                    </span>
                    {st.notes && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {st.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setEditingStudent(st)}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary-light hover:text-primary transition"
                  title="Edit Data Murid"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingStudent(st)}
                  className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                  title="Hapus Murid"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Modal */}
      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
      />

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-1.5">Hapus Murid?</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah kamu yakin ingin menghapus data murid <strong>"{deletingStudent.name}"</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
