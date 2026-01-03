"use client";

import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

interface ExportButtonsProps {
  proposalId: string;
}

export function ExportButtons({ proposalId }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "docx" | "xlsx") => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/proposals/${proposalId}/export/${format}`);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${proposalId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text/70 font-medium">Export:</span>
      <button
        onClick={() => handleExport("pdf")}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text/80 hover:text-text bg-background border border-text/20 hover:border-text/30 rounded-md transition-colors disabled:opacity-50"
        title="Export as PDF"
      >
        <FileText className="w-4 h-4" />
        PDF
      </button>
      <button
        onClick={() => handleExport("docx")}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text/80 hover:text-text bg-background border border-text/20 hover:border-text/30 rounded-md transition-colors disabled:opacity-50"
        title="Export as Word document"
      >
        <Download className="w-4 h-4" />
        DOCX
      </button>
      <button
        onClick={() => handleExport("xlsx")}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text/80 hover:text-text bg-background border border-text/20 hover:border-text/30 rounded-md transition-colors disabled:opacity-50"
        title="Export as Excel spreadsheet"
      >
        <FileSpreadsheet className="w-4 h-4" />
        XLSX
      </button>
    </div>
  );
}
