import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserModel, StudentModel, SessionModel } from '../types';
import { formatRupiah } from './currency';
import { formatDateIndo, formatTimeOnly } from './date';
import { formatDurationHuman } from './calculator';

export const generateInvoicePdf = (
  user: UserModel,
  student: StudentModel,
  sessions: SessionModel[],
  monthYearStr: string
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 16;
  let currentY = 20;
  const primaryColor: [number, number, number] = [14, 94, 119]; // #0E5E77

  // 1. Header Invoice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FAKTUR LES PRIVAT', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode: ${monthYearStr}`, margin, currentY + 6);

  // Right Header: Teacher info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(user.displayName, 210 - margin, currentY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(user.email, 210 - margin, currentY + 5, { align: 'right' });
  doc.text('Tutor / Pengajar Mandiri', 210 - margin, currentY + 9, { align: 'right' });

  currentY += 15;

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, 210 - margin, currentY);
  currentY += 6;

  // 2. Info Murid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, 210 - margin * 2, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DITUJUKAN KEPADA:', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Orang Tua / Wali dari ${student.name}`, margin + 4, currentY + 11.5);

  if (student.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`(${student.notes})`, margin + 4 + doc.getTextWidth(`Orang Tua / Wali dari ${student.name} `), currentY + 11.5);
  }

  currentY += 21;

  // 3. Table of Sessions
  const tableData = sessions.map((s, index) => [
    (index + 1).toString(),
    `${formatDateIndo(s.startTime)}\n${formatTimeOnly(s.startTime)} - ${formatTimeOnly(s.endTime)}`,
    s.topic || 'Les Reguler',
    formatDurationHuman(s.billedDurationMinutes),
    formatRupiah(s.hourlyRate),
    formatRupiah(s.totalFee),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Tanggal & Waktu', 'Topik / Materi Pembahasan', 'Durasi', 'Tarif/Jam', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Calculate totals
  const totalFee = sessions.reduce((acc, s) => acc + s.totalFee, 0);
  const totalMinutes = sessions.reduce((acc, s) => acc + s.billedDurationMinutes, 0);

  // @ts-ignore
  let finalY = (doc as any).lastAutoTable?.finalY || currentY + 40;
  finalY += 6;

  // If table went near bottom, add a new page
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }

  // Total Summary
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Total Waktu: ${Math.floor(totalMinutes / 60)} jam ${totalMinutes % 60} menit (${sessions.length} Sesi)`,
    210 - margin,
    finalY,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`TOTAL TAGIHAN: ${formatRupiah(totalFee)}`, 210 - margin, finalY + 6, {
    align: 'right',
  });

  finalY += 14;

  // 4. Payment Bank Details Box & Signature
  if (user.bankName && user.accountNumber) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, finalY, 105, 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Metode Pembayaran Transfer:', margin + 4, finalY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Bank / E-Wallet : ${user.bankName}`, margin + 4, finalY + 11.5);
    doc.text(`No. Rekening    : ${user.accountNumber}`, margin + 4, finalY + 16.5);
    doc.text(`Atas Nama       : ${user.accountHolderName || user.displayName}`, margin + 4, finalY + 21.5);

    // Signature on the right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Hormat Saya,', 210 - margin - 22, finalY + 6, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(user.displayName, 210 - margin - 22, finalY + 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Pengajar Les Privat', 210 - margin - 22, finalY + 24, { align: 'center' });
  }

  return doc;
};

export const shareOrDownloadPdf = async (
  doc: jsPDF,
  filename: string
): Promise<void> => {
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });

  // Try Web Share API (native iOS / Android share sheet)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: `Berikut adalah faktur les privat untuk ${filename.replace('.pdf', '')}.`,
      });
      return;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return; // User dismissed share sheet
      }
    }
  }

  // Fallback: download via jsPDF
  doc.save(filename);
};
