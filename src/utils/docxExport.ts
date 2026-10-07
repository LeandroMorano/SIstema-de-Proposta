import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageBreak,
  ShadingType,
} from 'docx';
import { ProposalData } from '../types/proposal';
import { SERVICES_CATALOG } from '../data/servicesCatalog';

export async function generateDocxBlob(proposal: ProposalData): Promise<Blob> {
  const primaryService = SERVICES_CATALOG[proposal.primaryServiceId] || SERVICES_CATALOG.desenvolvimento_site;

  // Calculate totals
  const allRolesMap: Record<string, number> = {};
  proposal.items.forEach((item) => {
    item.allocatedRoles.forEach((r) => {
      allRolesMap[r.role] = (allRolesMap[r.role] || 0) + r.hours;
    });
  });

  const totalHours = Object.values(allRolesMap).reduce((sum, h) => sum + h, 0);
  const hourlyRate = proposal.hourlyRate || 200;
  const isMonthly = proposal.contractType === 'mensal';
  const months = isMonthly ? (proposal.contractMonths || 12) : 1;

  const totalPeriodHours = isMonthly ? totalHours * months : totalHours;
  const totalBaseValue = isMonthly ? totalHours * hourlyRate * months : totalHours * hourlyRate;
  const monthlyValue = totalHours * hourlyRate;
  const discountRate = 0.10; // 10% de desconto à vista no boleto
  const atSightValue = totalBaseValue * (1 - discountRate);

  // Format currency
  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Format Date
  const formatDateBR = (isoDate: string) => {
    if (!isoDate) return new Date().toLocaleDateString('pt-BR');
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'B0C4DE' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'B0C4DE' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'B0C4DE' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'B0C4DE' },
  };

  // Resources Table Rows
  const resourceRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          shading: { fill: '5B9BD5', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Profissional alocado', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          shading: { fill: '5B9BD5', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: isMonthly ? 'Horas / mês' : 'Horas Totais',
                  bold: true,
                  color: 'FFFFFF',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  Object.entries(allRolesMap).forEach(([role, hours]) => {
    resourceRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun(role)] })],
          }),
          new TableCell({
            borders: tableBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun(String(hours).padStart(2, '0'))],
              }),
            ],
          }),
        ],
      })
    );
  });

  // Total Resource Row
  resourceRows.push(
    new TableRow({
      children: [
        new TableCell({
          borders: tableBorder,
          shading: { fill: 'EDF4FB', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'TOTAL:', bold: true })],
            }),
          ],
        }),
        new TableCell({
          borders: tableBorder,
          shading: { fill: 'EDF4FB', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `${totalHours} horas`, bold: true })],
            }),
          ],
        }),
      ],
    })
  );

  // Investment Table Rows
  const investmentRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          shading: { fill: '5B9BD5', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Itens de serviço', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '5B9BD5', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Valor hora', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '5B9BD5', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: isMonthly ? 'Horas mês' : 'Horas Total',
                  bold: true,
                  color: 'FFFFFF',
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '5B9BD5', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: isMonthly ? 'Valor mensal' : 'Valor Total',
                  bold: true,
                  color: 'FFFFFF',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: tableBorder,
          children: [
            new Paragraph({
              children: [new TextRun(`Horas Agência Hiro - ${primaryService.name}`)],
            }),
          ],
        }),
        new TableCell({
          borders: tableBorder,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun(formatMoney(hourlyRate))],
            }),
          ],
        }),
        new TableCell({
          borders: tableBorder,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun(`${totalHours}`)],
            }),
          ],
        }),
        new TableCell({
          borders: tableBorder,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: isMonthly ? formatMoney(monthlyValue) : formatMoney(totalBaseValue),
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  // Document Content Array
  const docChildren: Paragraph[] = [
    // COVER PAGE
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'HIRO COMUNICAÇÃO',
          bold: true,
          size: 36,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 3000 },
      children: [
        new TextRun({
          text: 'MARKETING DIGITAL & ESTRATÉGIA CRIATIVA',
          size: 18,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'PROPOSTA TÉCNICA',
          bold: true,
          size: 32,
          color: '000000',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: proposal.proposalCode,
          bold: true,
          size: 20,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `PROPOSTA COMERCIAL EMITIDA EM ${formatDateBR(proposal.issueDate)}`,
          size: 18,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `CONTATO: ${proposal.client.contactName.toUpperCase()}`,
          bold: true,
          size: 18,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `E-MAIL: ${proposal.client.email.toUpperCase()}`,
          size: 18,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 2500 },
      children: [
        new TextRun({
          text: `TEL: ${proposal.client.phone}`,
          size: 18,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Hiro Comunicação Ltda ME. - CNPJ: 168.896.78/0001-07',
          bold: true,
          size: 18,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'São Paulo - SP | www.hirocomunicacao.com.br',
          size: 16,
          color: '666666',
        }),
      ],
    }),

    // PAGE BREAK -> PAGE 2
    new Paragraph({ children: [new PageBreak()] }),

    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `A/C do Sr.(a) ${proposal.client.contactName}`,
          bold: true,
          size: 22,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Sobre a Hiro Comunicação:',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'Uma agência de comunicação especializada em Marketing Digital. Desde 2012, atendemos empresas locais e globais, planejando, criando e produzindo soluções de comunicação para marcas como Unilever, Word Trade Center-SP, Sheraton Hotel, Casa do Pão de Queijo, J&F, UOL, Intragroup, Luxottica, Swift, Ray-Ban, Vogue e Jacques Janine.',
          size: 20,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Proposta de serviços:',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Prestação de serviço com o seguinte escopo:',
          size: 20,
        }),
      ],
    }),
  ];

  // List of scope items
  let itemCounter = 1;
  proposal.items.forEach((item) => {
    item.customScopeItems.forEach((scope) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${String(itemCounter).padStart(2, '0')}. ${scope}`,
              size: 20,
            }),
          ],
        })
      );
      itemCounter++;
    });
  });

  // Detailed scope description
  docChildren.push(
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: 'Descrição do escopo de serviços:',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Esta proposta contempla as atividades realizadas ${
            isMonthly ? `ao longo de ${months} meses` : 'em projeto pontual com entrega em etapas'
          }. Todas as entregas estão descritas abaixo:`,
          size: 20,
        }),
      ],
    })
  );

  proposal.items.forEach((item) => {
    const sDef = SERVICES_CATALOG[item.serviceId];
    if (sDef) {
      sDef.scopeDetailedDescription.forEach((section) => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                size: 20,
              }),
            ],
          })
        );
        section.details.forEach((det) => {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 60 },
              children: [new TextRun({ text: det, size: 19 })],
            })
          );
        });
      });
    }
  });

  // Prazo de entrega
  docChildren.push(
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: 'Prazo de entrega dos materiais:',
          bold: true,
          size: 22,
        }),
      ],
    })
  );

  const deliverySchedule =
    proposal.items[0]?.customDeliverySchedule?.length > 0
      ? proposal.items[0].customDeliverySchedule
      : primaryService.defaultDeliverySchedule;

  deliverySchedule.forEach((sch) => {
    docChildren.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: `- ${sch}`, size: 19 })],
      })
    );
  });

  // Recursos Alocados
  docChildren.push(
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: 'Recursos Alocados:',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `No total serão alocados os seguintes profissionais para execução da operação (mensuração baseada no histórico SIGA SW):`,
          size: 19,
        }),
      ],
    })
  );

  const resourcesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: resourceRows,
  });

  // Observações
  const observationsParagraphs = [
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: 'Observações:',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `- Para a prestação dos serviços objeto deste Contrato, a CONTRATADA estimou o total de horas relacionadas acima, que corresponde ao valor descrito nesta proposta, sendo que, a CONTRATANTE poderá contratar horas adicionais pelo valor de ${formatMoney(
            hourlyRate
          )} caso seja necessário;`,
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `- A Hiro deverá apresentar periodicamente (semanalmente) à CONTRATANTE um relatório de horas gastas para a prestação dos serviços relacionados nesta proposta ou eventuais outras demandas solicitadas pela CONTRATANTE. Caso as horas contratadas estejam próximas do limite de horas contratadas, o CONTRATANTE será avisado por e-mail e poderá adquirir mais horas ou não. Toda a comunicação será feita por e-mail e a Hiro somente dará continuidade nos trabalhos mediante aprovação formal;`,
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `- O saldo de horas será fechado na conclusão do trabalho ou ao final de cada período contratual, o que significa que se houver horas extras a serem cobradas, serão faturadas ao final;`,
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `- A contratada considera que todas as informações necessárias para a execução do trabalho serão fornecidas pela contratante, como: acessos a domínios, servidores, redes sociais e bancos de imagens;`,
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `- O atendimento da contratada estará disponível para a contratante de segunda a sexta-feira das 09h às 18h.`,
          size: 19,
        }),
      ],
    }),
  ];

  // Investimento
  const investmentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: investmentRows,
  });

  const paymentParagraphs = [
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: 'Forma de Pagamento:',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `• Pagamento à Vista no Boleto (10% de desconto): ${formatMoney(atSightValue)}`,
          bold: true,
          size: 20,
          color: '006600',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: isMonthly
            ? `• No caso de contratação de período contratual (${months} meses), deve ser adiantado o valor total do contrato para a concessão do desconto de 10% à vista no boleto (Total com desconto: ${formatMoney(
                atSightValue
              )}).`
            : `• Valor integral com 10% de desconto para pagamento à vista no boleto bancário faturado contra aprovação da proposta.`,
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: isMonthly
            ? `• Opção Parcelada / Mensal: ${months} parcelas mensais de ${formatMoney(
                monthlyValue
              )} com vencimento para todo dia 10 / 20 / 25 via boleto bancário e nota fiscal.`
            : `• Opção Parcelada: 2x de ${formatMoney(totalBaseValue / 2)} (sendo 50% de entrada no aceite e 50% na entrega final dos materiais).`,
          size: 19,
        }),
      ],
    }),

    // Termos do acordo
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: 'Termos do acordo:',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: `- ${
            isMonthly
              ? `Contrato de prestação de serviços com vigência de ${months} meses;`
              : 'Contrato de prestação de serviços para execução do projeto descrito;'
          }`,
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: '- Pagamento via nota e boleto fiscal bancário;',
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: '- Todos os impostos, tributações e taxas na legislação vigente já estão inclusos neste valor;',
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: `- Em caso de rescisão contratual, deverá ser cumprido aviso prévio de ${
            proposal.customNoticeDays || 60
          } dias além da quitação de eventuais saldos remanescentes;`,
          size: 19,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: '- O atraso no pagamento dos honorários implicará na incidência de multa moratória de 02% (dois por cento), acrescido de juros de mora de 1% (um por cento) ao mês, além de correção monetária pelo IGPM/FGV.',
          size: 19,
        }),
      ],
    }),

    // Validade
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: 'Validade da proposta:',
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Esta proposta é válida por ${proposal.customValidityDays || 10} dias e após o período os valores estão passíveis de alteração.`,
          size: 19,
        }),
      ],
    }),

    // Responsabilidade e confidencialidade
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Responsabilidade contratual:',
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Após a assinatura da proposta e início do trabalho, a contratante e contratada exercem o compromisso com todas as responsabilidades descritas nesta proposta.',
          size: 19,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Termo de confidencialidade:',
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'A informação contida nesta proposta comercial destina-se estritamente à(s) pessoa(s) acima referida(s) e contém informação confidencial, legalmente protegida, para conhecimento exclusivo do(s) destinatário(s).',
          size: 19,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Termo de aceite:',
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'Referida proposta assinada tem força de Contrato Particular. Fica eleito o foro da Comarca da Sede da CONTRATADA como competente para dirimir eventuais questões ou litígios resultantes deste Contrato.',
          size: 19,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `São Paulo, ${formatDateBR(proposal.issueDate)}.`,
          bold: true,
          size: 20,
        }),
      ],
    }),

    // Assinaturas
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: '____________________________________________________',
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Razão Social: `, bold: true }),
        new TextRun(proposal.client.companyName || '_________________________________'),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `CNPJ: `, bold: true }),
        new TextRun(proposal.client.cnpj || '_________________________________'),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Endereço: `, bold: true }),
        new TextRun(proposal.client.address || '_________________________________'),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Nome do responsável legal: `, bold: true }),
        new TextRun(proposal.client.contactName || '_________________________________'),
      ],
    }),
    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({ text: `CPF: `, bold: true }),
        new TextRun(proposal.client.cpf || '_________________________________'),
      ],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: '____________________________________________________',
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Hiro Comunicação Ltda ME.', bold: true })],
    }),
    new Paragraph({
      spacing: { after: 400 },
      children: [new TextRun('CNPJ: 168.896.78/0001-07')],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: 'Testemunhas:', bold: true })],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun(
          '1. _____________________________         2. _____________________________\n   Nome:                                                   Nome:\n   CPF:                                                    CPF:'
        ),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          ...docChildren,
          new Paragraph({ spacing: { before: 200, after: 100 } }),
          resourcesTable,
          ...observationsParagraphs,
          new Paragraph({
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({
                text: 'Investimento:',
                bold: true,
                size: 22,
              }),
            ],
          }),
          investmentTable,
          ...paymentParagraphs,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
