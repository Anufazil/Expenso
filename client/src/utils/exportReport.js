/**
 * Monthly report exports (PDF + CSV). Runs entirely in the browser.
 * jsPDF is loaded on demand so it doesn't bloat the main bundle.
 *
 * NOTE: jsPDF's built-in fonts have no rupee glyph, so the PDF uses "Rs."
 */

export const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
};

const money = (n) =>
  'Rs. ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Oldest first - reads like a statement
const chronological = (txs) =>
  [...txs].sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt));

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------- CSV ------------------------------- */

// Neutralise spreadsheet formula injection (=, +, -, @) in user-entered text
const safeText = (v) => {
  const s = String(v ?? '');
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};
const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function exportCSV(report) {
  const header = ['Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Notes'];
  const rows = chronological(report.transactions).map((t) => [
    new Date(t.date).toISOString().slice(0, 10),
    safeText(t.title),
    t.type === 'income' ? 'Income' : 'Expense',
    safeText(t.category),
    Number(t.amount).toFixed(2),
    safeText(t.notes),
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  // BOM so Excel opens it as UTF-8
  download(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `expenso-${report.month}.csv`);
}

/* ------------------------------- PDF ------------------------------- */

export async function buildPDF(report, user) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  // Works for both ESM (webpack) and CJS-interop (node) module shapes
  const autoTable =
    [autoTableModule.autoTable, autoTableModule.default, autoTableModule.default?.autoTable, autoTableModule.default?.default].find(
      (f) => typeof f === 'function'
    );

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const INDIGO = [67, 56, 202];
  const GREEN = [22, 130, 80];
  const RED = [200, 30, 90];

  const { totals, categoryBreakdown, transactions } = report;

  // ----- Header band -----
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, W, 84, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Expenso', M, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Monthly Report', M, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(monthLabel(report.month), W - M, 40, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (user) doc.text(`${user.fullName} | ${user.email}`, W - M, 60, { align: 'right' });

  // ----- Summary boxes -----
  const boxes = [
    ['Total Income', totals.totalIncome, GREEN],
    ['Total Expense', totals.totalExpense, RED],
    ['Balance', totals.balance, INDIGO],
  ];
  const gap = 12;
  const bw = (W - M * 2 - gap * 2) / 3;
  boxes.forEach(([label, value, color], i) => {
    const x = M + i * (bw + gap);
    doc.setDrawColor(220, 220, 230);
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(x, 106, bw, 58, 8, 8, 'FD');
    doc.setTextColor(110, 110, 125);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(label.toUpperCase(), x + 12, 124);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(money(value), x + 12, 146);
  });

  doc.setTextColor(110, 110, 125);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${totals.count} transaction${totals.count === 1 ? '' : 's'} in this month`, M, 184);

  let y = 206;
  const sectionTitle = (text) => {
    if (y > H - 120) {
      doc.addPage();
      y = 50;
    }
    doc.setTextColor(30, 30, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(text, M, y);
    y += 8;
  };

  const tableBase = {
    margin: { left: M, right: M },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 5, textColor: [40, 40, 50] },
    headStyles: { fillColor: INDIGO, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 247, 252] },
  };

  // ----- Spending by category -----
  if (categoryBreakdown.length > 0) {
    sectionTitle('Spending by category');
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Category', 'Spent', '% of expenses']],
      body: categoryBreakdown.map((c) => [
        c.category,
        money(c.total),
        totals.totalExpense ? `${((c.total / totals.totalExpense) * 100).toFixed(1)}%` : '-',
      ]),
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.section === 'head' && data.column.index > 0) data.cell.styles.halign = 'right';
      },
    });
    y = doc.lastAutoTable.finalY + 28;
  }

  // ----- All transactions -----
  sectionTitle('All transactions');
  if (transactions.length === 0) {
    doc.setTextColor(120, 120, 135);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('No transactions recorded for this month.', M, y + 16);
  } else {
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['Date', 'Title', 'Category', 'Type', 'Amount', 'Notes']],
      body: chronological(transactions).map((t) => [
        fmtDate(t.date),
        t.title,
        t.category,
        t.type === 'income' ? 'Income' : 'Expense',
        `${t.type === 'income' ? '+' : '-'}${money(t.amount)}`,
        t.notes || '',
      ]),
      columnStyles: {
        0: { cellWidth: 62 },
        1: { cellWidth: 118 },
        2: { cellWidth: 68 },
        3: { cellWidth: 48 },
        4: { cellWidth: 82, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          data.cell.styles.textColor = data.row.raw[3] === 'Income' ? GREEN : RED;
        }
        if (data.section === 'head' && data.column.index === 4) data.cell.styles.halign = 'right';
      },
    });
  }

  // ----- Footer on every page -----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 150);
    doc.text(`Generated by Expenso on ${new Date().toLocaleString('en-IN')}`, M, H - 22);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 22, { align: 'right' });
  }

  return doc;
}

export async function exportPDF(report, user) {
  const doc = await buildPDF(report, user);
  doc.save(`expenso-${report.month}.pdf`);
}
