import { InvoiceData } from '../types';
import { generateInvoiceHTML } from '../utils/invoice-generator';

export const useInvoice = () => {
  const generateInvoice = (data: InvoiceData) => generateInvoiceHTML(data);

  const printInvoice = (data: InvoiceData) => {
    const html = generateInvoiceHTML(data);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); }, 500);
    }
  };

  const downloadInvoice = async (data: InvoiceData) => {
    const html = generateInvoiceHTML(data);

    // Create a hidden container to render the invoice
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.background = '#fff';
    container.style.padding = '20px';
    container.innerHTML = html.replace(/<!DOCTYPE[^>]*>|<\/?html[^>]*>|<\/?head[^>]*>|<title[^>]*>.*?<\/title>|<meta[^>]*>|<\/?body[^>]*>/gi, '');
    document.body.appendChild(container);

    // Extract and apply styles from the HTML
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      const styleEl = document.createElement('style');
      styleEl.textContent = styleMatch[1];
      container.prepend(styleEl);
    }

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      // Download PNG
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phieu-thu-${data.studentName.replace(/ /g, '-')}-${data.month}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (e) {
      console.error('PNG export failed:', e);
      // Fallback to HTML download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phieu-thu-${data.studentName.replace(/ /g, '-')}-${data.month}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      document.body.removeChild(container);
    }
  };

  return { generateInvoice, printInvoice, downloadInvoice };
};