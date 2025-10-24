import {
  BiżuteriaIcon,
  UbraniaIcon,
  TorebkiPlecakiIcon,
  DodatkiIcon,
  BiżuteriaMęskaIcon,
  UbraniaMęskieIcon,
  DodatkiMęskieIcon,
  AkcesoriaMęskieIcon,
  UbrankaIcon,
  ZabawkiIcon,
  DekoracjePokojuIcon,
  AkcesoriaДziecięceIcon,
  GenericSubcategoryIcon,
} from '@/components/atoms/icons/subcategories/AllIcons'

/**
 * Category Icon Mapping
 * Custom SVG icons for SUBCATEGORIES ONLY
 * Main categories do NOT have icons
 * Icons are handcrafted for art & handcraft marketplace
 */

export type CategoryIconMap = {
  [key: string]: React.ComponentType<{ className?: string }>
}

// Main categories - NO ICONS
export const MAIN_CATEGORY_ICONS: CategoryIconMap = {}

// Subcategory icons for "Ona" (Her)
export const ONA_SUBCATEGORY_ICONS: CategoryIconMap = {
  "bizuteria": BiżuteriaIcon,
  "ubrania": UbraniaIcon,
  "torebki-i-plecaki": TorebkiPlecakiIcon,
  "dodatki": DodatkiIcon,
}

// Subcategory icons for "On" (Him)
export const ON_SUBCATEGORY_ICONS: CategoryIconMap = {
  "bizuteria-meska": BiżuteriaMęskaIcon,
  "ubrania-leskie": UbraniaMęskieIcon,
  "dodatki-meskie": DodatkiMęskieIcon,
  "akcesoria-meskie": AkcesoriaMęskieIcon,
}

// Subcategory icons for "Dziecko" (Children)
export const DZIECKO_SUBCATEGORY_ICONS: CategoryIconMap = {
  "ubranka": UbrankaIcon,
  "zabawki": ZabawkiIcon,
  "dekoracje-do-pokoju-dzieciecego": DekoracjePokojuIcon,
  "akcesoria-dzieciece": AkcesoriaДziecięceIcon,
}

// Subcategory icons for "Zwierzęta" (Animals)
export const ZWIERZETA_SUBCATEGORY_ICONS: CategoryIconMap = {
  "smycze": GenericSubcategoryIcon,
  "szelki": GenericSubcategoryIcon,
  "obroze": GenericSubcategoryIcon,
  "ubranka-dla-zwierzat": GenericSubcategoryIcon,
  "chustki-i-bandany": GenericSubcategoryIcon,
  "zabawki-dla-zwierzat": GenericSubcategoryIcon,
  "zawieszki-i-indentyfikatory": GenericSubcategoryIcon,
  "miski": GenericSubcategoryIcon,
  "legowiska": GenericSubcategoryIcon,
  "pozostale-zwierzeta": GenericSubcategoryIcon,
}

// Subcategory icons for "Dom" (Home)
export const DOM_SUBCATEGORY_ICONS: CategoryIconMap = {
  "dekoracje": GenericSubcategoryIcon,
  "tekstylia": GenericSubcategoryIcon,
  "meble": GenericSubcategoryIcon,
  "lampy": GenericSubcategoryIcon,
  "kuchnia-i-jadalnia": GenericSubcategoryIcon,
  "organizacja": GenericSubcategoryIcon,
  "ogrod-i-balkon": GenericSubcategoryIcon,
}

// Subcategory icons for "Akcesoria" (Accessories)
export const AKCESORIA_SUBCATEGORY_ICONS: CategoryIconMap = {
  "moda": GenericSubcategoryIcon,
  "technologia": GenericSubcategoryIcon,
  "papeteria-i-biuro": GenericSubcategoryIcon,
  "podroze": GenericSubcategoryIcon,
  "akcesoria-pozostałe": GenericSubcategoryIcon,
}

// Subcategory icons for "Prezenty i okazje" (Gifts and occasions)
export const PREZENTY_SUBCATEGORY_ICONS: CategoryIconMap = {
  "urodziny": GenericSubcategoryIcon,
  "kartki-okolicznosciowe": GenericSubcategoryIcon,
  "opakowania": GenericSubcategoryIcon,
  "slub-i-wesele": GenericSubcategoryIcon,
  "rocznice-i-walentynki": GenericSubcategoryIcon,
  "boze-narodzenie": GenericSubcategoryIcon,
  "Wielkanoc": GenericSubcategoryIcon,
  "halloween": GenericSubcategoryIcon,
  "dzien-matki-ojca-babci-dziadki": GenericSubcategoryIcon,
  "chrzest-i-komunia": GenericSubcategoryIcon,
  "wieczor-panienski": GenericSubcategoryIcon,
  "wieczor-kawalerski": GenericSubcategoryIcon,
  "baby-shower": GenericSubcategoryIcon,
  "zestawy-prezentowe": GenericSubcategoryIcon,
}

// Subcategory icons for "Vintage"
export const VINTAGE_SUBCATEGORY_ICONS: CategoryIconMap = {
  "moda-vintage": GenericSubcategoryIcon,
  "dom-vintage": GenericSubcategoryIcon,
  "bizuteria-vintage": GenericSubcategoryIcon,
  "zegarki-vintage": GenericSubcategoryIcon,
  "kolekcje-i-antyki": GenericSubcategoryIcon,
  "pozostale-vintage": GenericSubcategoryIcon,
}

/**
 * Combined icon map - all categories in one object
 */
export const ALL_CATEGORY_ICONS: CategoryIconMap = {
  ...MAIN_CATEGORY_ICONS,
  ...ONA_SUBCATEGORY_ICONS,
  ...ON_SUBCATEGORY_ICONS,
  ...DZIECKO_SUBCATEGORY_ICONS,
  ...ZWIERZETA_SUBCATEGORY_ICONS,
  ...DOM_SUBCATEGORY_ICONS,
  ...AKCESORIA_SUBCATEGORY_ICONS,
  ...PREZENTY_SUBCATEGORY_ICONS,
  ...VINTAGE_SUBCATEGORY_ICONS,
}

/**
 * Get icon component for a category by handle
 * @param handle - Category handle (e.g., "bizuteria", "ubrania")
 * @returns Icon component or null for main categories
 */
export const getCategoryIcon = (handle: string): React.ComponentType<{ className?: string }> | null => {
  return ALL_CATEGORY_ICONS[handle] || null
}

/**
 * Check if a category has a custom icon
 * @param handle - Category handle
 * @returns boolean
 */
export const hasCategoryIcon = (handle: string): boolean => {
  return handle in ALL_CATEGORY_ICONS
}

/**
 * Category icon configuration for navbar display
 */
export const NAVBAR_ICON_CONFIG = {
  size: 20, // Default icon size in pixels
  className: "mr-2", // Default margin-right class
  strokeWidth: 1.5, // Icon stroke width
}
