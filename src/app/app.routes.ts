/**
 * Tabella di navigazione (Routing) di TastyLab.
 * Mappa gli URL alle rispettive viste (catalogo, dettaglio, aggiunta e modifica ricetta) e definisce i redirect 404.
 */
import { Routes } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';

/**
 * Configurazione principale del Routing per l'applicazione TastyLab.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'recipes',
    pathMatch: 'full'
  },
  {
    path: 'recipes',
    component: RecipeListComponent,
    title: 'TastyLab - Ricettario & Laboratorio'
  },
  {
    path: 'recipe/:id',
    component: RecipeDetailComponent,
    title: 'TastyLab - Dettaglio Ricetta'
  },
  {
    path: 'add',
    component: RecipeFormComponent,
    title: 'TastyLab - Aggiungi Ricetta'
  },
  {
    path: 'edit/:id',
    component: RecipeFormComponent,
    title: 'TastyLab - Modifica Ricetta'
  },
  {
    path: '**',
    redirectTo: 'recipes'
  }
];
