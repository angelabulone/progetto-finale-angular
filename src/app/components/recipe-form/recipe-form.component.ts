/**
 * Smart Component per la creazione e modifica delle ricette (RecipeFormComponent).
 * Gestisce Reactive Forms con validazione condizionale e un FormArray dinamico con riordino su/giù e Drag & Drop.
 */
import { Component, OnInit, inject, signal, effect, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe, Ingredient, RecipeCategory, RecipeSourceType } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.css'
})
export class RecipeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly recipeService = inject(RecipeService);

  /**
   * FormGroup principale che gestisce lo stato e la validazione del form.
   */
  recipeForm!: FormGroup;

  /**
   * Signal per indicare se siamo in modalità modifica (true) o creazione (false).
   */
  readonly isEditMode = signal<boolean>(false);

  /**
   * ID della ricetta in fase di modifica (se presente).
   */
  readonly recipeId = signal<string | null>(null);

  /**
   * Segnala se la ricetta richiesta in modalità modifica non è stata trovata.
   */
  readonly recipeNotFound = signal<boolean>(false);

  /**
   * Indici per il Drag & Drop visivo degli ingredienti.
   */
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;

  /**
   * Generatore di ID incrementale univoco per il tracking stabile degli ingredienti nel DOM.
   */
  private nextIngId = 1;

  /**
   * Memorizza la data di creazione originale in modalità modifica.
   */
  private originalCreatedAt: Date = new Date();
  private populatedForId: string | null = null;

  readonly categories: RecipeCategory[] = [
    'Primo',
    'Secondo',
    'Dolce',
    'Contorno',
    'Piatto Unico'
  ];

  constructor() {
    // Sincronizza il popolamento del form in modalità modifica appena i dati sono disponibili
    effect(() => {
      const id = this.recipeId();
      const inEdit = this.isEditMode();
      const recipes = this.recipeService.recipes();
      const loading = this.recipeService.isLoading();

      if (id && inEdit) {
        const existing = this.recipeService.getRecipeById(id);
        if (existing && this.populatedForId !== id) {
          this.populateForm(existing);
          this.populatedForId = id;
          this.recipeNotFound.set(false);
        } else if (!existing && !loading && recipes.length > 0) {
          this.recipeNotFound.set(true);
        }
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupConditionalValidation();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.populatedForId = null;
      this.recipeNotFound.set(false);

      if (id) {
        this.isEditMode.set(true);
        this.recipeId.set(id);

        if (this.recipeService.recipes().length === 0) {
          this.recipeService.loadRecipes();
        } else {
          const existing = this.recipeService.getRecipeById(id);
          if (existing) {
            this.populateForm(existing);
            this.populatedForId = id;
          } else {
            this.recipeNotFound.set(true);
          }
        }
      } else {
        this.isEditMode.set(false);
        this.recipeId.set(null);
        this.recipeForm.reset({
          category: 'Primo',
          servings: 4,
          sourceType: 'personal' as RecipeSourceType
        });
        this.ingredientsArray.clear();
        this.addIngredient();
      }
    });
  }

  /**
   * Inizializzazione della struttura reattiva del form con FormBuilder.
   */
  private initForm(): void {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['Primo', [Validators.required]],
      nationality: ['', [Validators.required]],
      servings: [4, [Validators.required, Validators.min(1)]],
      instructions: ['', [Validators.required, Validators.minLength(10)]],
      sourceType: ['personal' as RecipeSourceType, [Validators.required]],
      sourceUrl: [''],
      imageUrl: [''],
      customNotes: [''],
      ingredients: this.fb.array([])
    });
  }

  /**
   * Getter per accedere al FormArray degli ingredienti.
   */
  get ingredientsArray(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  /**
   * Restituisce la lista di controlli tipizzati FormGroup per il rendering nel template.
   */
  get ingredientControls(): FormGroup[] {
    return this.ingredientsArray.controls as FormGroup[];
  }

  /**
   * Utility di casting per il template.
   */
  asFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  /**
   * Configura la validazione condizionale: se sourceType === 'web', sourceUrl diventa obbligatorio.
   */
  private setupConditionalValidation(): void {
    const sourceTypeControl = this.recipeForm.get('sourceType');
    const sourceUrlControl = this.recipeForm.get('sourceUrl');

    sourceTypeControl?.valueChanges.subscribe((type: RecipeSourceType) => {
      if (type === 'web') {
        sourceUrlControl?.setValidators([Validators.required]);
      } else {
        sourceUrlControl?.clearValidators();
      }
      sourceUrlControl?.updateValueAndValidity();
    });
  }

  /**
   * Crea un singolo FormGroup per una riga di ingrediente con ID univoco persistente per il trackBy.
   */
  private createIngredientGroup(ingredient?: any): FormGroup {
    return this.fb.group({
      _uid: [ingredient?._uid || this.nextIngId++],
      name: [ingredient?.name ?? '', [Validators.required]],
      amount: [ingredient?.amount != null ? String(ingredient.amount) : ''],
      unit: [ingredient?.unit ?? '']
    });
  }

  /**
   * Aggiunge un nuovo ingrediente al FormArray.
   */
  addIngredient(ingredient?: Ingredient): void {
    this.ingredientsArray.push(this.createIngredientGroup(ingredient));
    this.cdr.markForCheck();
  }

  /**
   * Rimuove un ingrediente dal FormArray in base all'indice.
   */
  removeIngredient(index: number): void {
    if (this.ingredientsArray.length > 1) {
      this.ingredientsArray.removeAt(index);
    } else {
      // Se c'è solo un elemento, lo resettiamo mantenendo l'UID
      const uid = this.ingredientsArray.at(0).get('_uid')?.value;
      this.ingredientsArray.at(0).reset({ _uid: uid });
    }
    this.cdr.markForCheck();
  }

  /**
   * Sposta un ingrediente da un indice di partenza a uno di destinazione.
   * Rimuove e reinserisce il FormGroup nel FormArray e notifica Angular.
   */
  moveIngredient(fromIndex: number, toIndex: number): void {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.ingredientsArray.length ||
      toIndex >= this.ingredientsArray.length
    ) {
      return;
    }

    const control = this.ingredientsArray.at(fromIndex);
    this.ingredientsArray.removeAt(fromIndex);
    this.ingredientsArray.insert(toIndex, control);

    this.ingredientsArray.updateValueAndValidity();
    this.recipeForm.markAsDirty();
    this.cdr.detectChanges();
  }

  /**
   * Sposta un ingrediente verso l'alto (indice - 1).
   */
  moveIngredientUp(index: number): void {
    if (index > 0) {
      this.moveIngredient(index, index - 1);
    }
  }

  /**
   * Sposta un ingrediente verso il basso (indice + 1).
   */
  moveIngredientDown(index: number): void {
    if (index < this.ingredientsArray.length - 1) {
      this.moveIngredient(index, index + 1);
    }
  }

  /**
   * Gestione Drag & Drop nativo HTML5.
   */
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onDragLeave(event: DragEvent, index?: number): void {
    const target = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if (!target || !related || !target.contains(related)) {
      if (index === undefined || this.dragOverIndex === index) {
        this.dragOverIndex = null;
      }
    }
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      this.moveIngredient(this.draggedIndex, targetIndex);
    }
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  onDragEnd(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  /**
   * Popola il form con i dati della ricetta esistente in modalità modifica.
   */
  private populateForm(recipe: Recipe): void {
    this.originalCreatedAt = recipe.createdAt ? new Date(recipe.createdAt) : new Date();

    this.recipeForm.patchValue({
      title: recipe.title,
      category: recipe.category,
      nationality: recipe.nationality,
      servings: recipe.servings,
      instructions: recipe.instructions,
      sourceType: recipe.sourceType,
      sourceUrl: recipe.sourceUrl ?? '',
      imageUrl: recipe.imageUrl ?? '',
      customNotes: recipe.customNotes ?? ''
    });

    // Ricostruzione del FormArray ingredienti
    this.ingredientsArray.clear();
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ing => this.addIngredient(ing));
    } else {
      this.addIngredient();
    }
    this.cdr.markForCheck();
  }

  /**
   * Verifica se un controllo è invalido ed è già stato toccato dall'utente.
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.recipeForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Verifica se un campo all'interno del FormArray degli ingredienti è invalido.
   * Accetta sia l'indice numerico che il riferimento diretto al FormGroup.
   */
  isIngredientFieldInvalid(groupOrIndex: FormGroup | number, fieldName: string): boolean {
    const group = typeof groupOrIndex === 'number' 
      ? (this.ingredientsArray.at(groupOrIndex) as FormGroup)
      : groupOrIndex;
    if (!group) return false;
    const control = group.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Gestione dell'invio del form.
   */
  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    const formVal = this.recipeForm.value;

    // Normalizzazione ingredienti: estrae solo name, amount e unit (rimuovendo _uid tecnico)
    const parsedIngredients: Ingredient[] = formVal.ingredients
      .filter((ing: any) => ing.name && String(ing.name).trim().length > 0)
      .map((ing: any) => {
        const rawAmount = ing.amount != null ? String(ing.amount).trim() : '';
        let finalAmount: number | string | undefined = undefined;

        if (rawAmount) {
          const num = parseFloat(rawAmount.replace(',', '.'));
          if (!isNaN(num) && num > 0 && String(num) === rawAmount.replace(',', '.')) {
            finalAmount = num;
          } else {
            // Testo personalizzato come 'q.b.' o dosi combinate
            finalAmount = rawAmount;
          }
        }

        const rawUnit = ing.unit ? String(ing.unit).trim() : undefined;

        return {
          name: String(ing.name).trim(),
          amount: finalAmount,
          unit: rawUnit || undefined
        };
      });

    if (this.isEditMode() && this.recipeId()) {
      // Aggiornamento ricetta esistente
      const updatedRecipe: Recipe = {
        id: this.recipeId()!,
        title: formVal.title.trim(),
        category: formVal.category,
        nationality: formVal.nationality.trim(),
        servings: Number(formVal.servings),
        instructions: formVal.instructions.trim(),
        sourceType: formVal.sourceType,
        sourceUrl: formVal.sourceUrl ? formVal.sourceUrl.trim() : undefined,
        imageUrl: formVal.imageUrl ? formVal.imageUrl.trim() : undefined,
        customNotes: formVal.customNotes ? formVal.customNotes.trim() : undefined,
        ingredients: parsedIngredients,
        createdAt: this.originalCreatedAt
      };

      this.recipeService.updateRecipe(updatedRecipe);
      this.router.navigate(['/recipe', this.recipeId()]);
    } else {
      // Creazione nuova ricetta con ID univoco
      const newId = 'rec-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const newRecipe: Recipe = {
        id: newId,
        title: formVal.title.trim(),
        category: formVal.category,
        nationality: formVal.nationality.trim(),
        servings: Number(formVal.servings),
        instructions: formVal.instructions.trim(),
        sourceType: formVal.sourceType,
        sourceUrl: formVal.sourceUrl ? formVal.sourceUrl.trim() : undefined,
        imageUrl: formVal.imageUrl ? formVal.imageUrl.trim() : undefined,
        customNotes: formVal.customNotes ? formVal.customNotes.trim() : undefined,
        ingredients: parsedIngredients,
        createdAt: new Date()
      };

      this.recipeService.addRecipe(newRecipe);
      this.router.navigate(['/recipe', newId]);
    }
  }
}
