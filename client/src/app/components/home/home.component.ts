import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit{
    public title;

    constructor(){
        this.title = 'Bienvenido a Social de Magarus!'
    }

    ngOnInit(){
        console.log('[HomeComponent] Loaded.');
    }
}