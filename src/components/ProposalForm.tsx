import React from 'react';
import { ProposalData, ServiceTypeId, AllocatedRole } from '../types/proposal';
import { SERVICES_CATALOG } from '../data/servicesCatalog';
import {
  Building2,
  User,
  Phone,
  Mail,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Layers,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';

interface ProposalFormProps {
  proposal: ProposalData;
  onChange: (updated: ProposalData) => void;
  onOpenBenchmark: () => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  proposal,
  onChange,
  onOpenBenchmark,
}) => {
  const currentService = SERVICES_CATALOG[proposal.primaryServiceId];

  // Update client fields
  const handleClientChange = (field: string, value: string) => {
    onChange({
      ...proposal,
      client: {
        ...proposal.client,
        [field]: value,
      },
      // Automatically refresh proposal code if company name changes and code was default
      proposalCode:
        field === 'companyName' && value
          ? `PROP.${Math.floor(10000 + Math.random() * 90000)}_${value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '_')
              .slice(0, 16)}_${currentService.id.toUpperCase()}`
          : proposal.proposalCode,
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

    // Initialize items with the new service
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

  // Calculate live summary
  const totalRolesHours =
    proposal.items[0]?.allocatedRoles.reduce((sum, r) => sum + r.hours, 0) || 0;
  const hourlyRate = proposal.hourlyRate || 200;
  const isMonthly = proposal.contractType === 'mensal';
  const months = isMonthly ? proposal.contractMonths || 12 : 1;
  const baseValue = isMonthly ? totalRolesHours * hourlyRate * months : totalRolesHours * hourlyRate;
  const monthlyValue = totalRolesHours * hourlyRate;
  const atSightValue = baseValue * 0.9;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Reference Presets
  const applyPreset = (presetType: 'ecommerce' | 'midia' | 'fullservice' | 'branding' | 'seo') => {
    if (presetType === 'ecommerce') {
      handleClientChange('companyName', 'Sensorie E-commerce');
      handleClientChange('contactName', 'Marcelo Pacheco');
      handleClientChange('phone', '(19) 99608-1111');
      handleClientChange('email', 'marcelo.dias@terra.com.br');
      handleServiceSelect('desenvolvimento_site');
    } else if (presetType === 'midia') {
      handleClientChange('companyName', 'Pin Project 3D');
      handleClientChange('contactName', 'Róbson Lourenço');
      handleClientChange('phone', '(54) 99914-1714');
      handleClientChange('email', 'robsonlourenco87rl@gmail.com');
      handleServiceSelect('midia_paga');
    } else if (presetType === 'fullservice') {
      handleClientChange('companyName', 'Grupo BTZ Alimentos');
      handleClientChange('contactName', 'Kátia Bauer');
      handleClientChange('phone', '(11) 98455-0011');
      handleClientChange('email', 'katia.bauer@grupobtz.com.br');
      handleServiceSelect('redes_sociais');
    } else if (presetType === 'branding') {
      handleClientChange('companyName', 'Cap-Lab Laboratórios');
      handleClientChange('contactName', 'Diretoria de Marketing');
      handleClientChange('phone', '(11) 97722-4411');
      handleClientChange('email', 'contato@caplab.com.br');
      handleServiceSelect('identidade_visual');
    } else if (presetType === 'seo') {
      handleClientChange('companyName', 'Superfitas Indústria');
      handleClientChange('contactName', 'Fernando Farias');
      handleClientChange('phone', '(11) 99425-5022');
      handleClientChange('email', 'gerente.comercial@superfitas.com.br');
      handleServiceSelect('gestao_seo');
    }
  };

  return (
    <div className="space-y-6 text-neutral-800">
      {/* Reference Presets Strip */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-white p-3.5 rounded-xl border border-purple-200/60 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Predefinições com Casos Reais de Referência:</span>
          </div>
          <button
            onClick={onOpenBenchmark}
            className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            Ver Base de Horas (SIGA SW)
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('ecommerce')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 rounded-md transition-colors"
          >
            Sensorie (E-commerce / Site)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('midia')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 rounded-md transition-colors"
          >
            Pin Project (Mídia Paga 13M)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('seo')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 rounded-md transition-colors"
          >
            Superfitas (SEO & Conteúdo)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('fullservice')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 rounded-md transition-colors"
          >
            Grupo BTZ (Redes Sociais / Full)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('branding')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-purple-100/70 border border-purple-200 text-purple-800 rounded-md transition-colors"
          >
            Cap-Lab (Identidade Visual)
          </button>
        </div>
      </div>

      {/* 1. SELEÇÃO DO TIPO DE SERVIÇO (10 SERVIÇOS SOLICITADOS) */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                1. Selecione o Tipo de Proposta Comercial
              </h3>
              <p className="text-[11px] text-neutral-500">
                10 modalidades especializadas Hiro mensuradas pelo Relatório de Horas SIGA SW
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
            {SERVICES_CATALOG[proposal.primaryServiceId].category}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(SERVICES_CATALOG).map((svc) => {
            const isSelected = svc.id === proposal.primaryServiceId;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => handleServiceSelect(svc.id)}
                className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600 shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50/40 hover:bg-neutral-100/70 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-purple-950' : 'text-neutral-800'
                    }`}
                  >
                    {svc.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-neutral-200/70 text-neutral-600'
                    }`}
                  >
                    {svc.contractTypeDefault === 'mensal' ? 'Recorrente' : 'Pontual'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {svc.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DADOS DO CLIENTE E REPRESENTANTE */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">2. Dados do Cliente e Representante</h3>
            <p className="text-[11px] text-neutral-500">
              Nome da empresa, representante, telefone e email solicitados na proposta
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              Nome da Empresa / Razão Social *
            </label>
            <input
              type="text"
              required
              value={proposal.client.companyName}
              onChange={(e) => handleClientChange('companyName', e.target.value)}
              placeholder="Ex: Sensorie Cosméticos Ltda."
              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              Nome do Representante Legal *
            </label>
            <input
              type="text"
              required
              value={proposal.client.contactName}
              onChange={(e) => handleClientChange('contactName', e.target.value)}
              placeholder="Ex: Marcelo Pacheco"
              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              Telefone / WhatsApp *
            </label>
            <input
              type="text"
              required
              value={proposal.client.phone}
              onChange={(e) => handleClientChange('phone', e.target.value)}
              placeholder="Ex: (19) 99608-1111"
              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              E-mail Comercial *
            </label>
            <input
              type="email"
              required
              value={proposal.client.email}
              onChange={(e) => handleClientChange('email', e.target.value)}
              placeholder="Ex: marcelo.dias@terra.com.br"
              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white text-xs"
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
              placeholder="Ex: 01.259.568/0001-34"
              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              CPF do Responsável (para assinatura)
            </label>
            <input
              type="text"
              value={proposal.client.cpf}
              onChange={(e) => handleClientChange('cpf', e.target.value)}
              placeholder="Ex: 058.330.629-26"
              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-neutral-700 mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              value={proposal.client.address}
              onChange={(e) => handleClientChange('address', e.target.value)}
              placeholder="Ex: Rua Antônio Foster, 316 - Socorro, São Paulo - SP - CEP: 04760-040"
              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 focus:bg-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. PARÂMETROS COMERCIAIS & HORAS (VALOR HORA = R$ 200,00) */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                3. Parâmetros Comerciais & Regras Financeiras
              </h3>
              <p className="text-[11px] text-neutral-500">
                Valor hora agência fixado em R$ 200,00 e 10% de desconto à vista no boleto
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Modelo de Contratação</label>
            <select
              value={proposal.contractType}
              onChange={(e) =>
                onChange({
                  ...proposal,
                  contractType: e.target.value as 'pontual' | 'mensal',
                })
              }
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
            >
              <option value="pontual">Projeto Pontual (Entrega Única)</option>
              <option value="mensal">Contrato Recorrente (Mensal)</option>
            </select>
          </div>

          {proposal.contractType === 'mensal' ? (
            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Vigência do Contrato
              </label>
              <select
                value={proposal.contractMonths}
                onChange={(e) =>
                  onChange({
                    ...proposal,
                    contractMonths: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value={1}>01 Mês (Piloto)</option>
                <option value={3}>03 Meses (Trimestral)</option>
                <option value={6}>06 Meses (Semestral)</option>
                <option value={12}>12 Meses (Anual)</option>
                <option value={13}>13 Meses (Padrão Hiro - Borges/Pin)</option>
                <option value={26}>26 Meses (Longo Prazo - Grupo BTZ)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Prazo de Execução Estimado
              </label>
              <div className="px-3 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-medium">
                Projeto fechado (até 30 dias úteis)
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-neutral-700 mb-1 flex items-center justify-between">
              <span>Valor Hora Agência</span>
              <span className="text-[10px] text-purple-600 font-mono">Diretriz: R$ 200,00</span>
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
                className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Live Calculation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="space-y-0.5">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">
              {isMonthly ? 'Valor Mensal' : 'Valor Total do Projeto'}
            </span>
            <span className="text-base font-extrabold font-mono text-neutral-900 block">
              {formatCurrency(isMonthly ? monthlyValue : baseValue)}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {totalRolesHours}h × {formatCurrency(hourlyRate)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">
              {isMonthly ? `Total Contrato (${months}m)` : 'Valor Integral'}
            </span>
            <span className="text-base font-extrabold font-mono text-neutral-900 block">
              {formatCurrency(baseValue)}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {isMonthly ? `${totalRolesHours * months}h totais` : `${totalRolesHours}h totais`}
            </span>
          </div>

          <div className="space-y-0.5 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center justify-between">
              <span>À Vista no Boleto</span>
              <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                10% OFF
              </span>
            </span>
            <span className="text-base font-extrabold font-mono text-emerald-700 block">
              {formatCurrency(atSightValue)}
            </span>
            <span className="text-[10px] text-emerald-700 block">
              {isMonthly
                ? 'Adiantamento total do contrato'
                : 'Pagamento faturado no boleto bancário'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. ALOCAÇÃO DE RECURSOS E HORAS DA EQUIPE (SIGA SW) */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                4. Recursos Alocados & Horas da Equipe
              </h3>
              <p className="text-[11px] text-neutral-500">
                Ajuste as horas por cargo conforme a complexidade da demanda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddRole}
            className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Cargo
          </button>
        </div>

        <div className="space-y-2">
          {proposal.items[0]?.allocatedRoles.map((roleItem, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 bg-neutral-50/70 hover:bg-neutral-100/60 rounded-lg border border-neutral-200/70 text-xs transition-colors"
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
                className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-200 rounded font-medium text-neutral-800 text-xs focus:ring-1 focus:ring-purple-600"
              />

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={roleItem.hours}
                  onChange={(e) => handleRoleHourChange(idx, Number(e.target.value))}
                  className="w-16 px-2 py-1.5 bg-white border border-neutral-200 rounded font-mono font-bold text-center text-xs focus:ring-1 focus:ring-purple-600"
                />
                <span className="text-neutral-500 text-[11px] font-mono">
                  {isMonthly ? 'h/mês' : 'h total'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRole(idx)}
                  className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                  title="Remover cargo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-xs">
          <span className="font-bold text-neutral-700">Total de Horas Calculadas:</span>
          <span className="font-mono font-bold text-sm text-purple-700 bg-purple-50 px-3 py-1 rounded">
            {totalRolesHours} horas {isMonthly ? '/ mês' : 'totais'}
          </span>
        </div>
      </div>

      {/* 5. CÓDIGO DA PROPOSTA E METADADOS */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">5. Identificação e Prazos Contratuais</h3>
            <p className="text-[11px] text-neutral-500">
              Controle de código da proposta, data e cláusula de validade
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Código Oficial da Proposta
            </label>
            <input
              type="text"
              value={proposal.proposalCode}
              onChange={(e) => onChange({ ...proposal, proposalCode: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Data de Emissão</label>
            <input
              type="date"
              value={proposal.issueDate}
              onChange={(e) => onChange({ ...proposal, issueDate: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-600"
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
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
