export const useCsv = () => {
  const fromCsv = (csv: string, hasHeaders = true, separator = ',') => {
    const lines = csv.split(/\r?\n/).filter(Boolean);
    let headers: string[];
    let dataLines: string[];
    if (hasHeaders) {
      headers = lines[0]!.split(separator);
      dataLines = lines.slice(1);
    } else {
      const firstLineValues = lines[0]!.split(separator);
      headers = firstLineValues.map((_, i) => `col${i + 1}`);
      dataLines = lines;
    }
    const rows = dataLines.map((line) => {
      const values = line.split(separator);
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
    return { rows, headers };
  };

  const toCsv = (data: Record<string, any>[], hasHeaders = true, separator = ',') => {
    if (!data || data.length === 0 || !data[0]) return '';
    const headers = hasHeaders
      ? Object.keys(data[0])
      : Object.keys(data[0]).map((_, i) => `col_${i + 1}`);
    const csvLines = data.map((item) => headers.map((header) => item[header]).join(separator));
    return [headers.join(separator), ...csvLines].join('\n');
  };

  const downloadCsv = (
    data: Record<string, any>[],
    filename = 'data.csv',
    hasHeaders = true,
    separator = ','
  ) => {
    const csvContent = toCsv(data, hasHeaders, separator);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    fromCsv,
    toCsv,
    downloadCsv,
  };
};
