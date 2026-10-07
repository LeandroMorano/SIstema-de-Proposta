import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportProposalToPdf(elementId: string, filename: string): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error('Elemento da proposta não encontrado para exportação em PDF.');
  }

  // Get all individual page elements inside the container
  const pageElements = container.querySelectorAll<HTMLElement>('.proposal-printable-page');

  if (pageElements.length === 0) {
    // Fallback: render entire container
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
    return;
  }

  // Multi-page export with exact A4 dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 794, // Standard A4 width at 96 DPI
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(filename);
}

export function printProposal(): void {
  window.print();
}
