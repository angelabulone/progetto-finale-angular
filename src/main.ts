/**
 * Punto di ingresso (bootstrap) dell'applicazione TastyLab.
 * Avvia l'AppComponent in modalità Standalone applicando le configurazioni globali di appConfig.
 */
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
