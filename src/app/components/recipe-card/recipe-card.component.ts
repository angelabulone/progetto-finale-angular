/**
 * Dumb/Presentational Component per la singola scheda ricetta (RecipeCardComponent).
 * Riceve i dati della ricetta tramite @Input ed emette la richiesta di eliminazione al genitore tramite @Output.
 */
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recipe } from '../../models/recipe.model';
import { getCountryFlag } from '../../utils/country-flags';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css'
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Output() delete = new EventEmitter<string>();

  /**
   * Traccia eventuali errori di caricamento dell'immagine remota
   * per mostrare il placeholder elegante invece di un'immagine spezzata.
   */
  readonly imageError = signal<boolean>(false);

  /**
   * Gestisce l'errore di caricamento dell'immagine
   */
  onImageError(): void {
    this.imageError.set(true);
  }

  /**
   * Propaga l'evento di eliminazione al componente padre
   */
  onDelete(): void {
    this.delete.emit(this.recipe.id);
  }

  /**
   * Restituisce un'icona tematica per la categoria della ricetta,
   * con icona generale culinaria di fallback (🍽️) invece di cibi specifici.
   */
  getCategoryIcon(category?: string): string {
    switch (category) {
      case 'Primo':
        return '🍝';
      case 'Secondo':
        return '🥩';
      case 'Dolce':
        return '🍰';
      case 'Contorno':
        return '🥗';
      case 'Piatto Unico':
        return '🍲';
      default:
        return '🍽️';
    }
  }

  /**
   * Ritorna l'emoji della bandiera corrispondente alla nazionalità/cucina
   */
  getCountryFlag(nationality: string): string {
    return getCountryFlag(nationality);
  }
}
