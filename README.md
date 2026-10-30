# 👨‍🍳 TastyLab — Ricettario & Laboratorio di Cucina

**TastyLab** è un'applicazione web interattiva sviluppata con **Angular** (versione standalone, con Signals e nuovo Control Flow) pensata per gli appassionati di cucina. L'applicazione combina la consultazione di ricette internazionali e personali con un vero e proprio **"Laboratorio di Cucina"**: uno strumento dinamico per ricalcolare istantaneamente le dosi degli ingredienti in base al numero di porzioni desiderate, personalizzare le annotazioni culinarie e gestire il proprio catalogo di ricette.

---

## 📋 Indice dei Contenuti
- [Cosa è stato costruito](#-cosa-è-stato-costruito)
- [Funzionalità Principali](#-funzionalità-principali)
- [Architettura Tecnica e Requisiti Didattici](#-architettura-tecnica-e-requisiti-didattici)
- [Come Installarlo e Avviarlo](#-come-installarlo-e-avviarlo)
- [API e Configurazione Dati](#-api-e-configurazione-dati)
- [Difficoltà Incontrate e Soluzioni Adottate](#-difficoltà-incontrate-e-soluzioni-adottate)
- [Sviluppi Futuri](#-sviluppi-futuri)
- [Struttura delle Cartelle](#-struttura-delle-cartelle)

---

## 🍳 Cosa è stato costruito

L'applicazione permette all'utente di:
1. **Esplorare e Filtrare Ricette**: navigare tra piatti della tradizione culinaria mondiale (italiana, austriaca, messicana, giapponese, ecc.) con ricerca testuale in tempo reale (per titolo o ingrediente) e filtro per nazionalità.
2. **Utilizzare il Laboratorio Porzioni**: visualizzare la scheda di dettaglio e ricalcolare al volo dosi e quantità degli ingredienti aumentando o diminuendo le porzioni con un moltiplicatore reattivo.
3. **Distinguere tra Ricette Web e Personali**: badge dedicati identificano a colpo d'occhio l'origine (`🌐 Ricetta Web` o `👨‍🍳 Ricetta Personale`).
4. **Creare e Modificare Ricette con Form Reattivo**: inserire nuove preparazioni o aggiornare quelle esistenti con validazione avanzata, gestione condizionale dei campi e un `FormArray` dinamico con riordino su/giù e drag-and-drop degli ingredienti.
5. **Persistenza Locale**: tutte le modifiche, le cancellazioni e le nuove ricette inserite rimangono salvate nel `localStorage` del browser.

---

## ✨ Funzionalità Principali

- **Catalogo Ricette & Preview Bilanciate**: ogni card presenta immagine del piatto, categoria, tradizione con bandiera dinamica, porzioni base e un riquadro di anteprima con istruzioni o note.
- **Laboratorio Dosi Interattivo**: stepper numerico (`+` / `-`) con ricalcolo proporzionale istantaneo gestito da una **Pipe personalizzata**. Diciture come *"q.b."*, *"a piacere"* o quantitativi opzionali vengono preservati senza generare errori matematici (`NaN`).
- **Form con Validazione Condizionale**: se la ricetta è importata dal web, il link alla fonte originale diventa obbligatorio; se è una creazione personale, il campo viene disattivato e svuotato in automatico.
- **Ingredienti Mobili (Drag & Drop + Frecce)**: gli ingredienti nella schermata di aggiunta/modifica possono essere facilmente riordinati sia con i pulsanti freccia `▲` / `▼` sia trascinandoli con la maniglia `⋮⋮`.
- **Gestione degli Stati Asincroni**: interfaccia reattiva completa di indicatore di caricamento (spinner), banner di errore con pulsante di riprova (*retry*) e visualizzazione dello stato vuoto (*empty state*) con pulsante di reset.

---

## 🛠️ Architettura 


### 1. Componenti & Comunicazione Input/Output
- **`AppComponent`**: shell principale con intestazione, navigazione reattiva e piè di pagina.
- **`RecipeListComponent`** *(Smart Component)*: gestisce lo stato di visualizzazione, i filtri di ricerca e la propagazione dell'eliminazione.
- **`RecipeCardComponent`** *(Dumb/Presentational Component)*: riceve i dati tramite `@Input({ required: true }) recipe!: Recipe` ed emette eventi di cancellazione verso il genitore tramite `@Output() delete = new EventEmitter<string>()`.
- **`RecipeDetailComponent`** *(Smart Component)*: recupera l'ID dalla rotta, visualizza la ricetta e gestisce lo stato locale del laboratorio porzioni.
- **`RecipeFormComponent`** *(Smart Component)*: form reattivo riutilizzabile sia per l'aggiunta che per la modifica (`/add` e `/edit/:id`).

### 2. Data Binding & Event Binding
- **Property Binding**: `[recipe]="recipe"`, `[formGroup]="asFormGroup(ingGroup)"`, `[disabled]="recipeForm.invalid"`, `[class.active]="..."`.
- **Event Binding**: `(click)="resetFilters()"`, `(ngSubmit)="onSubmit()"`, `(delete)="onDeleteRecipe($event)"`, `(dragstart)="..."`, `(drop)="..."`.
- **Reactive Forms Binding**: collegamento bidirezionale tramite direttive reattive (`formControlName`, `formArrayName`).

### 3. Nuovo Control Flow Angular (`@if`, `@for`, `@empty`)
- Sostituzione integrale delle direttive strutturali legacy (`*ngIf`, `*ngFor`).
- Sintassi nativa `@if`, `@else if`, `@else`.
- Cicli performanti con `@for (item of list; track item.id)` e tracciamento univoco.
- Blocco nativo `@empty` in `recipe-list` per gestire lo stato a zero risultati di ricerca in modo elegante.

### 4. Signals & Valori Derivati (`computed`, `effect`)
- **Writable Signals**: `recipes`, `searchQuery`, `selectedNationality`, `isLoading`, `errorMessage` in `RecipeService`; `targetServings` in `RecipeDetailComponent`.
- **Computed Signals**: 
  - `filteredRecipes`: filtra in tempo reale la lista per testo e per cucina senza alterare l'array originario.
  - `nationalities`: estrae e ordina dinamicamente le cucine presenti nel ricettario per popolare la tendina dei filtri.
  - `recipe`: risolve la ricetta attiva in base all'ID di rotta.
- **`effect()`**: sincronizza il Signal delle porzioni del laboratorio non appena la ricetta viene caricata.

### 5. Pipes
- **Custom Pipe**: [`PortionScalerPipe`](src/app/pipes/portion-scaler.pipe.ts) (`portionScaler`) — riceve la quantità base, le porzioni originali e le porzioni target, calcola il moltiplicatore, arrotonda al massimo a 2 decimali e gestisce casi speciali ("q.b.", stringhe, numeri con virgola).
- **Built-in Pipe**: `DatePipe` (`date:'dd/MM/yyyy'`) per la formattazione pulita della data di inserimento.

### 6. Routing
Configurato in [`app.routes.ts`](src/app/app.routes.ts):
- `/recipes` ➔ Elenco ricette con filtri (Home).
- `/recipe/:id` ➔ Pagina di dettaglio e laboratorio porzioni.
- `/add` ➔ Form per una nuova creazione.
- `/edit/:id` ➔ Form per la modifica di una ricetta esistente.
- Redirect automatici per rotta vuota (`'' ➔ 'recipes'`) e wildcard 404 (`'**' ➔ 'recipes'`).
- Titoli di pagina dinamici tramite la proprietà `title`.

### 7. Reactive Forms & Validazione
Costruito con `FormBuilder`:
- Validatori standard: `Validators.required`, `Validators.minLength`, `Validators.min`.
- **Validazione condizionale**: sottoscrizione a `sourceType.valueChanges` per attivare o rimuovere reattivamente il vincolo `Validators.required` sul campo `sourceUrl`.
- **`FormArray` dinamico**: per gestire una lista variabile di ingredienti con tracciamento `_uid` e reordering.
- Feedback visivo con evidenziazione in rosso ed espliciti messaggi di errore contestuali in italiano solo su campi toccati (`touched`) o modificati (`dirty`).

### 8. Servizi & Dependency Injection
- [`RecipeService`](src/app/services/recipe.service.ts) registrato con `providedIn: 'root'`.
- Utilizzo della moderna iniezione funzionale `inject(RecipeService)` e `inject(HttpClient)`.
- Centralizzazione completa delle logiche CRUD (Create, Read, Update, Delete) e della sincronizzazione con la cache.

### 9. Chiamate Asincrone & Gestione Stati
- Chiamata HTTP asincrona gestita tramite `HttpClient` e operatori RxJS (`map`, `finalize`).
- Copertura di tutti i 4 stati dell'interfaccia asincrona:
  1. **Caricamento**: spinner circolare con feedback visivo.
  2. **Errore**: banner esplicito con messaggio e pulsante di riprova (*retry*).
  3. **Successo**: rendering della griglia con metadati e conteggi.
  4. **Assenza dati**: stato vuoto reattivo con suggerimento di ripristino filtri.

---

## 🚀 Come Installarlo e Avviarlo

### Prerequisiti
- **Node.js**: versione 18.x o successiva (raccomandata v20+).
- **npm**: versione 9.x o successiva.

### 1. Installazione delle dipendenze
Clonare il repository o estrarre l'archivio ZIP, quindi posizionarsi nella cartella del progetto ed eseguire:
```bash
npm install
```

### 2. Avvio del server di sviluppo
Per avviare l'applicazione in locale:
```bash
npm start
```
*(oppure: `npx ng serve`)*

### 3. Apertura nel browser
Aprire il browser all'indirizzo:
```
http://localhost:4200
```
L'applicazione supporta il live reload: qualsiasi modifica al codice aggiornerà automaticamente la pagina nel browser.

### 4. Build di produzione (Opzionale)
Per compilare l'applicazione per la distribuzione:
```bash
npm run build
```
I file ottimizzati verranno generati all'interno della cartella `dist/tasty-lab`.

---

## 🌐 API e Configurazione Dati

- **Dataset Locale**: l'applicazione recupera il ricettario iniziale tramite `HttpClient.get()` dal file statico [`src/assets/data/recipes.json`](src/assets/data/recipes.json), che include ricette rappresentative della cucina internazionale (es. Carbonara, Sachertorte austriaca, Tacos messicani, Ramen giapponese).
- **Zero Configurazione / Nessun Backend Richiesto**: l'applicazione funziona immediatamente senza dover configurare variabili d'ambiente, database remoti o chiavi API esterne.
- **Persistenza Client-Side**: ogni volta che una ricetta viene aggiunta, modificata o rimossa, il servizio sincronizza automaticamente la lista con il `localStorage` del browser. Questo permette di ricaricare la pagina o riaprire il browser mantenendo intatte le proprie ricette.

---

## 🔮 Sviluppi Futuri

- [ ] Generazione ed esportazione della scheda ricetta e lista spesa in formato **PDF**.
- [ ] Integrazione con un'API nutrizionale esterna per il calcolo stimato di calorie e macronutrienti per porzione.
- [ ] Supporto all'upload locale diretto di immagini personalizzate tramite Base64 o IndexedDB.
- [ ] Modalità timer di cucina integrata per monitorare i tempi di cottura durante la preparazione.

---

## 📁 Struttura delle Cartelle

```text
tasty-lab/
├── public/                     # Immagini, icone e favicon (Chef.jpg, recipe.jpg)
├── src/
│   ├── app/
│   │   ├── components/         # Componenti Standalone
│   │   │   ├── recipe-card/    # Card presentational (Input/Output)
│   │   │   ├── recipe-detail/  # Dettaglio & Laboratorio Porzioni
│   │   │   ├── recipe-form/    # Form reattivo creazione/modifica
│   │   │   └── recipe-list/    # Catalogo, ricerca e filtri
│   │   ├── models/             # Modelli e interfacce TypeScript (Recipe, Ingredient)
│   │   ├── pipes/              # Custom Pipe (PortionScalerPipe)
│   │   ├── services/           # Logica CRUD, HTTP e Signals (RecipeService)
│   │   ├── utils/              # Utility (mappatura bandiere country-flags)
│   │   ├── app.component.*     # Componente radice e layout
│   │   ├── app.config.ts       # Configurazione standalone e provider HTTP
│   │   └── app.routes.ts       # Definizione delle rotte
│   ├── assets/
│   │   └── data/recipes.json   # Dataset ricette iniziale
│   ├── index.html              # Entry point HTML
│   ├── main.ts                 # Bootstrap standalone dell'applicazione
│   └── styles.css              # Palette colori e stili globali
├── angular.json                # Configurazione Angular CLI
├── package.json                # Dipendenze e script npm
└── README.md                   # Documentazione del progetto
```
