import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { Edit, Lock, LogOut, X, Building, CreditCard, UserCheck } from 'lucide-react';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditProfile: () => void;
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  isOpen,
  onClose,
  onOpenEditProfile,
}) => {
  const { currentUser, logout, changePassword } = useAuth();
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setPassMsg({ text: 'Password minimal 6 karakter!', error: true });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ text: 'Konfirmasi password tidak cocok!', error: true });
      return;
    }
    try {
      await changePassword(newPass);
      setPassMsg({ text: 'Password berhasil diubah!', error: false });
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setShowChangePass(false), 1500);
    } catch (err: any) {
      setPassMsg({ text: err.message || 'Gagal mengubah password', error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto no-scrollbar transform transition-all"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Top Header: Drag Handle & Edit Icon Button */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-8" />
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
          <button
            onClick={() => {
              onClose();
              onOpenEditProfile();
            }}
            title="Edit Profil"
            className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center hover:bg-primary/20 transition shadow-sm"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Centered Avatar (Tappable) */}
        <div className="flex flex-col items-center mt-2">
          <button
            onClick={() => {
              onClose();
              onOpenEditProfile();
            }}
            className="group relative cursor-pointer focus:outline-none"
            title="Ubah Foto Profil"
          >
            <UserAvatar user={currentUser} size="xl" />
          </button>

          {/* Name & Email (Turun di bawah avatar) */}
          <h3 className="text-lg font-bold text-slate-900 mt-3 text-center">
            {currentUser.displayName}
          </h3>
          <p className="text-xs text-slate-500 text-center mt-0.5">
            {currentUser.email}
          </p>
        </div>

        <div className="my-5 border-t border-slate-100" />

        {/* Bank Details Card */}
        <div className="mb-5">
          <span className="text-xs font-bold text-slate-800 block mb-2">
            Rekening Pembayaran di Invoice
          </span>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">Bank / E-Wallet: {currentUser.bankName || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Nomor Rekening: {currentUser.accountNumber || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>Atas Nama: {currentUser.accountHolderName || '-'}</span>
            </div>
          </div>
        </div>

        {/* Change Password Collapsible */}
        {showChangePass ? (
          <form onSubmit={handleChangePass} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Ubah Password Akun</span>
              <button
                type="button"
                onClick={() => setShowChangePass(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {passMsg && (
              <p className={`text-[11px] ${passMsg.error ? 'text-red-600' : 'text-emerald-600'}`}>
                {passMsg.text}
              </p>
            )}
            <input
              type="password"
              placeholder="Password Baru (min 6 karakter)"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <input
              type="password"
              placeholder="Ulangi Password Baru"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-primary text-white font-semibold rounded-lg text-xs hover:bg-primary-hover transition"
            >
              Simpan Password
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowChangePass(true)}
            className="w-full py-2.5 px-4 mb-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Ubah Password Akun</span>
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Akun (Logout)</span>
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 text-center"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
