/**
 * Palmer Penguins dataset — 10 sample rows.
 * Features: bill_length_mm, bill_depth_mm, flipper_length_mm, body_mass_g
 * Label: species (0=Adelie, 1=Chinstrap, 2=Gentoo)
 */
export const FEATURE_NAMES = [
  'bill_length',
  'bill_depth',
  'flipper_len',
  'body_mass_g',
]

export const LABEL_NAME = 'species'

export const SPECIES_MAP = { 0: 'Adelie', 1: 'Chinstrap', 2: 'Gentoo' }

export const DEFAULT_ROWS = [
  { bill_length: 39.1, bill_depth: 18.7, flipper_len: 181, body_mass_g: 3750, species: 0 },
  { bill_length: 36.7, bill_depth: 19.3, flipper_len: 193, body_mass_g: 3450, species: 0 },
  { bill_length: 46.5, bill_depth: 17.9, flipper_len: 192, body_mass_g: 3500, species: 1 },
  { bill_length: 49.3, bill_depth: 19.9, flipper_len: 203, body_mass_g: 4050, species: 1 },
  { bill_length: 46.1, bill_depth: 13.2, flipper_len: 211, body_mass_g: 4500, species: 2 },
  { bill_length: 50.0, bill_depth: 15.2, flipper_len: 218, body_mass_g: 5700, species: 2 },
]
