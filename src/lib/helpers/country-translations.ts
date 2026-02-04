/**
 * Polish translations for country names
 * Maps ISO 2-letter country codes to Polish country names
 */
export const countryTranslationsPL: Record<string, string> = {
  // European Union countries
  'at': 'Austria',
  'be': 'Belgia',
  'bg': 'Bułgaria',
  'hr': 'Chorwacja',
  'cy': 'Cypr',
  'cz': 'Czechy',
  'dk': 'Dania',
  'ee': 'Estonia',
  'fi': 'Finlandia',
  'fr': 'Francja',
  'de': 'Niemcy',
  'gr': 'Grecja',
  'hu': 'Węgry',
  'ie': 'Irlandia',
  'it': 'Włochy',
  'lv': 'Łotwa',
  'lt': 'Litwa',
  'lu': 'Luksemburg',
  'mt': 'Malta',
  'nl': 'Holandia',
  'pl': 'Polska',
  'pt': 'Portugalia',
  'ro': 'Rumunia',
  'sk': 'Słowacja',
  'si': 'Słowenia',
  'es': 'Hiszpania',
  'se': 'Szwecja',
  
  // Other European countries
  'al': 'Albania',
  'ad': 'Andora',
  'by': 'Białoruś',
  'ba': 'Bośnia i Hercegowina',
  'ch': 'Szwajcaria',
  'gb': 'Wielka Brytania',
  'is': 'Islandia',
  'li': 'Liechtenstein',
  'mk': 'Macedonia Północna',
  'md': 'Mołdawia',
  'mc': 'Monako',
  'me': 'Czarnogóra',
  'no': 'Norwegia',
  'rs': 'Serbia',
  'ru': 'Rosja',
  'sm': 'San Marino',
  'ua': 'Ukraina',
  'va': 'Watykan',
  
  // Americas
  'us': 'Stany Zjednoczone',
  'ca': 'Kanada',
  'mx': 'Meksyk',
  'br': 'Brazylia',
  'ar': 'Argentyna',
  'cl': 'Chile',
  'co': 'Kolumbia',
  'pe': 'Peru',
  've': 'Wenezuela',
  
  // Asia
  'cn': 'Chiny',
  'jp': 'Japonia',
  'kr': 'Korea Południowa',
  'in': 'Indie',
  'id': 'Indonezja',
  'th': 'Tajlandia',
  'vn': 'Wietnam',
  'sg': 'Singapur',
  'my': 'Malezja',
  'ph': 'Filipiny',
  'tr': 'Turcja',
  'il': 'Izrael',
  'ae': 'Zjednoczone Emiraty Arabskie',
  'sa': 'Arabia Saudyjska',
  
  // Africa
  'za': 'Republika Południowej Afryki',
  'eg': 'Egipt',
  'ma': 'Maroko',
  'ng': 'Nigeria',
  'ke': 'Kenia',
  
  // Oceania
  'au': 'Australia',
  'nz': 'Nowa Zelandia',
}

/**
 * Get Polish translation for a country name
 * Falls back to original name if translation not found
 */
export const getCountryNamePL = (countryCode: string, fallbackName: string): string => {
  const code = countryCode.toLowerCase()
  return countryTranslationsPL[code] || fallbackName
}
