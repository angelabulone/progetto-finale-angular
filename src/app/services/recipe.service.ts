/**
 * Servizio singleton centrale (RecipeService).
 * Gestisce le chiamate asincrone HttpClient, la persistenza su localStorage, lo stato reattivo con i Signals e le operazioni CRUD.
 */
import { Injectable, inject, signal, computed, WritableSignal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Recipe } from '../models/recipe.model'; 
import { map, finalize } from 'rxjs'; 

@Injectable({ 
  providedIn: 'root'
})
export class RecipeService {
  private readonly http = inject(HttpClient); // dependency injection che gestisce le chiamate HTTP 
  private readonly apiUrl = 'assets/data/recipes.json'; 
  private readonly STORAGE_KEY = 'tastylab_recipes_cache_v3';
  private readonly PREV_STORAGE_KEYS = ['tastylab_recipes_cache_v2', 'tastylab_recipes_cache'];

  // ==========================================
  // SEZIONE SIGNALS: Gestione dello Stato Reattivo
  // ==========================================

  readonly recipes: WritableSignal<Recipe[]> = signal<Recipe[]>([]);
  readonly searchQuery: WritableSignal<string> = signal<string>('');
  readonly selectedNationality: WritableSignal<string> = signal<string>('');
  readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);

  readonly filteredRecipes: Signal<Recipe[]> = computed(() => { 
    const list = this.recipes();
    const query = this.searchQuery().trim().toLowerCase();
    const nationality = this.selectedNationality().trim().toLowerCase();

    return list.filter(recipe => {
      const matchesQuery = !query || 
        recipe.title.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query));

      const matchesNationality = !nationality || nationality === 'tutte' || 
        recipe.nationality.toLowerCase() === nationality;

      return matchesQuery && matchesNationality;
    });
  });

  // ==========================================
  // SEZIONE HTTP & PERSISTENZA: Recupero Dati
  // ==========================================

  // Metodo per caricare le ricette da un file JSON
  loadRecipes(): void {
    const savedRecipes = localStorage.getItem(this.STORAGE_KEY);
    // Recupero ricette dalla cache
    if (savedRecipes) {
      try {
        const parsed: Recipe[] = JSON.parse(savedRecipes).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        //
        if (parsed.length > 0) {
          this.recipes.set(parsed);
          return;
        }
      } catch (e) { 
        console.error('Errore durante la lettura dal localStorage:', e);
      }
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get<Recipe[]>(this.apiUrl).pipe(
      map(data => data.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }))),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (data) => {
        // Recupero eventuali ricette personali create dall'utente in versioni precedenti della cache
        let customRecipes: Recipe[] = [];
        for (const oldKey of this.PREV_STORAGE_KEYS) {
          const oldSaved = localStorage.getItem(oldKey);
          if (oldSaved) {
            try {
              const oldList: Recipe[] = JSON.parse(oldSaved).map((item: any) => ({
                ...item,
                createdAt: new Date(item.createdAt)
              }));
              const personal = oldList.filter(
                r => !data.some(d => d.id === r.id) && !customRecipes.some(c => c.id === r.id)
              );
              customRecipes = [...customRecipes, ...personal];
            } catch (e) {
              console.warn('Migrazione cache fallita per:', oldKey, e);
            }
          }
        }

        const mergedList = [...customRecipes, ...data];
        this.recipes.set(mergedList);
        this.saveToStorage();
      },
      error: (err) => {
        console.error('Errore nel caricamento delle ricette:', err);
        this.errorMessage.set(
          err.message || 'Si è verificato un errore durante il recupero delle ricette.'
        );
      }
    });
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recipes()));
  }

  // ==========================================
  // SEZIONE CRUD: Gestione Dati
  // ==========================================

  //cerca ricetta per id con .find
  getRecipeById(id: string): Recipe | undefined {
    return this.recipes().find(recipe => recipe.id === id);
  }

  // inserisce nuova ricetta con spread operator ()
  addRecipe(newRecipe: Recipe): void {
    this.recipes.update(currentRecipes => [newRecipe, ...currentRecipes]);
    this.saveToStorage();
  }

  updateRecipe(updatedRecipe: Recipe): void {
    this.recipes.update(currentRecipes =>
      currentRecipes.map(recipe => recipe.id === updatedRecipe.id ? updatedRecipe : recipe)
    );
    this.saveToStorage();
  }

  deleteRecipe(id: string): void {
    this.recipes.update(currentRecipes =>
      currentRecipes.filter(recipe => recipe.id !== id)
    );
    this.saveToStorage();
  }
}
