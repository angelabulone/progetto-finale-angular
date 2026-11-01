/**
 * Custom Pipe (PortionScalerPipe).
 * Ricalcola proporzionalmente le quantità degli ingredienti in base alle porzioni desiderate, preservando diciture come "q.b.".
 */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe standalone per ricalcolare dinamicamente la quantità di un ingrediente
 * in base al numero di porzioni desiderate nel laboratorio di cucina TastyLab.
 *
 * Supporta valori numerici, stringhe numeriche (es. '100', '1.5', '1,5'),
 * valori opzionali e diciture non scalabili come 'q.b.' o 'qb'.
 *
 * Utilizzo nei template:
 * {{ ingredient.amount | portionScaler : recipe.servings : userSelectedServings }}
 */
@Pipe({
  name: 'portionScaler',
  standalone: true
})
export class PortionScalerPipe implements PipeTransform {

  /**
   * Trasforma e scala la quantità in modo proporzionale.
   *
   * @param amount Quantità dell'ingrediente (numero, stringa, null o undefined).
   * @param originalServings Porzioni di riferimento della ricetta originale.
   * @param targetServings Porzioni richieste dall'utente nel laboratorio.
   * @returns Quantità scalata arrotondata al massimo a 2 cifre decimali, oppure stringa originale ('q.b.').
   */
  transform(
    amount: number | string | null | undefined,
    originalServings: number,
    targetServings: number
  ): string | number {
    // 1. Se amount è nullo o vuoto, restituisce stringa vuota
    if (amount == null || amount === '') {
      return '';
    }

    // 2. Se amount è già un numero chiamamo la funzione scaleNumber e restituisce il risultato
    if (typeof amount === 'number') {
      if (isNaN(amount) || amount <= 0) {
        return '';
      }
      return this.scaleNumber(amount, originalServings, targetServings);
    }

    // 3. Se amount è una stringa, verifichiamo se rappresenta un numero
    const cleanStr = String(amount).trim();
    if (!cleanStr) {
      return '';
    }

    // Normalizza virgola con punto per numeri decimali italiani (es. "1,5" -> "1.5")
    const parsed = parseFloat(cleanStr.replace(',', '.'));

    // Se non è un numero valido o è 0/negativo, è una dicitura testuale come "q.b." o "a piacere"
    if (isNaN(parsed) || parsed <= 0) {
      return cleanStr;
    }

    return this.scaleNumber(parsed, originalServings, targetServings);
  }

  private scaleNumber(value: number, originalServings: number, targetServings: number): number {
    if (!originalServings || originalServings <= 0 || !targetServings || targetServings <= 0) {
      return value;
    }

    const scaledAmount = (value / originalServings) * targetServings;
    return Math.round((scaledAmount + Number.EPSILON) * 100) / 100;
  }
}
