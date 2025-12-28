export const capitalize = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const removeSpaces = (str: string): string => {
  return str.replace(/\s+/g, '');
};
