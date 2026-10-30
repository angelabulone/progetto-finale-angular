/**
 * Utility di formattazione geografica (getCountryFlag).
 * Associa a ogni nazionalità o tradizione culinaria la rispettiva emoji bandiera (es. Austria -> 🇦🇹, Italia -> 🇮🇹).
 */
export function getCountryFlag(nationality?: string | null): string {
  if (!nationality) return '🌍';

  const nat = nationality.toLowerCase().trim();

  // Austria (es. Austriaca, Austria, Austrian, Österreich)
  if (nat.includes('austr') && !nat.includes('austral')) {
    return '🇦🇹';
  }
  // Australia
  if (nat.includes('austral')) {
    return '🇦🇺';
  }
  // Italia
  if (nat.includes('ital')) {
    return '🇮🇹';
  }
  // Messico
  if (nat.includes('messic') || nat.includes('mexic')) {
    return '🇲🇽';
  }
  // Giappone
  if (nat.includes('giappon') || nat.includes('japan')) {
    return '🇯🇵';
  }
  // USA / America
  if (nat.includes('americ') || nat === 'usa' || nat.includes('statunitense')) {
    return '🇺🇸';
  }
  // Francia
  if (nat.includes('franc') || nat.includes('french')) {
    return '🇫🇷';
  }
  // Spagna
  if (nat.includes('spagn') || nat.includes('spani') || nat.includes('spain')) {
    return '🇪🇸';
  }
  // Germania
  if (nat.includes('tedesc') || nat.includes('german') || nat.includes('deutsch')) {
    return '🇩🇪';
  }
  // Svizzera
  if (nat.includes('svizzer') || nat.includes('swiss') || nat.includes('schweiz')) {
    return '🇨🇭';
  }
  // Regno Unito / Inghilterra
  if (nat.includes('ingles') || nat.includes('inghilter') || nat.includes('british') || nat === 'uk') {
    return '🇬🇧';
  }
  // Grecia
  if (nat.includes('grec')) {
    return '🇬🇷';
  }
  // Cina
  if (nat.includes('cin') || nat.includes('chin')) {
    return '🇨🇳';
  }
  // India
  if (nat.includes('indi')) {
    return '🇮🇳';
  }
  // Turchia
  if (nat.includes('turc') || nat.includes('turk')) {
    return '🇹🇷';
  }
  // Marocco
  if (nat.includes('marocc') || nat.includes('morocc')) {
    return '🇲🇦';
  }
  // Brasile
  if (nat.includes('brasil') || nat.includes('brazil')) {
    return '🇧🇷';
  }
  // Argentina
  if (nat.includes('argentin')) {
    return '🇦🇷';
  }
  // Thailandia
  if (nat.includes('thail') || nat === 'thai') {
    return '🇹🇭';
  }
  // Vietnam
  if (nat.includes('vietnam')) {
    return '🇻🇳';
  }
  // Corea
  if (nat.includes('corea') || nat.includes('korea')) {
    return '🇰🇷';
  }
  // Portogallo
  if (nat.includes('portog') || nat.includes('portug')) {
    return '🇵🇹';
  }
  // Olanda / Paesi Bassi
  if (nat.includes('oland') || nat.includes('dutch') || nat.includes('netherland')) {
    return '🇳🇱';
  }
  // Belgio
  if (nat.includes('belg')) {
    return '🇧🇪';
  }
  // Svezia
  if (nat.includes('sved') || nat.includes('swed')) {
    return '🇸🇪';
  }
  // Norvegia
  if (nat.includes('norveg') || nat.includes('norway')) {
    return '🇳🇴';
  }
  // Irlanda
  if (nat.includes('irland') || nat.includes('irish')) {
    return '🇮🇪';
  }
  // Polonia
  if (nat.includes('polacc') || nat.includes('polon') || nat.includes('polish')) {
    return '🇵🇱';
  }
  // Ungheria
  if (nat.includes('ungher') || nat.includes('hungar')) {
    return '🇭🇺';
  }
  // Egitto
  if (nat.includes('egiz') || nat.includes('egypt')) {
    return '🇪🇬';
  }
  // Libano
  if (nat.includes('liban')) {
    return '🇱🇧';
  }

  return '🌍';
}
