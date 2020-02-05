import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user/user';
import { UserService } from '../../services/user/user.service';
import { GLOBAL } from '../../services/global';
import { Route } from '@angular/compiler/src/core';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [ UserService ]
})
export class UsersComponent implements OnInit{
    public title: string;
    public identity;
    public token;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ){
        this.title = 'Gente';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
    }

    ngOnInit(){
        console.log('users.component ha sido cargado');
    }
}