import { Component, OnInit } from "@angular/core";

import { UserService } from '../../services/user/user.service';

import { GLOBAL } from '../../services/global';

@Component({
    selector: 'stats',
    templateUrl: './stats.component.html',
    providers: [ UserService ]
})
export class StatsComponent implements OnInit{
    public url;
    public identity;
    public token;
    public stats;
    public status;

    constructor(
        private _userService: UserService
    ){
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.stats = this._userService.getStats();
    }

    ngOnInit(){
        console.log('stats.component: El componente ha cargado!');
    }
}