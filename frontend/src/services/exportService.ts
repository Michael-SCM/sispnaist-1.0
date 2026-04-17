/**
 * Serviço para exportação de relatórios em PDF e XLS
 */

/**
 * Exporta dados para CSV (compatível com Excel)
 */
export const exportToCSV = (data: any[], filename: string = 'relatorio') => {
  if (!data || data.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  // Obter headers
  const headers = Object.keys(data[0]);
  
  // Criar CSV
  const csvRows = [
    headers.join(';'), // Headers
    ...data.map(row =>
      headers.map(header => {
        const value = (row as any)[header];
        // Escapar valores com ponto-e-vírgula ou aspas
        const escaped = String(value ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(';')
    )
  ];

  const csvContent = csvRows.join('\n');
  
  // Criar blob e download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporta dados para JSON
 */
export const exportToJSON = (data: any[], filename: string = 'relatorio') => {
  if (!data || data.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Gera PDF usando window.print() (solução simples sem bibliotecas externas)
 */
export const exportToPDF = (title: string = 'Relatório') => {
  // Criar versão para impressão
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Pop-up bloqueado. Permita pop-ups para exportar PDF.');
    return;
  }

  // Clonar conteúdo da página
  const content = document.body.innerHTML;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        @media print {
          body { margin: 0; }
          table { page-break-inside: avoid; }
          h1 { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      ${content}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};

/**
 * Hook para exportação de tabela
 */
export const useTableExport = (data: any[], title: string) => {
  const handleExportCSV = () => {
    exportToCSV(data, title);
  };

  const handleExportJSON = () => {
    exportToJSON(data, title);
  };

  const handleExportPDF = () => {
    exportToPDF(title);
  };

  return {
    handleExportCSV,
    handleExportJSON,
    handleExportPDF,
  };
};
