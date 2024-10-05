import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Dictionaries for German language
import deMessages from "../assets/idiomas/es.json";
import { locale, loadMessages } from "devextreme/localization";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent {
  title = 'XTEIN';
  constructor() {
    loadMessages(deMessages);
    locale(navigator.language);
  }
}
