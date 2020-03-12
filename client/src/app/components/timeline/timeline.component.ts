import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from '../../services/global';

//Modelos
import { Publication } from '../../models/publication/publication';

// Servicios
import { UserService } from '../../services/user/user.service';
import { PublicationService } from '../../services/publications/publications.service';
import { $ } from 'protractor';

@Component({
    selector: 'timeline',
    templateUrl: './timeline.component.html',
    providers: [ UserService, PublicationService ]
})
export class TimelineComponent implements OnInit{
    public title: string;
    public identity;
    public token;
    public url: string;
    public status: String;
    public page;
    public itemPerPage;
    public total;
    public pages;
    public publications: Publication[];
    public publicationDates: String[];
    public prevIndex;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _publicationService: PublicationService
    ){
        this.title = 'Timeline';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.page = 1;
        this.publicationDates = [];
        this.prevIndex = 0;
    }

    ngOnInit(){
        console.log("timeline.component: El componente ha cargado correctamente!");
        this.getPublications(this.page);
    }

    getPublications(page, adding = false ){
        this._publicationService.getPublications(this.token, page).subscribe(
            response => {
                if (response.publications) {

                    if ( !adding ) {
                        this.publications = response.publications;
                    }else {
                        var publicationsOld = this.publications;
                        var publicationsNew = response.publications;
                        this.publications = publicationsOld.concat(publicationsNew);
                    }

                    this.total = response.total_items;
                    this.pages = response.pages;
                    this.itemPerPage = response.itemPerPage;

                    this.status = 'Success';
                } else {
                    this.status = 'Error';
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null ) {
                    this.status = 'Error';
                }
            }
        );
    }

    public noMore = false;

    viewMore(){
        if (this.publications.length == (this.total)){
            this.noMore = true;
        }else {
            this.page += 1;
        }

        this.getPublications(this.page, true);
    }
}