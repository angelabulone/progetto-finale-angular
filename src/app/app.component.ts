/**
 * Componente radice dell'applicazione (Shell Layout).
 * Gestisce la barra di navigazione principale, il footer dinamico e l'area di rendering delle viste (<router-outlet>).
 */
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly appTitle = 'TastyLab';
  readonly currentYear = new Date().getFullYear();
}
