import React from 'react';
import { HiroLogo } from './HiroLogo';
import { FileDown, Printer, FileText, BarChart3, RefreshCw } from 'lucide-react';

interface TopNavProps {
  proposalCode: string;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onPrint: () => void;
  onOpenBenchmark: () => void;
  onReset: () => void;
  isExportingPdf: boolean;
  isExportingDocx: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  proposalCode,
  onExportPdf,
  onExportDocx,
  onPrint,
  onOpenBenchmark,
  onReset,
  isExportingPdf,
  isExportingDocx,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <HiroLogo className="h-8 w-auto" />
          <div className="hidden sm:block border-l border-neutral-200 pl-3">
            <span className="text-xs font-bold text-neutral-900 block leading-tight">
              Gerador de Propostas
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              Padrão Oficial Hiro · SIGA SW
            </span>
          </div>
        </div>

        {/* Central code identifier */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-mono text-neutral-700 font-medium">{proposalCode}</span>
        </div>

        {/* Action Buttons Zone */}
        <div className="flex items-center gap-2">
          {/* Base de Horas Button */}
          <button
            type="button"
            onClick={onOpenBenchmark}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-purple-700 bg-neutral-100 hover:bg-purple-50 rounded-lg border border-neutral-200 transition-colors"
            title="Consultar horas reais gastas no SIGA SW"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Base de Horas</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Resetar Proposta"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg transition-colors"
            title="Imprimir ou Salvar via Navegador"
          >
            <Printer className="w-4 h-4 text-neutral-500" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {/* Download Word DOCX */}
          <button
            type="button"
            onClick={onExportDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{isExportingDocx ? 'Gerando Word...' : 'Exportar Word'}</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExportingPdf ? 'Gerando PDF...' : 'Baixar PDF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
