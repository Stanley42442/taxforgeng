import {
  addCSVHeader,
  escapeCSVValue,
  downloadFile,
  generateFilename,
} from "./exportShared";

interface ClientBusiness {
  id: string;
  name: string;
  entity_type: string;
  turnover: number;
  cac_verified: boolean;
  sector: string | null;
  created_at: string;
}

export const exportClientBusinessesCSV = (clients: ClientBusiness[]) => {
  const headerLines = addCSVHeader('Client Businesses Export');
  
  const headers = ['Business Name', 'Entity Type', 'Turnover (NGN)', 'CAC Verified', 'Sector', 'Created Date'];
  
  const rows = clients.map(c => [
    escapeCSVValue(c.name),
    escapeCSVValue(c.entity_type === 'company' ? 'Limited Company' : 'Business Name'),
    escapeCSVValue(c.turnover),
    escapeCSVValue(c.cac_verified ? 'Yes' : 'No'),
    escapeCSVValue(c.sector || 'N/A'),
    escapeCSVValue(new Date(c.created_at).toLocaleDateString('en-NG')),
  ].join(','));

  const csvContent = [
    ...headerLines,
    headers.join(','),
    ...rows,
  ].join('\n');

  const filename = generateFilename('client-businesses', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  
  return filename;
};
