import React, { useState } from 'react';
import { SERVICES_CATALOG } from '../data/servicesCatalog';
import { ServiceTypeId } from '../types/proposal';
import { FileText, Clock, Building2, CheckCircle2, Search, X } from 'lucide-react';

interface HoursBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServiceId: ServiceTypeId;
  onSelectService?: (id: ServiceTypeId) => void;
}

export const HoursBenchmarkModal: React.FC<HoursBenchmarkModalProps> = ({
  isOpen,
  onClose,
  selectedServiceId,
  onSelectService,
}) => {
  const [activeTab, setActiveTab] = useState<ServiceTypeId>(selectedServiceId);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const currentService = SERVICES_CATALOG[activeTab];

  const filteredServices = Object.values(SERVICES_CATALOG).filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/10 text-purple-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Base de Mensuração de Horas · SIGA SW
              </h2>
              <p className="text-xs text-neutral-500">
                Extraído do histórico operacional oficial Hiro Comunicação (Relatório de Horas PDF)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Service Selector list */}
          <div className="w-72 border-r border-neutral-200 bg-neutral-50/50 flex flex-col p-3 gap-2 overflow-y-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div className="space-y-1 mt-1">
              {filteredServices.map((svc) => {
                const isActive = svc.id === activeTab;
                return (
                  <button
                    key={svc.id}
                    onClick={() => {
                      setActiveTab(svc.id);
                      if (onSelectService) onSelectService(svc.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="truncate">{svc.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-purple-700 text-purple-100' : 'bg-neutral-200/60 text-neutral-600'
                      }`}
                    >
                      {svc.contractTypeDefault === 'mensal' ? 'Mensal' : 'Pontual'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Service Benchmark Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-600">
                  {currentService.category}
                </span>
                <span className="text-neutral-300">·</span>
                <span className="text-[11px] text-neutral-500">
                  Taxa Agência Hiro: R$ 200,00/h
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">{currentService.name}</h3>
              <p className="text-xs text-neutral-600 mt-1">{currentService.shortDesc}</p>
            </div>

            {/* Distribution of Hours across roles */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Alocação Típica de Profissionais e Horas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {currentService.defaultRoleHours.map((rh, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-neutral-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <span className="text-neutral-700 font-medium">{rh.role}</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {rh.hours}h
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-800">Total de horas alocadas:</span>
                <span className="font-mono font-extrabold text-sm text-neutral-950">
                  {currentService.defaultRoleHours.reduce((acc, r) => acc + r.hours, 0)} horas
                  {currentService.contractTypeDefault === 'mensal' ? ' / mês' : ' (projeto)'}
                </span>
              </div>
            </div>

            {/* Real SIGA SW Jobs Reference */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                Casos Reais Registrados no SIGA SW (Relatório de Horas PDF)
              </h4>
              <p className="text-xs text-neutral-500 mb-3">
                Exemplos de demandas e horas gastas registradas pela equipe técnica e de criação da Hiro:
              </p>

              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                      <th className="py-2 px-3">Identificador Job</th>
                      <th className="py-2 px-3">Cliente</th>
                      <th className="py-2 px-3">Descrição da Atividade</th>
                      <th className="py-2 px-3 text-right">Horas Gastas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {currentService.sigaJobReferences.map((ref, i) => (
                      <tr key={i} className="hover:bg-neutral-50/80">
                        <td className="py-2 px-3 font-mono text-purple-700 font-medium">{ref.jobId}</td>
                        <td className="py-2 px-3 font-medium text-neutral-900">{ref.client}</td>
                        <td className="py-2 px-3 text-neutral-600">{ref.description}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-neutral-800">
                          {ref.hours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scope highlights */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Escopo de Entregas Padrão Contemplado
              </h4>
              <div className="space-y-1.5">
                {currentService.defaultScopeItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-neutral-50 text-xs">
          <span className="text-neutral-500">
            Regra comercial: 10% de desconto à vista no boleto bancário.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
