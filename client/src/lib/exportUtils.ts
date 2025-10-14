//todo: remove mock functionality - use real export library
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    console.log('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`Exported ${data.length} items to ${filename}.csv`);
};

export const exportToPDF = (data: any[], filename: string) => {
  //todo: implement PDF export using a library like jsPDF
  console.log('PDF export would create:', filename);
  console.log('Data to export:', data);
  alert('PDF export functionality would be implemented with a library like jsPDF');
};
