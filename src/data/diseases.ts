import type { DiseaseKnowledgeItem } from "../types/garden";

export const diseaseKnowledgeBase: DiseaseKnowledgeItem[] = [
  {
    id: "early-blight",
    name: "Early Blight",
    scientificName: "Alternaria solani",
    category: "Fungal",
    summary:
      "A prevalent fungal infection primarily affecting nightshade crops like tomatoes, potatoes, and eggplants, recognizable by distinctive concentric ring lesions on older foliage.",
    causes: [
      "Pathogenic fungus overwintering in infected plant debris and soil",
      "Prolonged periods of warm temperatures (24–29°C / 75–85°F) with high humidity or rainfall",
      "Splashing water from overhead irrigation spreading fungal spores from soil onto lower leaves",
      "Poor air circulation in dense planting arrangements",
    ],
    symptoms: [
      "Dark brown to black circular spots with conspicuous concentric 'bullseye' or target-like rings",
      "Chlorotic yellow halos developing around advancing lesion borders",
      "Gradual yellowing and premature dropping of lower foliage proceeding upward",
      "Dark, sunken, leathery cankers on stems and fruit calyx ends",
    ],
    prevention: [
      "Water exclusively at soil level using drip irrigation or soaker hoses to keep leaves dry",
      "Apply 2–3 inches of organic straw or mulch around plant bases to prevent soil splash",
      "Prune bottom 12–18 inches of lower leaves as plants mature to improve airflow",
      "Practice 3-to-4-year crop rotation with non-solanaceous botanical families",
      "Disinfect pruning shears with 70% isopropyl alcohol between plants",
    ],
    treatments: [
      "Prune and safely dispose of infected lower leaves immediately (do not compost)",
      "Apply preventative organic copper fungicide or Bacillus subtilis early in the morning",
      "Ensure staking or caging to keep foliage elevated off wet ground",
    ],
  },
  {
    id: "late-blight",
    name: "Late Blight",
    scientificName: "Phytophthora infestans",
    category: "Fungal",
    summary:
      "A devastating water-mold (oomycete) pathogen responsible for historic crop failures, causing rapid tissue collapse in cool, moist, and foggy weather.",
    causes: [
      "Wind-blown sporangia travelling over miles during cool, moist weather (15–20°C / 60–70°F)",
      "Free water or fog remaining on leaf surfaces for 8+ continuous hours",
      "Infected volunteer potatoes or seed tubers harbouring dormant mycelium",
    ],
    symptoms: [
      "Large, irregular water-soaked pale-green to dark brownish-black lesions",
      "White delicate fuzzy mold/sporulation on leaf undersides in high humidity",
      "Rapidly browning and collapsing foliage giving a frosted or burnt look",
      "Dark greasy lesions on petioles and stems resulting in sudden plant wilting",
    ],
    prevention: [
      "Plant certified disease-free seed potatoes and resistant tomato cultivars",
      "Eliminate cull piles, potato volunteers, and wild nightshade weeds near the garden",
      "Maximize row spacing and sun exposure to accelerate leaf drying",
      "Avoid overhead sprinkler irrigation especially in the late evening",
    ],
    treatments: [
      "Immediately isolate or remove severely infected vines to protect surrounding garden beds",
      "Apply preventative copper-based sprays before humid rainy spells",
      "Alert local extension services if widespread regional outbreaks occur",
    ],
  },
  {
    id: "rose-black-spot",
    name: "Rose Black Spot",
    scientificName: "Diplocarpon rosae",
    category: "Fungal",
    summary:
      "The most common foliar disease of roses worldwide, characterized by fringed black spots on leaf upper surfaces followed by severe defoliation.",
    causes: [
      "Fungal spores splashing from rain or overhead sprinklers onto young leaf tissue",
      "Leaves remaining damp for more than 7 consecutive hours at 18–24°C (65–75°F)",
      "Overcrowded rose bushes with restricted internal air circulation",
    ],
    symptoms: [
      "Circular black spots with feathery, fringed margins up to 12mm wide",
      "Leaf tissue surrounding the dark spots turning bright chlorotic yellow",
      "Extensive premature leaf drop weakening flower production and plant vigor",
      "Purplish-black blistered lesions appearing on immature green canes",
    ],
    prevention: [
      "Water roses early in the morning at the root base; never wet foliage late in the day",
      "Rake and discard all fallen autumn rose leaves to remove overwintering spores",
      "Prune shrub centers open in late winter to promote rapid wind drying",
      "Choose resistant rose varieties (e.g. Knock Out, Rugosa, or modern floribundas)",
    ],
    treatments: [
      "Manually pluck off spotted leaves upon first sight",
      "Apply neem oil or potassium bicarbonate spray at 7–10 day intervals during damp spring weather",
      "Keep mulch fresh and replace top layer annually under infected shrubs",
    ],
  },
  {
    id: "powdery-mildew",
    name: "Powdery Mildew",
    scientificName: "Erysiphales spp.",
    category: "Fungal",
    summary:
      "A widespread fungal affliction covering plant foliage, stems, and buds with a distinct white flour-like powdery coating.",
    causes: [
      "High ambient relative humidity paired with dry leaf surfaces (unlike most fungi, it does not require free water)",
      "Warm days (20–28°C / 68–82°F) followed by cool, humid nights",
      "Shady, stagnant growing spots lacking active sunlight and ventilation",
      "Excessive nitrogen fertilization stimulating overly tender vegetative shoots",
    ],
    symptoms: [
      "Talcum-powder-like white or ash-gray fungal patches across upper and lower leaf surfaces",
      "Curled, twisted, distorted young leaves and stunted buds",
      "Yellowing and premature browning of chronically covered foliage",
    ],
    prevention: [
      "Locate susceptible plants in full sun (at least 6 hours of direct sunlight)",
      "Thin out dense branches to encourage cross-breeze airflow",
      "Use balanced, slow-release fertilizers rather than high-nitrogen synthetic blends",
      "Rinse foliage gently with hose water in bright morning sun (disrupts dry spore germination)",
    ],
    treatments: [
      "Spray foliage with a mild solution of 1 part whole milk to 9 parts water in full sun",
      "Apply potassium bicarbonate (1 tbsp/gallon water with gentle liquid castile soap)",
      "Spray sulfur or horticultural oil according to seasonal label rates",
    ],
  },
  {
    id: "septoria-leaf-spot",
    name: "Septoria Leaf Spot",
    scientificName: "Septoria lycopersici",
    category: "Fungal",
    summary:
      "A destructive fungal disease targeting tomatoes, peppers, and related solanaceous plants, causing dense freckling of small circular necrotic spots.",
    causes: [
      "Soil-dwelling fungal spores splashing onto bottom leaves during heavy rainstorms",
      "Moderate warmth (20–25°C) and extended leaf wetness from morning dew or fog",
      "Overhead irrigation and high-density plant spacing",
    ],
    symptoms: [
      "Numerous small (1.5–3 mm) circular lesions with dark brown rims and pale gray centers",
      "Tiny black pinprick dots (fungal fruiting pycnidia) visible inside mature spot centers",
      "Lower leaves turning completely yellow, withering, and dropping off prematurely",
      "Fruit is generally unaffected, but sunscald increases due to foliage defoliation",
    ],
    prevention: [
      "Mulch heavily beneath plants to block spore splashing from soil particles",
      "Stake and cage plants vertically for maximum air movement",
      "Remove all lower suckers and foliage touching the ground surface",
      "Sanitize plant stakes, cages, and tools at the end of each growing season",
    ],
    treatments: [
      "Prune affected lower leaves immediately and dispose of in waste (do not mulch)",
      "Apply biofungicide (Bacillus amyloliquefaciens) or copper octanoate spray",
    ],
  },
  {
    id: "bacterial-leaf-spot",
    name: "Bacterial Leaf Spot",
    scientificName: "Xanthomonas campestris",
    category: "Bacterial",
    summary:
      "A bacterial disease causing small, water-soaked, vein-delimited angular lesions across pepper, tomato, and brassica foliage.",
    causes: [
      "Bacteria penetrating leaves through natural stomata or wound openings from pruning or hail",
      "Warm, wet, windy weather (24–30°C) with persistent moisture",
      "Contaminated seed batches or infected transplants",
    ],
    symptoms: [
      "Small, angular, dark water-soaked spots restricted by minor leaf veins",
      "Spots becoming greasy and dark brown with narrow yellow halos",
      "Rough, raised scabby lesions on green and ripening fruits",
    ],
    prevention: [
      "Plant certified pathogen-free seeds and disease-resistant hybrids",
      "Never work with or prune wet foliage",
      "Avoid overhead irrigation to minimize bacterial spread",
    ],
    treatments: [
      "Preventative copper-mancozeb or copper-soap applications before infection spreads",
      "Promptly discard severely infected plants to halt field transmission",
    ],
  },
];

export function findDiseaseByName(name: string): DiseaseKnowledgeItem | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().replace(/^(suspected|possible|likely)\s+/i, "").trim();
  return diseaseKnowledgeBase.find(
    (d) =>
      d.name.toLowerCase() === clean ||
      clean.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(clean)
  );
}
