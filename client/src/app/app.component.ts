import { Component } from '@angular/core';

declare var $: any;

console.log(`jQuery version: ${$.fn.jquery}`);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
}
