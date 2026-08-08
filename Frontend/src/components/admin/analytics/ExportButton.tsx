'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ExportButtonProps {
  categoryType: string;
  rangeKey: string;
}

export function ExportButton({ categoryType, rangeKey }: ExportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async (formatType: 'csv' | 'json') => {
    setDownloading(true);
    try {
      const response = await apiClient.get('/admin/analytics/export', {
        params: { category_type: categoryType, format_type: formatType, range_key: rangeKey },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `presently_${categoryType}_${rangeKey}.${formatType}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export analytics', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={downloading}
        className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
        <span>CSV</span>
      </button>

      <button
        onClick={() => handleExport('json')}
        disabled={downloading}
        className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        <FileJson className="h-3.5 w-3.5 text-indigo-400" />
        <span>JSON</span>
      </button>
    </div>
  );
}
