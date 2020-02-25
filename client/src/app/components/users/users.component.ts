import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from '../../models/user/user';
import { Follow } from '../../models/follow/follow';

import { UserService } from '../../services/user/user.service';
import { FollowService } from '../../services/follow/follow.service';

import { GLOBAL } from '../../services/global';
import { Route } from '@angular/compiler/src/core';
import { timingSafeEqual } from 'crypto';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [ UserService, FollowService ]
})
export class UsersComponent implements OnInit{
    public title: string;
    public url: string;
    public identity;
    public token;
    public page;
    public nextPage;
    public prevPage;
    public total;
    public pages;
    public users:User[];
    public follows;
    public status: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _followService: FollowService
    ){
        this.title = 'Gente';
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
    }

    ngOnInit(){
        console.log('users.component ha sido cargado');
        this.actualPage();
    }

    actualPage(){
        this._route.params.subscribe(params => {
            let page = +params['page'];

            if (!page){
                page = 1;
            }else {
                this.nextPage = page+1;
                this.prevPage = page-1;

                if (this.prevPage <= 0) {
                    this.prevPage = 1;
                }
            }

            this.page = page;

            //Devolver listado de usuarios
            this.getUsers(page);
        });
    }

    getUsers(page){
        this._userService.getUsers(page).subscribe(
            response => {
                if (!response.users){
                    this.status = 'error';
                }else {
                    this.token = response.total;
                    this.users = response.users;
                    this.pages = response.pages;
                    this.follows = response.users_following;

                    if (page > this.pages){
                        this._router.navigate(['/gente', 1]);
                    }
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);

                if (errorMessage != null ) {
                    this.status = 'error';
                }
            }
        );
    }

    public followUserOver;

    mouseEnter(userId) {
        this.followUserOver = userId;
    }

    mouseLeave(userId) {
        this.followUserOver = 0;
    }

    followUser(followed){
        var follow = new Follow('', this.identity._id, followed);
        
        this._followService.addFollow(follow).subscribe(
            response => {
                if (!response.follow){
                    this.status = 'error';
                }else {
                    this.status = 'success';
                    this.follows.push(followed);
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);

                if (errorMessage != null ) {
                    this.status = 'error';
                }
            }
        );
    }

    unfollowUser(followed){
        this._followService.deleteFollow(followed).subscribe(
            response => {
                if (!response){
                    this.status = 'error';
                }else {
                    this.status = 'success';
                    var search = this.follows.indexOf(followed);

                    if (search != -1){
                        this.follows.splice(search, 1);
                    }
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);

                if (errorMessage != null ) {
                    this.status = 'error';
                }
            }
        )
    }
}