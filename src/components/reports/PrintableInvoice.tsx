import React, { useState } from 'react';
import { UserModel, StudentModel, SessionModel } from '../../types';
import { formatRupiah } from '../../utils/currency';
import { formatDateIndo, formatTimeOnly } from '../../utils/date';
import { generateInvoicePdf, shareOrDownloadPdf } from '../../utils/pdfGenerator';
import { Printer, Share2, ArrowLeft, Loader2 } from 'lucide-react';

interface PrintableInvoiceProps {
  user: UserModel;
  student: StudentModel;
  sessions: SessionModel[];
  monthYearStr: string;
  onClose: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  user,
  student,
  sessions,
  monthYearStr,
  onClose,
}) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const totalFee = sortedSessions.reduce((acc, s) => acc + s.totalFee, 0);
  const totalMinutes = sortedSessions.reduce((acc, s) => acc + s.billedDurationMinutes, 0);
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  const handleExportPdf = async () => {
    setGeneratingPdf(true);
    try {
      const doc = generateInvoicePdf(user, student, sortedSessions, monthYearStr);
      const cleanStudentName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Invoice_${cleanStudentName}_${monthYearStr.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      await shareOrDownloadPdf(doc, filename);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses file PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center animate-fade-in">
      {/* Top Action Bar (Fixed safely below Dynamic Island) */}
      <div
        className="no-print w-full max-w-2xl px-3 pb-2.5 flex items-center justify-between shrink-0"
        style={{
          paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="w-full bg-white rounded-2xl p-3 shadow-lg border border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={generatingPdf}
              className="py-2 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
              title="Bagikan atau Simpan File PDF Asli (A4)"
            >
              {generatingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>Unduh / Bagikan PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
              title="Cetak langsung lewat printer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Document Paper Container */}
      <div
        className="flex-1 w-full overflow-y-auto px-3 sm:px-6 flex flex-col items-center no-scrollbar"
        style={{
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Invoice Document Paper (A4 Style) */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-slate-200 text-slate-800 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none mb-6">
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">FAKTUR LES PRIVAT</h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">No: {invoiceNumber}</p>
              <p className="text-[11px] sm:text-xs text-slate-500">Periode: {monthYearStr}</p>
            </div>

            <div className="text-right">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">{user.displayName}</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">{user.email}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Tutor / Pengajar Mandiri</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-4 sm:mb-6 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              DITUJUKAN KEPADA:
            </span>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Orang Tua / Wali dari {student.name.trim()}
              </h3>
              {student.notes && student.notes.trim() && (
                <span className="text-[11px] sm:text-xs text-slate-500 font-normal">
                  ({student.notes.trim()})
                </span>
              )}
            </div>
          </div>

          {/* Sessions Table with horizontal scroll on mobile */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 mb-6 no-scrollbar">
            <table className="min-w-[500px] w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                  <th className="py-2.5 px-3">Tanggal & Waktu</th>
                  <th className="py-2.5 px-3">Materi / Topik</th>
                  <th className="py-2.5 px-3 text-center">Durasi</th>
                  <th className="py-2.5 px-3 text-right">Tarif/Jam</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSessions.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td className="py-2.5 px-3 font-medium">
                      {formatDateIndo(s.startTime)}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {formatTimeOnly(s.startTime)} - {formatTimeOnly(s.endTime)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-pre-line leading-relaxed">{s.topic}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {s.billedDurationMinutes} mnt
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatRupiah(s.hourlyRate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatRupiah(s.totalFee)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-xs sm:text-sm bg-slate-50/50">
                  <td colSpan={3} className="py-2.5 px-3 text-slate-900">
                    Total Tagihan ({sortedSessions.length} Sesi, {Math.floor(totalMinutes/60)} jam {totalMinutes%60} mnt)
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-right text-primary font-black text-sm sm:text-base">
                    {formatRupiah(totalFee)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Instructions & Bank Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Instruksi Pembayaran:</h4>
              <p className="text-xs text-slate-600">Mohon transfer pembayaran ke:</p>
              <div className="mt-2.5 text-xs space-y-1.5 font-medium">
                <div className="grid grid-cols-[110px_12px_1fr] text-slate-800 items-center">
                  <span className="text-slate-500">Bank / E-Wallet</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold">{user.bankName || '-'}</span>
                </div>
                <div className="grid grid-cols-[110px_12px_1fr] text-slate-800 items-center">
                  <span className="text-slate-500">No. Rekening</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold">{user.accountNumber || '-'}</span>
                </div>
                <div className="grid grid-cols-[110px_12px_1fr] text-slate-800 items-center">
                  <span className="text-slate-500">Atas Nama</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold">{user.accountHolderName || user.displayName}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-end text-center p-2">
              <p className="text-xs text-slate-400 mb-12">Hormat Saya,</p>
              <p className="text-xs font-bold text-slate-900 underline">{user.displayName}</p>
              <p className="text-[10px] text-slate-400">Pengajar Les Privat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
