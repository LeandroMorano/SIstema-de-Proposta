import React, { useState } from 'react';
import { ProposalData, ServiceTypeId, AllocatedRole } from '../types/proposal';
import { SERVICES_CATALOG } from '../data/servicesCatalog';
import {
  Building2,
  User,
  Phone,
  Mail,
  Clock,
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Palette,
  Globe,
  TrendingUp,
  Search,
  Cpu,
  Printer,
  Code,
  Share2,
  Video,
  Camera,
  Calendar,
  Check,
  FileCheck,
} from 'lucide-react';

interface ProposalFormProps {
  proposal: ProposalData;
  onChange: (updated: ProposalData) => void;
  onOpenBenchmark: () => void;
  onNavigateToPreview: () => void;
}

const SERVICE_ICONS: Record<ServiceTypeId, React.ElementType> = {
  identidade_visual: Palette,
  desenvolvimento_site: Globe,
  midia_paga: TrendingUp,
  gestao_seo: Search,
  gestao_geo: Cpu,
  materiais_impressos: Printer,
  sistema_web: Code,
  redes_sociais: Share2,
  producao_video: Video,
  producao_foto: Camera,
};

export const ProposalForm: React.FC<ProposalFormProps> = ({
  proposal,
  onChange,
  onOpenBenchmark,
  onNavigateToPreview,
}) => {
  const [activeStep, setActiveStep] = useState<'cliente' | 'servico' | 'horas' | 'termos'>('cliente');

  const currentService = SERVICES_CATALOG[proposal.primaryServiceId];

  // Update client fields
  const handleClientChange = (field: string, value: string) => {
    let cleanCode = proposal.proposalCode;
    if (field === 'companyName' && value) {
      const sanitizedName = value.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 16);
      cleanCode = `PROP.${Math.floor(10000 + Math.random() * 90000)}_${sanitizedName}_${currentService.id.toUpperCase()}`;
    }

    onChange({
      ...proposal,
      client: {
        ...proposal.client,
        [field]: value,
      },
      proposalCode: cleanCode,
    });
  };

  // Switch primary service
  const handleServiceSelect = (serviceId: ServiceTypeId) => {
    const selectedDef = SERVICES_CATALOG[serviceId];
    const cleanCompany = (proposal.client.companyName || 'CLIENTE')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .slice(0, 16);

    const newCode = `PROP.${Math.floor(10000 + Math.random() * 90000)}_${cleanCompany}_${selectedDef.id.toUpperCase()}`;

    const newItems = [
      {
        serviceId: selectedDef.id,
        title: selectedDef.name,
        customScopeItems: [...selectedDef.defaultScopeItems],
        customDeliverySchedule: [...selectedDef.defaultDeliverySchedule],
        allocatedRoles: selectedDef.defaultRoleHours.map((r) => ({ ...r })),
      },
    ];

    onChange({
      ...proposal,
      primaryServiceId: serviceId,
      includedServices: [serviceId],
      proposalCode: newCode,
      contractType: selectedDef.contractTypeDefault,
      contractMonths: selectedDef.defaultMonths,
      items: newItems,
    });
  };

  // Toggle or edit scope item
  const handleToggleScopeItem = (itemText: string) => {
    if (!proposal.items[0]) return;
    const current = proposal.items[0].customScopeItems;
    let next: string[];
    if (current.includes(itemText)) {
      next = current.filter((s) => s !== itemText);
    } else {
      next = [...current, itemText];
    }
    const updatedItems = [...proposal.items];
    updatedItems[0] = { ...updatedItems[0], customScopeItems: next };
    onChange({ ...proposal, items: updatedItems });
  };

  // Add custom scope item
  const handleAddCustomScope = () => {
    const text = window.prompt('Digite a nova entrega / atividade para o escopo:');
    if (!text || !proposal.items[0]) return;
    const next = [...proposal.items[0].customScopeItems, text.trim()];
    const updatedItems = [...proposal.items];
    updatedItems[0] = { ...updatedItems[0], customScopeItems: next };
    onChange({ ...proposal, items: updatedItems });
  };

  // Update hours for a specific role
  const handleRoleHourChange = (roleIndex: number, newHours: number) => {
    if (!proposal.items[0]) return;
    const updatedRoles = [...proposal.items[0].allocatedRoles];
    updatedRoles[roleIndex] = {
      ...updatedRoles[roleIndex],
      hours: Math.max(0, newHours),
    };

    const updatedItems = [...proposal.items];
    updatedItems[0] = {
      ...updatedItems[0],
      allocatedRoles: updatedRoles,
    };

    onChange({
      ...proposal,
      items: updatedItems,
    });
  };

  // Add custom role
  const handleAddRole = () => {
    if (!proposal.items[0]) return;
    const newRole: AllocatedRole = { role: 'Novo Especialista', hours: 4 };
    const updatedRoles = [...proposal.items[0].allocatedRoles, newRole];
    const updatedItems = [...proposal.items];
    updatedItems[0] = { ...updatedItems[0], allocatedRoles: updatedRoles };
    onChange({ ...proposal, items: updatedItems });
  };

  // Remove role
  const handleRemoveRole = (roleIndex: number) => {
    if (!proposal.items[0]) return;
    const updatedRoles = proposal.items[0].allocatedRoles.filter((_, idx) => idx !== roleIndex);
    const updatedItems = [...proposal.items];
    updatedItems[0] = { ...updatedItems[0], allocatedRoles: updatedRoles };
    onChange({ ...proposal, items: updatedItems });
  };

  // Calculate totals
  const totalRolesHours =
    proposal.items[0]?.allocatedRoles.reduce((sum, r) => sum + r.hours, 0) || 0;
  const hourlyRate = proposal.hourlyRate || 200;
  const isMonthly = proposal.contractType === 'mensal';
  const months = isMonthly ? proposal.contractMonths || 12 : 1;
  const baseValue = isMonthly ? totalRolesHours * hourlyRate * months : totalRolesHours * hourlyRate;
  const monthlyValue = totalRolesHours * hourlyRate;
  const atSightValue = baseValue * 0.9; // 10% de desconto à vista no boleto

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Quick Preset Handlers
  const applyPreset = (presetKey: 'sensorie' | 'pin' | 'btz' | 'superfitas' | 'caplab') => {
    if (presetKey === 'sensorie') {
      handleClientChange('companyName', 'Sensorie E-commerce');
      handleClientChange('contactName', 'Marcelo Pacheco');
      handleClientChange('phone', '(19) 99608-1111');
      handleClientChange('email', 'marcelo.dias@terra.com.br');
      handleClientChange('address', 'Av. das Nações, 450 - Campinas - SP');
      handleServiceSelect('desenvolvimento_site');
    } else if (presetKey === 'pin') {
      handleClientChange('companyName', 'Pin Project 3D');
      handleClientChange('contactName', 'Róbson Lourenço');
      handleClientChange('phone', '(54) 99914-1714');
      handleClientChange('email', 'robsonlourenco87rl@gmail.com');
      handleClientChange('address', 'Caxias do Sul - RS');
      handleServiceSelect('midia_paga');
    } else if (presetKey === 'btz') {
      handleClientChange('companyName', 'Jaguafrangos / Grupo BTZ');
      handleClientChange('contactName', 'Thiago Francisco da Costa');
      handleClientChange('phone', '(43) 3374-2000');
      handleClientChange('email', 'contato@grupobtz.com.br');
      handleClientChange('address', 'Rua Mar Vermelho, 35 - Londrina - PR');
      handleServiceSelect('redes_sociais');
    } else if (presetKey === 'superfitas') {
      handleClientChange('companyName', 'Superfitas Indústria');
      handleClientChange('contactName', 'Fernando Farias');
      handleClientChange('phone', '(11) 99425-5022');
      handleClientChange('email', 'gerente.comercial@superfitas.com.br');
      handleClientChange('address', 'Rua Antônio Foster, 316 - Socorro, São Paulo - SP');
      handleServiceSelect('gestao_seo');
    } else if (presetKey === 'caplab') {
      handleClientChange('companyName', 'Cap-Lab Equipamentos');
      handleClientChange('contactName', 'Diretoria de Marketing');
      handleClientChange('phone', '(11) 3209-8800');
      handleClientChange('email', 'contato@caplab.com.br');
      handleClientChange('address', 'São Paulo - SP');
      handleServiceSelect('identidade_visual');
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-neutral-200/80 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveStep('cliente')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeStep === 'cliente'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. Cliente</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep('servico')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeStep === 'servico'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>2. Serviços</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep('horas')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeStep === 'horas'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>3. Horas & Valores</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep('termos')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeStep === 'termos'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>4. Cláusulas</span>
        </button>
      </div>

      {/* Floating Summary Pill */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-pink-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-300">
                {totalRolesHours}h {isMonthly ? '/ mês' : 'totais'}
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-[11px] font-mono text-pink-300 font-bold">
                R$ 200,00/h
              </span>
            </div>
            <div className="text-lg font-black font-mono tracking-tight text-white">
              {formatCurrency(isMonthly ? monthlyValue : baseValue)}
              {isMonthly && <span className="text-xs font-normal text-neutral-400"> / mês</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              À Vista no Boleto (10% OFF)
            </span>
            <span className="text-sm font-mono font-bold text-emerald-300">
              {formatCurrency(atSightValue)}
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToPreview}
            className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95"
          >
            Ver Proposta
          </button>
        </div>
      </div>

      {/* ========================================================
          STEP 1: CLIENTE E CONTATO
          ======================================================== */}
      {activeStep === 'cliente' && (
        <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Dados do Cliente e Representante
              </h3>
              <p className="text-xs text-neutral-500">
                Informações que constarão na capa, no cabeçalho e no termo de aceite
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-700 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Exemplos reais:</span>
            </div>
          </div>

          {/* Quick client presets */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('sensorie')}
              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-md font-medium transition-colors"
            >
              Sensorie
            </button>
            <button
              type="button"
              onClick={() => applyPreset('pin')}
              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-md font-medium transition-colors"
            >
              Pin Project 3D
            </button>
            <button
              type="button"
              onClick={() => applyPreset('btz')}
              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-md font-medium transition-colors"
            >
              Grupo BTZ
            </button>
            <button
              type="button"
              onClick={() => applyPreset('superfitas')}
              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-md font-medium transition-colors"
            >
              Superfitas
            </button>
            <button
              type="button"
              onClick={() => applyPreset('caplab')}
              className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-md font-medium transition-colors"
            >
              Cap-Lab
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                Nome da Empresa / Razão Social *
              </label>
              <input
                type="text"
                required
                value={proposal.client.companyName}
                onChange={(e) => handleClientChange('companyName', e.target.value)}
                placeholder="Ex: Sensorie E-commerce Ltda"
                className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white text-xs transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Nome do Representante / Contato *
              </label>
              <input
                type="text"
                required
                value={proposal.client.contactName}
                onChange={(e) => handleClientChange('contactName', e.target.value)}
                placeholder="Ex: Marcelo Pacheco"
                className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white text-xs transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                Telefone / Celular *
              </label>
              <input
                type="text"
                required
                value={proposal.client.phone}
                onChange={(e) => handleClientChange('phone', e.target.value)}
                placeholder="Ex: 19 99608 1111"
                className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white text-xs transition-all font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                E-mail de Contato *
              </label>
              <input
                type="email"
                required
                value={proposal.client.email}
                onChange={(e) => handleClientChange('email', e.target.value)}
                placeholder="Ex: marcelo.dias@terra.com.br"
                className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white text-xs transition-all font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                CNPJ da Empresa (para o termo de aceite)
              </label>
              <input
                type="text"
                value={proposal.client.cnpj}
                onChange={(e) => handleClientChange('cnpj', e.target.value)}
                placeholder="Ex: 42.189.562/0001-90"
                className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white text-xs transition-all font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                CPF do Representante (para assinatura)
              </label>
              <input
                type="text"
                value={proposal.client.cpf}
                onChange={(e) => handleClientChange('cpf', e.target.value)}
                placeholder="Ex: 298.114.789-00"
                className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white text-xs transition-all font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-neutral-700 mb-1">
                Endereço Completo da Empresa
              </label>
              <input
                type="text"
                value={proposal.client.address}
                onChange={(e) => handleClientChange('address', e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP - CEP 01310-100"
                className="w-full px-3.5 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 focus:bg-white text-xs transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStep('servico')}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Próximo: Escolher Serviços →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: ESCOLHER SERVIÇOS & ESCOPO
          ======================================================== */}
      {activeStep === 'servico' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">
                Selecione o Serviço da Proposta
              </h3>
              <p className="text-xs text-neutral-500">
                Clique para selecionar a modalidade principal. As horas e entregas serão configuradas automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(SERVICES_CATALOG).map((svc) => {
                const isSelected = svc.id === proposal.primaryServiceId;
                const IconComponent = SERVICE_ICONS[svc.id] || Globe;
                const totalHoursSvc = svc.defaultRoleHours.reduce((s, r) => s + r.hours, 0);

                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleServiceSelect(svc.id)}
                    className={`p-4 rounded-xl text-left transition-all border flex flex-col justify-between group relative ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-600/20 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-100 text-neutral-600 group-hover:bg-purple-100 group-hover:text-purple-700'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-purple-950' : 'text-neutral-900'
                            }`}
                          >
                            {svc.name}
                          </h4>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 font-medium block mt-0.5">
                          {svc.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                      {svc.shortDesc}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px]">
                      <span className="font-mono text-neutral-500">
                        Base: <strong>{totalHoursSvc}h</strong> {svc.contractTypeDefault === 'mensal' ? '/mês' : ''}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {svc.contractTypeDefault === 'mensal' ? 'Contrato Recorrente' : 'Projeto Pontual'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Deliverables Customization for Selected Service */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Atividades & Entregas Contempladas
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Marque ou desmarque para incluir no escopo da proposta comercial
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomScope}
                className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Atividade
              </button>
            </div>

            <div className="space-y-2">
              {currentService.defaultScopeItems.map((item, idx) => {
                const isIncluded =
                  proposal.items[0]?.customScopeItems.includes(item) ?? true;
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isIncluded
                        ? 'border-purple-200 bg-purple-50/40 text-neutral-900'
                        : 'border-neutral-200 bg-neutral-50/40 text-neutral-400 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={() => handleToggleScopeItem(item)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-600"
                    />
                    <span className="flex-1 font-medium leading-relaxed">{item}</span>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep('cliente')}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition-colors"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('horas')}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Próximo: Horas & Valores →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: HORAS E VALORES (R$ 200/h & 10% DESCONTO)
          ======================================================== */}
      {activeStep === 'horas' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Condições Comerciais & Vigência
                </h3>
                <p className="text-xs text-neutral-500">
                  Regras estabelecidas: R$ 200,00/hora e 10% de desconto à vista no boleto
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenBenchmark}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" />
                Auditar Horas Reais (SIGA SW)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Tipo de Prestação
                </label>
                <select
                  value={proposal.contractType}
                  onChange={(e) =>
                    onChange({
                      ...proposal,
                      contractType: e.target.value as 'pontual' | 'mensal',
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-xs focus:ring-1 focus:ring-purple-600"
                >
                  <option value="pontual">Projeto Pontual (Entrega Única)</option>
                  <option value="mensal">Contrato Recorrente (Mensal)</option>
                </select>
              </div>

              {proposal.contractType === 'mensal' ? (
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Duração do Contrato (Meses)
                  </label>
                  <select
                    value={proposal.contractMonths}
                    onChange={(e) =>
                      onChange({
                        ...proposal,
                        contractMonths: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-xs focus:ring-1 focus:ring-purple-600"
                  >
                    <option value={1}>01 Mês</option>
                    <option value={3}>03 Meses</option>
                    <option value={6}>06 Meses</option>
                    <option value={12}>12 Meses</option>
                    <option value={13}>13 Meses (Padrão Hiro Mídia)</option>
                    <option value={24}>24 Meses</option>
                    <option value={26}>26 Meses (Padrão Hiro Full Service)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Prazo de Entrega Estimado
                  </label>
                  <div className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium text-xs">
                    Até 30 dias úteis
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>Valor Hora Agência</span>
                  <span className="text-[10px] text-purple-600 font-mono font-bold">R$ 200,00</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-400 text-xs font-mono">R$</span>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={proposal.hourlyRate}
                    onChange={(e) =>
                      onChange({
                        ...proposal,
                        hourlyRate: Number(e.target.value),
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Financial Summary Highlight Box */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-neutral-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    Condição Exclusiva no Boleto à Vista:
                  </span>
                  <p className="text-[11px] text-emerald-800">
                    {isMonthly
                      ? 'No caso de contrato, adiantamento integral do valor total do contrato com 10% de desconto.'
                      : 'Pagamento integral à vista no boleto com 10% de desconto.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono line-through text-neutral-400 block">
                    {formatCurrency(baseValue)}
                  </span>
                  <span className="text-xl font-mono font-black text-emerald-700">
                    {formatCurrency(atSightValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation of Team Roles */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Equipe Alocada & Distribuição de Horas
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Horas atribuídas para cada papel técnico e criativo da Hiro
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRole}
                className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Função
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {proposal.items[0]?.allocatedRoles.map((roleItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/70 text-xs"
                >
                  <input
                    type="text"
                    value={roleItem.role}
                    onChange={(e) => {
                      const updated = [...proposal.items[0].allocatedRoles];
                      updated[idx] = { ...updated[idx], role: e.target.value };
                      const updatedItems = [...proposal.items];
                      updatedItems[0] = { ...updatedItems[0], allocatedRoles: updated };
                      onChange({ ...proposal, items: updatedItems });
                    }}
                    className="flex-1 font-semibold text-neutral-800 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-600 rounded px-1"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={roleItem.hours}
                      onChange={(e) => handleRoleHourChange(idx, Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-neutral-200 rounded font-mono font-bold text-center text-xs focus:ring-1 focus:ring-purple-600"
                    />
                    <span className="text-[11px] text-neutral-500 font-mono">h</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="text-neutral-400 hover:text-red-600 p-0.5 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-800">Total de Horas Calculadas:</span>
              <span className="font-mono font-black text-sm text-purple-700 bg-purple-50 px-3 py-1 rounded">
                {totalRolesHours} horas {isMonthly ? '/ mês' : ''}
              </span>
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep('servico')}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition-colors"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('termos')}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Próximo: Cláusulas & Termos →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 4: CLÁUSULAS & TERMOS
          ======================================================== */}
      {activeStep === 'termos' && (
        <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900">
              Identificação & Cláusulas da Proposta
            </h3>
            <p className="text-xs text-neutral-500">
              Código gerado automaticamente e termos contratuais padronizados da Hiro
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Código Oficial da Proposta
              </label>
              <input
                type="text"
                value={proposal.proposalCode}
                onChange={(e) => onChange({ ...proposal, proposalCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Data de Emissão</label>
              <input
                type="date"
                value={proposal.issueDate}
                onChange={(e) => onChange({ ...proposal, issueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Validade da Proposta (Dias)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={proposal.customValidityDays}
                onChange={(e) =>
                  onChange({ ...proposal, customValidityDays: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs text-neutral-600">
            <h4 className="font-bold text-neutral-800">Cláusulas Oficiais Inclusas no Documento:</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Relatório semanal de horas gastas e aviso prévio de contratação de horas adicionais (R$ 200/h);</li>
              <li>Condição de 10% de desconto à vista via boleto bancário (com adiantamento total em contratos);</li>
              <li>Multa moratória de 2% e juros de 1% ao mês com correção monetária IGPM/FGV;</li>
              <li>Termo de confidencialidade legal e eleição de foro na comarca de São Paulo;</li>
              <li>Espaço para assinaturas com firma do Contratante, Hiro Comunicação e Testemunhas.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep('horas')}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition-colors"
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={onNavigateToPreview}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              Visualizar Proposta Final →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
