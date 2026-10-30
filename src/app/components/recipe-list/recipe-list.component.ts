/**
 * Smart Component per il catalogo delle ricette (RecipeListComponent).
 * Gestisce i filtri di ricerca testuale, la selezione dinamica delle nazionalità e la gestione degli stati asincroni.
 */
import { Component, OnInit, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [FormsModule, RecipeCardComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css'
})
export class RecipeListComponent implements OnInit {
  /**
   * Iniezione del RecipeService centralizzato.
   * Reso public per consentire l'accesso diretto ai Signals nel template.
   */
  readonly recipeService = inject(RecipeService);

  /**
   * Elenco dinamico delle nazionalità disponibili per il filtro a tendina,
   * estratto automaticamente dalle ricette presenti nel ricettario,
   * inclusa l'Austria e le principali tradizioni culinarie mondiali.
   */
  readonly nationalities = computed<string[]>(() => {
    const recipes = this.recipeService.recipes();
    const nats = new Set<string>();

    // Nazionalità predefinite raccomandate
    [
      'Italiana',
      'Austriaca',
      'Messicana',
      'Giapponese',
      'Francese',
      'Spagnola',
      'Tedesca',
      'Svizzera',
      'Indiana',
      'Americana',
      'Greca',
      'Cinese'
    ].forEach(n => nats.add(n));

    // Aggiunta dinamica di qualsiasi nazionalità inserita dall'utente nelle ricette
    recipes.forEach(r => {
      if (r.nationality && r.nationality.trim()) {
        const trimmed = r.nationality.trim();
        const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        nats.add(normalized);
      }
    });

    const sortedList = Array.from(nats).sort((a, b) => a.localeCompare(b, 'it'));
    return ['Tutte', ...sortedList];
  });

  /**
   * All'inizializzazione del componente scarichiamo le ricette via HTTP.
   */
  ngOnInit(): void {
    // Se la lista non è ancora stata caricata, invochiamo la chiamata HTTP
    if (this.recipeService.recipes().length === 0) {
      this.recipeService.loadRecipes();
    }
  }

  /**
   * Aggiorna il Signal searchQuery quando l'utente digita nel campo di ricerca.
   */
  onSearchChange(query: string): void {
    this.recipeService.searchQuery.set(query);
  }

  /**
   * Aggiorna il Signal selectedNationality quando l'utente seleziona una nazionalità.
   */
  onNationalityChange(nationality: string): void {
    // Se seleziona 'Tutte', resettiamo a stringa vuota per non filtrare
    this.recipeService.selectedNationality.set(nationality === 'Tutte' ? '' : nationality);
  }

  /**
   * Cancella tutti i filtri attivi.
   */
  resetFilters(): void {
    this.recipeService.searchQuery.set('');
    this.recipeService.selectedNationality.set('');
  }

  /**
   * Gestisce l'evento di eliminazione proveniente dalla card figlia.
   *
   * @param id Identificatore univoco della ricetta da eliminare.
   */
  onDeleteRecipe(id: string): void {
    const recipe = this.recipeService.getRecipeById(id);
    const confirmDelete = window.confirm(
      `Sei sicuro di voler eliminare la ricetta "${recipe?.title || 'selezionata'}"?`
    );

    if (confirmDelete) {
      this.recipeService.deleteRecipe(id);
    }
  }
}
