/** Vetores locais originais: traço único, currentColor e sem dependências de rede. */
const paths = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  front:
    '<path d="M3 6h14l-3-3M17 6l-3 3M3 17h5M10 14l3 3-3 3M20 12v9M17 14l6 5M17 19l6-5"/>',
  heat: '<path d="M13 3c1 5 6 6 6 11a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 1 4 2 4 2-2 2-5 2-8Z"/><path d="M10 16c0 3 4 3 4 0"/>',
  cold: '<path d="M12 2v20M3 7l18 10M3 17 21 7M9 4l3 3 3-3M9 20l3-3 3 3M3 10l4-1-1-4M18 19l-1-4 4-1"/>',
  storm:
    '<path d="M5 15a4 4 0 0 1 0-8 6 6 0 0 1 11-1 4 4 0 0 1 3 8M12 11l-3 6h5l-3 5"/>',
  rain: '<path d="M5 13a4 4 0 0 1 0-8 6 6 0 0 1 11 0 4 4 0 0 1 3 8M7 16l-2 4M13 16l-2 4M19 16l-2 4"/>',
  wind: '<path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6a3 3 0 1 1-3 3"/>',
  fog: '<path d="M5 10a4 4 0 0 1 0-7 6 6 0 0 1 10 2 4 4 0 0 1 4 5M3 14h14M7 18h14M3 22h13"/>',
  blood:
    '<path d="M19 16A8 8 0 0 1 8 5a8 8 0 1 0 11 11Z"/><path d="M17 3v5M14.5 5.5h5"/>',
  drop: '<path d="M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  pressure:
    '<circle cx="12" cy="12" r="9"/><path d="m12 12 4-5M7 17h10M5 12h1M12 4v1M19 12h-1"/>',
  leaf: '<path d="M20 3C8 2 2 8 6 16s16 4 14-13ZM5 21 16 9"/>',
  pin: '<path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
};
/** Ícone decorativo: o texto adjacente fornece o nome acessível da informação. */
export function uiIcon(key) {
  const shape = paths[key === "snow" ? "cold" : key] || paths.pressure;
  return `<svg class="ui-icon ui-icon-${key}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`;
}
