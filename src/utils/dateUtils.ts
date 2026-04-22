export const formatManualRange = (startStr: string, endStr: string) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!startStr || !endStr) return '';
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${formatDate(start)} - ${formatDate(end)}`;
};
