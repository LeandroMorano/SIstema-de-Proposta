export type ServiceTypeId =
  | 'identidade_visual'
  | 'desenvolvimento_site'
  | 'midia_paga'
  | 'gestao_seo'
  | 'gestao_geo'
  | 'materiais_impressos'
  | 'sistema_web'
  | 'redes_sociais'
  | 'producao_video'
  | 'producao_foto';

export interface ServiceDefinition {
  id: ServiceTypeId;
  name: string;
  category: 'Branding' | 'Web & Tech' | 'Marketing & Performance' | 'Audiovisual & Conteúdo';
  shortDesc: string;
  defaultScopeItems: string[];
  scopeDetailedDescription: {
    title: string;
    details: string[];
  }[];
  defaultDeliverySchedule: string[];
  defaultRoleHours: {
    role: string;
    hours: number;
  }[];
  contractTypeDefault: 'pontual' | 'mensal';
  defaultMonths: number;
  sigaJobReferences: {
    jobId: string;
    client: string;
    description: string;
    hours: string;
  }[];
  iconName: string;
}

export interface ClientData {
  companyName: string;
  cnpj: string;
  contactName: string;
  role: string;
  phone: string;
  email: string;
  address: string;
  cpf: string;
}

export interface AllocatedRole {
  role: string;
  hours: number;
}

export interface ProposalItemConfig {
  serviceId: ServiceTypeId;
  title: string;
  customScopeItems: string[];
  customDeliverySchedule: string[];
  allocatedRoles: AllocatedRole[];
  notes?: string;
}

export interface ProposalData {
  proposalCode: string;
  issueDate: string; // YYYY-MM-DD
  client: ClientData;
  primaryServiceId: ServiceTypeId;
  includedServices: ServiceTypeId[];
  contractType: 'pontual' | 'mensal';
  contractMonths: number; // e.g. 1, 6, 12, 13, 26
  hourlyRate: number; // default 200.00
  items: ProposalItemConfig[];
  customObservations: string[];
  additionalMediaBudgetMonthly?: number; // verba de anúncios adicional
  mediaFeePercentage?: number; // default 20% ou 10%
  customValidityDays: number; // default 10
  customNoticeDays: number; // default 60
}
