import type { Hue } from '../math/coloring'

export const HUE_NAMES: Readonly<Record<Hue, string>> = {
  1: 'Blue',
  2: 'Red',
  3: 'Yellow',
}

export const HUE_COLORS: Readonly<Record<Hue, string>> = {
  1: '#3975df',
  2: '#e65353',
  3: '#f4c63d',
}

// These lighter bases are chosen so SVG multiply blending yields the intended
// purple, green, orange, and brown intersections without depending on order.
export const HUE_REGION_COLORS: Readonly<Record<Hue, string>> = {
  1: '#76a9fa',
  2: '#f98c8c',
  3: '#f8dc64',
}

export const MIXED_COLORS: Readonly<Record<number, string>> = {
  0: '#fffdf8',
  1: '#3975df',
  2: '#e65353',
  3: '#7b4ca8',
  4: '#f4c63d',
  5: '#55a65b',
  6: '#e98d38',
  7: '#765236',
}
