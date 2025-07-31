import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';

interface ExportMenuProps {
  data: any[];
  filename: string;
}

export default function ExportMenu({ data, filename }: ExportMenuProps) {
  return (
    <div className="flex gap-2 items-center justify-end mb-4">
      <Button onClick={() => exportToPDF(data, filename)} className="bg-blue-600 text-white">
        <Download className="mr-2 w-4 h-4" /> PDF
      </Button>
      <Button onClick={() => exportToCSV(data, filename)} className="bg-green-600 text-white">
        <Download className="mr-2 w-4 h-4" /> CSV
      </Button>
    </div>
  );
}
