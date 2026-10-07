import { useState } from 'react';
import { ProposalData, ServiceTypeId } from './types/proposal';
import { SERVICES_CATALOG } from './data/servicesCatalog';
import { TopNav } from './components/TopNav';
import { ProposalForm } from './components/ProposalForm';
import { ProposalPreview } from './components/ProposalPreview';
import { HoursBenchmarkModal } from './components/HoursBenchmarkModal';
import { generateDocxBlob } from './utils/docxExport';
import { exportProposalToPdf, printProposal } from './utils/pdfExport';
import {
  FileText,
  SlidersHorizontal,
  Columns,
  Eye,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const INITIAL_SERVICE: ServiceTypeId = 'desenvolvimento_site';
const defaultServiceDef = SERVICES_CATALOG[INITIAL_SERVICE];

const INITIAL_PROPOSAL: ProposalData = {
  proposalCode: 'PROP.13168_SENSORIE_E-COMMERCE',
  issueDate: new Date().toISOString().split('T')[0],
  client: {
    companyName: 'Sensorie E-commerce',
    cnpj: '42.189.562/0001-90',
    contactName: 'Marcelo Pacheco',
    role: 'Diretor Comercial',
    phone: '(19) 99608-1111',
    email: 'marcelo.dias@terra.com.br',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP - CEP 01310-100',
    cpf: '298.114.789-00',
  },
  primaryServiceId: INITIAL_SERVICE,
  includedServices: [INITIAL_SERVICE],
  contractType: defaultServiceDef.contractTypeDefault,
  contractMonths: defaultServiceDef.defaultMonths,
  hourlyRate: 200, // Conforme solicitação: "O valor hora agência é R$ 200,00"
  items: [
    {
      serviceId: defaultServiceDef.id,
      title: defaultServiceDef.name,
      customScopeItems: [...defaultServiceDef.defaultScopeItems],
      customDeliverySchedule: [...defaultServiceDef.defaultDeliverySchedule],
      allocatedRoles: defaultServiceDef.defaultRoleHours.map((r) => ({ ...r })),
    },
  ],
  customObservations: [],
  customValidityDays: 10,
  customNoticeDays: 60,
};

export default function App() {
  const [proposal, setProposal] = useState<ProposalData>(INITIAL_PROPOSAL);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Export DOCX
  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await generateDocxBlob(proposal);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal.proposalCode || 'PROPOSTA_HIRO'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Proposta exportada em Word (.docx) com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar documento Word.', 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportProposalToPdf(
        'proposal-document-content',
        `${proposal.proposalCode || 'PROPOSTA_HIRO'}.pdf`
      );
      showToast('Proposta exportada em PDF oficial com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PDF. Tente usar a opção Imprimir.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    printProposal();
  };

  // Reset to initial
  const handleReset = () => {
    if (window.confirm('Deseja redefinir os dados da proposta para o padrão?')) {
      setProposal(INITIAL_PROPOSAL);
      showToast('Proposta redefinida com sucesso.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-900">
      {/* Top Navbar */}
      <TopNav
        proposalCode={proposal.proposalCode}
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        onPrint={handlePrint}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onReset={handleReset}
        isExportingPdf={isExportingPdf}
        isExportingDocx={isExportingDocx}
      />

      {/* Control Viewport Bar */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs print:hidden">
        {/* Left: View mode tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'split'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lado a Lado</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'editor'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Editar Escopo</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'preview'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Documento</span>
          </button>
        </div>

        {/* Center: Guidelines badge */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-neutral-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            Taxa Hiro: <strong>R$ 200,00/h</strong>
          </span>
          <span className="text-neutral-300">·</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            À vista no boleto: <strong>10% desconto</strong>
          </span>
          <span className="text-neutral-300">·</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Contratos: <strong>Adiantamento total</strong>
          </span>
        </div>

        {/* Right: Zoom Controls for document preview */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-md text-neutral-600">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:text-neutral-900 hover:bg-white rounded transition-colors"
              title="Reduzir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1.5 font-medium">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1 hover:text-neutral-900 hover:bg-white rounded transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsBenchmarkOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md font-semibold text-[11px] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Origem das Horas</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold transition-all animate-bounce bg-white border border-neutral-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-neutral-800">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Column */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <aside
            className={`overflow-y-auto p-4 sm:p-6 transition-all border-r border-neutral-200/80 bg-neutral-50/50 print:hidden ${
              viewMode === 'split'
                ? 'w-full lg:w-[480px] xl:w-[540px] shrink-0'
                : 'w-full max-w-4xl mx-auto'
            }`}
          >
            <div className="max-w-2xl mx-auto">
              <ProposalForm
                proposal={proposal}
                onChange={setProposal}
                onOpenBenchmark={() => setIsBenchmarkOpen(true)}
              />
            </div>
          </aside>
        )}

        {/* Live Preview Column */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <section className="flex-1 overflow-y-auto bg-neutral-200/70 p-4 sm:p-8 flex justify-center">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <ProposalPreview proposal={proposal} containerId="proposal-document-content" />
            </div>
          </section>
        )}
      </main>

      {/* Hours Benchmark Reference Modal */}
      <HoursBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        selectedServiceId={proposal.primaryServiceId}
        onSelectService={(svcId) => {
          // Can allow changing directly if desired
        }}
      />
    </div>
  );
}
