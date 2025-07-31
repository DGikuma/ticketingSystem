import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToCSV(data: any[], filename = 'export.csv') {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(field => JSON.stringify(row[field] ?? '')).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function exportToPDF(data: any[], filename = 'export.pdf') {
  if (!data.length) return;

  const doc = new jsPDF();
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(field => row[field] ?? ''));

  autoTable(doc, {
    head: [headers],
    body: rows,
    styles: { fontSize: 10 },
    theme: 'striped',
  });

  doc.save(filename);
}
