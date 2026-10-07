import React from 'react';
import { ProposalData } from '../types/proposal';
import { SERVICES_CATALOG } from '../data/servicesCatalog';
import { HiroLogo, HiroGradientBar } from './HiroLogo';

interface ProposalPreviewProps {
  proposal: ProposalData;
  containerId?: string;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  proposal,
  containerId = 'proposal-document-content',
}) => {
  const primaryService =
    SERVICES_CATALOG[proposal.primaryServiceId] || SERVICES_CATALOG.desenvolvimento_site;

  // Aggregate roles and hours
  const allRolesMap: Record<string, number> = {};
  proposal.items.forEach((item) => {
    item.allocatedRoles.forEach((r) => {
      allRolesMap[r.role] = (allRolesMap[r.role] || 0) + r.hours;
    });
  });

  const totalHours = Object.values(allRolesMap).reduce((sum, h) => sum + h, 0);
  const hourlyRate = proposal.hourlyRate || 200;
  const isMonthly = proposal.contractType === 'mensal';
  const months = isMonthly ? proposal.contractMonths || 12 : 1;
  const totalPeriodHours = isMonthly ? totalHours * months : totalHours;

  const totalBaseValue = isMonthly ? totalHours * hourlyRate * months : totalHours * hourlyRate;
  const monthlyValue = totalHours * hourlyRate;
  const discountRate = 0.10; // 10% de desconto à vista no boleto
  const atSightValue = totalBaseValue * (1 - discountRate);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDateBR = (isoDate: string) => {
    if (!isoDate) return new Date().toLocaleDateString('pt-BR');
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const deliverySchedule =
    proposal.items[0]?.customDeliverySchedule?.length > 0
      ? proposal.items[0].customDeliverySchedule
      : primaryService.defaultDeliverySchedule;

  return (
    <div
      id={containerId}
      className="mx-auto flex flex-col items-center gap-8 py-6 print:py-0 print:gap-0 font-sans text-neutral-900"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ========================================================
          PAGE 1: CAPA (COVER PAGE)
          ======================================================== */}
      <div
        className="proposal-printable-page relative w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-xl print:shadow-none p-12 flex flex-col justify-between box-border overflow-hidden print:m-0 print:h-screen print:w-full"
        style={{ pageBreakAfter: 'always' }}
      >
        {/* Top Header Logo & Gradient Bar */}
        <div className="w-full flex flex-col items-center pt-8">
          <img
            src="/hiro-logo-transparent.png"
            alt="Hiro Comunicação"
            className="h-16 w-auto mb-6 select-none"
          />
          <HiroGradientBar height="h-1.5" />
        </div>

        {/* Middle/Bottom Proposta Técnica Info */}
        <div className="w-full my-auto flex flex-col items-end pr-4">
          <div className="w-full max-w-lg border-t border-neutral-300 pt-6 flex flex-col items-end text-right">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase mb-2">
              PROPOSTA TÉCNICA
            </h1>
            <p className="font-mono text-sm font-bold text-neutral-800 tracking-wider mb-2">
              {proposal.proposalCode}
            </p>
            <p className="text-xs font-semibold text-neutral-700 uppercase mb-1">
              PROPOSTA COMERCIAL EMITIDA EM {formatDateBR(proposal.issueDate)}
            </p>
            <p className="text-xs font-bold text-neutral-800 uppercase mb-1">
              CONTATO: {proposal.client.contactName || 'A DEFINIR'}
            </p>
            <p className="text-xs font-medium text-neutral-700 uppercase mb-1">
              E-MAIL: {proposal.client.email || 'A DEFINIR'}
            </p>
            <p className="text-xs font-medium text-neutral-700 uppercase mb-1">
              TEL: {proposal.client.phone || 'A DEFINIR'}
            </p>
          </div>
        </div>

        {/* Cover Footer */}
        <div className="w-full text-center pb-4 text-xs text-neutral-700 leading-relaxed border-t border-neutral-100 pt-4">
          <p className="font-bold text-neutral-900">Hiro Comunicação Ltda ME.</p>
          <p>CNPJ: 168.896.78/0001-07 · São Paulo–SP</p>
          <p className="text-neutral-500 text-[11px]">www.hirocomunicacao.com.br</p>
        </div>
      </div>

      {/* ========================================================
          PAGE 2: APRESENTAÇÃO & ESCOPO DE SERVIÇOS
          ======================================================== */}
      <div
        className="proposal-printable-page relative w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none px-12 py-10 flex flex-col justify-between box-border overflow-hidden print:m-0 print:min-h-screen print:w-full"
        style={{ pageBreakAfter: 'always' }}
      >
        <div>
          {/* Running Page Header */}
          <div className="w-full flex justify-between items-start text-[11px] text-neutral-600 border-b border-neutral-200 pb-2 mb-6">
            <div>
              <p className="font-semibold text-neutral-800">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p className="text-neutral-500">www.hirocomunicacao.com.br</p>
            </div>
            <div className="font-mono text-neutral-400 font-medium">Pág. 02</div>
          </div>

          {/* Recipient */}
          <div className="mb-5">
            <p className="text-sm font-bold text-neutral-900">
              A/C do(a) Sr.(a) {proposal.client.contactName}
              {proposal.client.companyName ? ` - ${proposal.client.companyName}` : ''}
            </p>
          </div>

          {/* Sobre a Hiro */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-1.5">
              Sobre a Hiro Comunicação:
            </h2>
            <p className="text-[12px] text-neutral-700 leading-relaxed text-justify">
              Uma agência de comunicação especializada em Marketing Digital. Desde 2012, atendemos
              empresas locais e globais, planejando, criando e produzindo soluções de comunicação
              para marcas como Unilever, Word Trade Center-SP, Sheraton Hotel, Casa do Pão de Queijo,
              J&F, UOL, Intragroup, Luxottica, Swift, Ray-Ban, Vogue e Jacques Janine.
            </p>
          </div>

          {/* Proposta de Serviços (Lista Resumida) */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-1.5">
              Proposta de serviços:
            </h2>
            <p className="text-[12px] text-neutral-700 mb-2">
              Prestação de serviço com o seguinte escopo:
            </p>
            <ol className="list-decimal list-inside text-[12px] text-neutral-800 space-y-1 pl-1">
              {proposal.items.flatMap((item) => item.customScopeItems).map((scope, idx) => (
                <li key={idx} className="leading-snug">
                  {scope}
                </li>
              ))}
            </ol>
          </div>

          {/* Descrição Detalhada do Escopo */}
          <div>
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-1.5">
              Descrição do escopo de serviços:
            </h2>
            <p className="text-[12px] text-neutral-700 leading-relaxed mb-3">
              Esta proposta contempla as atividades realizadas{' '}
              {isMonthly
                ? `ao longo de ${months} (${months === 1 ? 'um' : months}) meses de contrato contínuo.`
                : 'em formato de projeto pontual com acompanhamento integral.'}{' '}
              As entregas detalhadas estão descritas abaixo:
            </p>

            <div className="space-y-3">
              {proposal.items.map((item) => {
                const sDef = SERVICES_CATALOG[item.serviceId];
                if (!sDef) return null;
                return (
                  <div key={item.serviceId} className="space-y-2.5">
                    {sDef.scopeDetailedDescription.map((sec, secIdx) => (
                      <div key={secIdx} className="text-[12px]">
                        <h3 className="font-bold text-neutral-900 mb-1">{sec.title}:</h3>
                        <ul className="list-disc list-inside space-y-0.5 text-neutral-700 pl-1">
                          {sec.details.map((d, dIdx) => (
                            <li key={dIdx} className="leading-relaxed">
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Running Page Footer */}
        <div className="w-full pt-4 mt-6">
          <HiroGradientBar height="h-1" />
          <div className="flex justify-between items-center pt-2">
            <div className="text-[10px] text-neutral-500 leading-tight">
              <p className="font-semibold text-neutral-700">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p>www.hirocomunicacao.com.br</p>
            </div>
            <HiroLogo className="h-6 w-auto" />
          </div>
        </div>
      </div>

      {/* ========================================================
          PAGE 3: PRAZOS & TABELA DE RECURSOS ALOCADOS
          ======================================================== */}
      <div
        className="proposal-printable-page relative w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none px-12 py-10 flex flex-col justify-between box-border overflow-hidden print:m-0 print:min-h-screen print:w-full"
        style={{ pageBreakAfter: 'always' }}
      >
        <div>
          {/* Running Page Header */}
          <div className="w-full flex justify-between items-start text-[11px] text-neutral-600 border-b border-neutral-200 pb-2 mb-6">
            <div>
              <p className="font-semibold text-neutral-800">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p className="text-neutral-500">www.hirocomunicacao.com.br</p>
            </div>
            <div className="font-mono text-neutral-400 font-medium">Pág. 03</div>
          </div>

          {/* Prazo de entrega */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-2">
              Prazo de entrega dos materiais:
            </h2>
            <ul className="text-[12px] text-neutral-700 space-y-1 pl-1">
              {deliverySchedule.map((sch, sIdx) => (
                <li key={sIdx} className="leading-relaxed">
                  - {sch}
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos Alocados */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">
                Recursos Alocados:
              </h2>
            </div>
            <p className="text-[12px] text-neutral-700 leading-relaxed mb-3">
              No total serão alocados os seguintes profissionais para a execução técnica e estratégica
              da operação:
            </p>

            {/* Table styled identically to references (#5B9BD5 header) */}
            <div className="overflow-hidden border border-blue-200 rounded-sm mb-2">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#5B9BD5] text-white">
                    <th className="py-2 px-4 font-bold border-r border-blue-400">
                      Profissional alocado
                    </th>
                    <th className="py-2 px-4 font-bold text-center w-36">
                      {isMonthly ? 'Horas mês' : 'Horas Totais'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {Object.entries(allRolesMap).map(([role, hours], rIdx) => (
                    <tr
                      key={role}
                      className={rIdx % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}
                    >
                      <td className="py-1.5 px-4 text-neutral-800 border-r border-blue-100">
                        {role}
                      </td>
                      <td className="py-1.5 px-4 text-center font-mono text-neutral-900">
                        {String(hours).padStart(2, '0')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#EDF4FB] font-bold text-neutral-900 border-t-2 border-blue-300">
                    <td className="py-2 px-4 text-right border-r border-blue-200 uppercase tracking-wider text-[11px]">
                      TOTAL:
                    </td>
                    <td className="py-2 px-4 text-center font-mono text-blue-900 text-sm">
                      {totalHours}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-4">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-2">
              Observações:
            </h2>
            <div className="text-[11px] text-neutral-700 space-y-2 leading-relaxed text-justify">
              <p>
                - Para a prestação dos serviços objeto deste Contrato, a CONTRATADA estimou o total de
                horas relacionadas acima, que corresponde ao valor descrito nesta proposta, sendo
                que, a CONTRATANTE poderá contratar horas adicionais pelo valor de{' '}
                <strong className="text-neutral-900">{formatMoney(hourlyRate)}</strong> caso seja
                necessário;
              </p>
              <p>
                - A Hiro deverá apresentar periodicamente (semanalmente) à CONTRATANTE um relatório de
                horas gastas para a prestação dos serviços relacionados nesta proposta ou eventuais
                outras demandas solicitadas pela CONTRATANTE. Caso as horas contratadas estejam
                próximas do limite de horas contratadas, o CONTRATANTE será avisado por e-mail e
                poderá adquirir mais horas ou não. Toda a comunicação será formalizada via e-mail e a
                Hiro somente dará continuidade nos trabalhos mediante aprovação formal;
              </p>
              <p>
                - O saldo de horas será fechado na conclusão do trabalho ou ao final de cada período
                contratual, o que significa que se houver horas excedentes autorizadas a serem
                cobradas, serão faturadas ao final;
              </p>
              <p>
                - A contratada considera que todas as informações necessárias para a execução do
                trabalho serão fornecidas pela contratante, como: acessos a domínios, servidores, FTPs,
                redes sociais e bancos de imagens;
              </p>
              <p>
                - O atendimento da contratada estará disponível para a contratante de segunda a
                sexta-feira das 09h às 18h.
              </p>
            </div>
          </div>
        </div>

        {/* Running Page Footer */}
        <div className="w-full pt-4 mt-6">
          <HiroGradientBar height="h-1" />
          <div className="flex justify-between items-center pt-2">
            <div className="text-[10px] text-neutral-500 leading-tight">
              <p className="font-semibold text-neutral-700">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p>www.hirocomunicacao.com.br</p>
            </div>
            <HiroLogo className="h-6 w-auto" />
          </div>
        </div>
      </div>

      {/* ========================================================
          PAGE 4: INVESTIMENTO & FORMA DE PAGAMENTO (10% DESC.)
          ======================================================== */}
      <div
        className="proposal-printable-page relative w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none px-12 py-10 flex flex-col justify-between box-border overflow-hidden print:m-0 print:min-h-screen print:w-full"
        style={{ pageBreakAfter: 'always' }}
      >
        <div>
          {/* Running Page Header */}
          <div className="w-full flex justify-between items-start text-[11px] text-neutral-600 border-b border-neutral-200 pb-2 mb-6">
            <div>
              <p className="font-semibold text-neutral-800">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p className="text-neutral-500">www.hirocomunicacao.com.br</p>
            </div>
            <div className="font-mono text-neutral-400 font-medium">Pág. 04</div>
          </div>

          {/* Investimento */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-2">
              Investimento:
            </h2>

            <div className="overflow-hidden border border-blue-200 rounded-sm mb-4">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#5B9BD5] text-white">
                    <th className="py-2 px-4 font-bold border-r border-blue-400">
                      Itens de serviço
                    </th>
                    <th className="py-2 px-4 font-bold text-center border-r border-blue-400 w-28">
                      Valor hora
                    </th>
                    <th className="py-2 px-4 font-bold text-center border-r border-blue-400 w-28">
                      {isMonthly ? 'Horas mês' : 'Horas Total'}
                    </th>
                    <th className="py-2 px-4 font-bold text-right w-36">
                      {isMonthly ? 'Valor mensal' : 'Valor Total'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="py-2.5 px-4 text-neutral-900 font-medium border-r border-blue-100">
                      Horas Agência Hiro ({primaryService.name})
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-neutral-800 border-r border-blue-100">
                      {formatMoney(hourlyRate)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-neutral-800 border-r border-blue-100">
                      {totalHours}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-950">
                      {isMonthly ? formatMoney(monthlyValue) : formatMoney(totalBaseValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* In case of contract, show total period banner */}
            {isMonthly && (
              <div className="bg-neutral-50 border border-neutral-200 rounded p-3 mb-4 text-xs text-neutral-700 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-neutral-900">
                    Vigência Contratual: {months} meses
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    {totalHours}h/mês × {months} meses = {totalPeriodHours} horas totais contratadas
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-500 block">Valor Global Contrato:</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">
                    {formatMoney(totalBaseValue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-2">
              Forma de Pagamento:
            </h2>
            <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-4 rounded-r-md text-[12px] space-y-2 mb-3">
              <p className="font-bold text-emerald-900 text-sm flex items-center justify-between">
                <span>• Desconto para pagamento à vista no boleto (10% OFF):</span>
                <span className="font-mono text-emerald-700 text-base">
                  {formatMoney(atSightValue)}
                </span>
              </p>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                {isMonthly
                  ? 'No caso de contrato, para concessão da condição de 10% de desconto à vista no boleto, deve ser adiantado o valor total do contrato.'
                  : 'Condição exclusiva com 10% de desconto para liquidação integral à vista via boleto bancário.'}
              </p>
            </div>

            <div className="text-[12px] text-neutral-800 space-y-1.5 pl-1">
              {isMonthly ? (
                <>
                  <p>
                    <strong>• Opção Faturamento Mensal:</strong> {months} parcelas mensais de{' '}
                    <strong className="font-mono">{formatMoney(monthlyValue)}</strong> com vencimento para
                    todo dia 10 / 20 / 25 via boleto bancário e nota fiscal.
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    * Cada mensalidade dá direito à cota de {totalHours} horas no mês correspondente.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>• Opção Parcelada em 2x:</strong> 2 parcelas de{' '}
                    <strong className="font-mono">{formatMoney(totalBaseValue / 2)}</strong> (50% de entrada no
                    aceite e 50% na conclusão e entrega final do projeto).
                  </p>
                  <p>
                    <strong>• Opção Parcelada no Boleto / Cartão:</strong> até 10x de{' '}
                    <strong className="font-mono">
                      {formatMoney((totalBaseValue * 1.15) / 10)}
                    </strong>{' '}
                    (sujeito a taxas da operadora).
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Termos do acordo */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-2">
              Termos do acordo:
            </h2>
            <ul className="text-[11px] text-neutral-700 space-y-1 pl-1 leading-relaxed text-justify">
              <li>
                - {isMonthly ? `Contrato de prestação de serviços de ${months} meses;` : 'Contrato de prestação de serviços com execução imediata;'}
              </li>
              <li>- Pagamento via nota fiscal e boleto bancário;</li>
              <li>- Todos os impostos, tributações e taxas na legislação vigente já estão inclusos neste valor;</li>
              <li>
                - Em caso de rescisão contratual, deverá ser cumprido aviso prévio de{' '}
                {proposal.customNoticeDays || 60} dias além da quitação de eventuais saldos e multa de 20% sobre o saldo remanescente;
              </li>
              <li>
                - O atraso no pagamento dos honorários implicará na incidência de multa moratória de 02% (dois por cento),
                acrescido de juros de mora de 1% (um por cento) ao mês, além de correção monetária pelo IGPM/FGV, além
                de suspensão e execução do contrato, bem como a inserção nos cadastros de inadimplentes, sem necessidade de notificação.
              </li>
              {proposal.primaryServiceId === 'midia_paga' && (
                <li>
                  - Incidência de 20% de honorários Hiro sobre investimentos adicionais em mídia realizados acima do piso planejado.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Running Page Footer */}
        <div className="w-full pt-4 mt-6">
          <HiroGradientBar height="h-1" />
          <div className="flex justify-between items-center pt-2">
            <div className="text-[10px] text-neutral-500 leading-tight">
              <p className="font-semibold text-neutral-700">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p>www.hirocomunicacao.com.br</p>
            </div>
            <HiroLogo className="h-6 w-auto" />
          </div>
        </div>
      </div>

      {/* ========================================================
          PAGE 5: VALIDADE, TERMOS LEGAIS E ASSINATURAS
          ======================================================== */}
      <div
        className="proposal-printable-page relative w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none px-12 py-10 flex flex-col justify-between box-border overflow-hidden print:m-0 print:min-h-screen print:w-full"
      >
        <div>
          {/* Running Page Header */}
          <div className="w-full flex justify-between items-start text-[11px] text-neutral-600 border-b border-neutral-200 pb-2 mb-6">
            <div>
              <p className="font-semibold text-neutral-800">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p className="text-neutral-500">www.hirocomunicacao.com.br</p>
            </div>
            <div className="font-mono text-neutral-400 font-medium">Pág. 05</div>
          </div>

          {/* Validade */}
          <div className="mb-4">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-1">
              Validade da proposta:
            </h2>
            <p className="text-[11px] text-neutral-700 leading-relaxed">
              Esta proposta é válida por {proposal.customValidityDays || 10} dias e após o período os
              valores estão passíveis de alteração.
            </p>
          </div>

          {/* Responsabilidade Contratual */}
          <div className="mb-4">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-1">
              Responsabilidade contratual:
            </h2>
            <p className="text-[11px] text-neutral-700 leading-relaxed text-justify">
              Após a assinatura da proposta e início do trabalho, a contratante e contratada exercem o
              compromisso com todas as responsabilidades descritas nesta proposta-contrato.
            </p>
          </div>

          {/* Termo de Confidencialidade */}
          <div className="mb-4">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-1">
              Termo de confidencialidade:
            </h2>
            <p className="text-[11px] text-neutral-700 leading-relaxed text-justify">
              A informação contida nesta proposta comercial destina-se estritamente à(s) pessoa(s)
              acima referida(s) e contém informação confidencial, legalmente protegida, para conhecimento
              exclusivo do(s) destinatário(s). A leitura, exame, retransmissão, divulgação, distribuição,
              cópia ou outro uso desta comunicação por pessoas ou entidades que não sejam o(s)
              destinatário(s), constitui obtenção de informação por meio ilícito e configura crime
              previsto na legislação brasileira.
            </p>
          </div>

          {/* Termo de Aceite */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-neutral-950 uppercase tracking-wide mb-1">
              Termo de aceite:
            </h2>
            <p className="text-[11px] text-neutral-700 leading-relaxed text-justify">
              Referida proposta assinada tem força de Contrato Particular. Fica eleito o foro da
              Comarca da Sede da CONTRATADA como competente para dirimir eventuais questões ou
              litígios resultantes deste Contrato.
            </p>
          </div>

          {/* Data de Emissão */}
          <div className="mb-8">
            <p className="text-xs font-bold text-neutral-900">
              São Paulo, {formatDateBR(proposal.issueDate)}.
            </p>
          </div>

          {/* Assinatura Contratante */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-[11px] text-neutral-800 space-y-1">
              <div className="w-full border-b border-neutral-400 mb-2 pt-8" />
              <p>
                <strong className="text-neutral-950">Razão Social:</strong>{' '}
                {proposal.client.companyName || '__________________________________'}
              </p>
              <p>
                <strong className="text-neutral-950">CNPJ:</strong>{' '}
                {proposal.client.cnpj || '__________________________________'}
              </p>
              <p>
                <strong className="text-neutral-950">Endereço:</strong>{' '}
                {proposal.client.address || '__________________________________'}
              </p>
              <p>
                <strong className="text-neutral-950">Nome do responsável legal:</strong>{' '}
                {proposal.client.contactName || '__________________________________'}
              </p>
              <p>
                <strong className="text-neutral-950">CPF:</strong>{' '}
                {proposal.client.cpf || '__________________________________'}
              </p>
            </div>

            {/* Assinatura Contratada */}
            <div className="text-[11px] text-neutral-800 space-y-1">
              <div className="w-full border-b border-neutral-400 mb-2 pt-8" />
              <p className="font-bold text-neutral-950">Hiro Comunicação Ltda ME.</p>
              <p>CNPJ: 168.896.78/0001-07</p>
              <p>São Paulo - SP</p>
              <p className="text-neutral-500">Diretoria Executiva</p>
            </div>
          </div>

          {/* Testemunhas */}
          <div className="mt-4 pt-2 border-t border-neutral-200">
            <p className="text-[11px] font-bold text-neutral-900 mb-6">Testemunhas:</p>
            <div className="grid grid-cols-2 gap-10 text-[11px] text-neutral-700">
              <div>
                <div className="w-full border-b border-neutral-300 mb-1.5" />
                <p>Nome: _________________________________________</p>
                <p className="mt-1">CPF: __________________________________________</p>
              </div>
              <div>
                <div className="w-full border-b border-neutral-300 mb-1.5" />
                <p>Nome: _________________________________________</p>
                <p className="mt-1">CPF: __________________________________________</p>
              </div>
            </div>
          </div>
        </div>

        {/* Running Page Footer */}
        <div className="w-full pt-4 mt-6">
          <HiroGradientBar height="h-1" />
          <div className="flex justify-between items-center pt-2">
            <div className="text-[10px] text-neutral-500 leading-tight">
              <p className="font-semibold text-neutral-700">
                Hiro Comunicação LTDA. ME. - CNPJ: 168.896.78/0001-07
              </p>
              <p>www.hirocomunicacao.com.br</p>
            </div>
            <HiroLogo className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
