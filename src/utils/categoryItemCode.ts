import type { Item } from '../types/pos';

export const getCategoryPrefix = (category: string): string => {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('matchbox')) return 'MBX';
  if (cat.includes('sparkler') || cat.includes('spark')) return 'SPK';
  if (cat.includes('chakkar') || cat.includes('wheel')) return 'CHK';
  if (cat.includes('pot')) return 'POT';
  if (cat.includes('fountain')) return 'FNT';
  if (cat.includes('pencil')) return 'PCL';
  if (cat.includes('whip') || cat.includes('saattai')) return 'WHP';
  if (cat.includes('rocket')) return 'RKT';
  if (cat.includes('bomb')) return 'BMB';
  if (cat.includes('wala') || cat.includes('chorsa') || cat.includes('garland')) return 'WLA';
  if (cat.includes('sound') || cat.includes('single')) return 'SND';
  if (cat.includes('aerial') || cat.includes('shot') || cat.includes('fancy') || cat.includes('cake') || cat.includes('tree')) return 'SHT';
  if (cat.includes('gun') || cat.includes('cap')) return 'GUN';
  if (cat.includes('gift') || cat.includes('box')) return 'GFT';
  if (cat.includes('flash') || cat.includes('smoke')) return 'FLS';
  if (cat.includes('kid') || cat.includes('novelty')) return 'KID';

  // Default fallback: First 3 letters of category uppercase
  const clean = category.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (clean.length >= 3) return clean.substring(0, 3);
  return (clean + 'CRK').substring(0, 3);
};

export const generateCategoryItemCode = (category: string, existingItems: Item[]): string => {
  const prefix = getCategoryPrefix(category);
  const existingCodes = existingItems.map(i => (i.itemCode || '').toUpperCase());

  let seq = 1;
  while (seq < 9999) {
    const candidate = `${prefix}${seq.toString().padStart(3, '0')}`;
    if (!existingCodes.includes(candidate)) {
      return candidate;
    }
    seq++;
  }
  return `${prefix}${Date.now().toString().slice(-4)}`;
};
