/**
 * Modelli e interfacce TypeScript di TastyLab.
 * Definisce la struttura dati per Recipe e Ingredient, e i tipi unione per categorie e origini (web/personale).
 */
export interface Ingredient {
  name: string;
  amount?: number | string | null;
  unit?: string;
}

export type RecipeCategory = 'Primo' | 'Secondo' | 'Dolce' | 'Contorno' | 'Piatto Unico';
export type RecipeSourceType = 'personal' | 'web';

export interface Recipe {
  id: string;
  title: string;
  category: RecipeCategory;
  nationality: string;
  servings: number;
  instructions: string;
  sourceType: RecipeSourceType;
  sourceUrl?: string;
  imageUrl?: string;
  customNotes?: string;
  ingredients: Ingredient[];
  createdAt: Date;
}
