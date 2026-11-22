/**
 * Curated botanical specimen image reference library.
 * Provides authentic, high-quality botanical photographs for diagnosed plant species.
 * Used as reliable fallbacks when ephemeral device photos expire across sessions,
 * or as representative species imagery.
 */

// High quality, fast-loading Unsplash botanical CDN assets with optimal compression
const SPECIES_IMAGE_MAP: Record<string, string> = {
  // Solanaceae (Tomato, Potato, Pepper, Eggplant, Tobacco)
  tomato: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80",
  solanum: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80",
  tobacco: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80",
  nicotiana: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80",
  pepper: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80",
  capsicum: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80",
  eggplant: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80",

  // Vitaceae (Grape)
  grape: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80",
  vitis: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80",

  // Rosaceae (Apple, Rose, Strawberry, Peach, Cherry)
  apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
  malus: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
  rose: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
  rosa: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
  strawberry: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80",
  fragaria: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80",
  peach: "https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=400&q=80",
  cherry: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80",

  // Poaceae (Corn, Maize, Rice, Wheat)
  corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80",
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80",
  zea: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80",

  // Rutaceae (Citrus, Lemon, Orange)
  citrus: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80",
  lemon: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80",
  orange: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80",

  // Houseplants & Tropicals
  monstera: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80",
  pothos: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80",
  ficus: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80",
  succulent: "https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=400&q=80",
};

/**
 * Returns a high-definition botanical specimen image URL for a given plant name or species.
 * Matches common names, botanical binomials, or keywords.
 */
export function getSpeciesImage(plantName?: string | null): string | undefined {
  if (!plantName || !plantName.trim()) return undefined;

  const normalized = plantName.toLowerCase();

  for (const [key, url] of Object.entries(SPECIES_IMAGE_MAP)) {
    if (normalized.includes(key)) {
      return url;
    }
  }

  return undefined;
}
