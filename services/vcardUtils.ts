
import { ContactInfo } from '../types';

export const generateVCardString = (contact: ContactInfo): string => {
  const { firstName, lastName, phone } = contact;
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${firstName} ${lastName}`,
    `TEL;TYPE=CELL:${phone}`,
    'END:VCARD'
  ].join('\n');
};

export const downloadVCard = (vCardString: string, filename: string): void => {
  const blob = new Blob([vCardString], { type: 'text/vcard' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const shareVCard = async (vCardString: string, filename: string): Promise<boolean> => {
  const blob = new Blob([vCardString], { type: 'text/vcard' });
  const file = new File([blob], `${filename}.vcf`, { type: 'text/vcard' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Contato VTC',
        text: 'Segue o contato gerado pelo Contatos VTC.'
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
      }
      return false;
    }
  }
  return false;
};

export const formatWhatsAppNumber = (rawNumber: string): string => {
  return rawNumber.replace(/\D/g, '');
};
