/**
 * Smart Component per la scheda completa e il "Laboratorio Porzioni" (RecipeDetailComponent).
 * Recupera l'ID dalla rotta, gestisce il Signal per il moltiplicatore delle porzioni e coordina il ricalcolo ingredienti.
 */
import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';
import { PortionScalerPipe } from '../../pipes/portion-scaler.pipe';
import { getCountryFlag } from '../../utils/country-flags';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [RouterLink, PortionScalerPipe, DatePipe],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css'
})
export class RecipeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly recipeService = inject(RecipeService);

  /**
   * Signal per memorizzare l'ID estratto dalla rotta attiva.
   */
  readonly recipeId = signal<string | null>(null);

  /**
   * Signal per gestire il numero di porzioni desiderato per il ricalcolo nel laboratorio.
   * Inizializzato di default a 1.
   */
  readonly targetServings = signal<number>(1);

  /**
   * Signal calcolato (computed) che recupera reattivamente la ricetta corrispondente all'ID.
   * Se l'elenco delle ricette viene aggiornato via HTTP, questo Signal si aggiorna in automatico.
   */
  readonly recipe = computed<Recipe | undefined>(() => {
    const id = this.recipeId();
    if (!id) return undefined;
    return this.recipeService.getRecipeById(id);
  });

  constructor() {
    // Sincronizza il Signal targetServings con le porzioni base della ricetta appena essa è disponibile
    effect(() => {
      const currentRecipe = this.recipe();
      if (currentRecipe && currentRecipe.servings) {
        this.targetServings.set(currentRecipe.servings);
      }
    });
  }

  ngOnInit(): void {
    // Sottoscrizione ai parametri della rotta per supportare cambi di ID senza ricaricare il componente
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.recipeId.set(id);

      // Se l'utente atterra direttamente su questo URL, assicuriamo il caricamento dei dati
      if (this.recipeService.recipes().length === 0) {
        this.recipeService.loadRecipes();
      }
    });
  }

  /**
   * Incrementa il Signal delle porzioni desiderate per il laboratorio.
   */
  increaseServings(): void {
    this.targetServings.update(servings => servings + 1);
  }

  /**
   * Decrementa il Signal delle porzioni desiderate, con un limite minimo invalicabile di 1.
   */
  decreaseServings(): void {
    this.targetServings.update(servings => Math.max(1, servings - 1));
  }

  /**
   * Ritorna l'emoji della bandiera per la nazionalità indicata
   */
  getCountryFlag(nationality?: string): string {
    return getCountryFlag(nationality);
  }
}
