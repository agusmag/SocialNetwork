import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from '../../services/global';
import * as moment from 'moment';

//Modelos
import { Publication } from '../../models/publication/publication';

// Servicios
import { UserService } from '../../services/user/user.service';
import { PublicationService } from '../../services/publications/publications.service';

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
    public total;
    public pages;
    public publications: Publication[];
    public publicationDates: String[];

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
    }

    ngOnInit(){
        console.log("timeline.component: El componente ha cargado correctamente!");
        this.getPublications(this.page);
    }

    getPublications(page){
        this._publicationService.getPublications(this.token, page).subscribe(
            response => {
                if (response.publications) {
                    this.publications = response.publications;

                    this.publications.forEach( (publication, index) => {
                        this.publicationDates[index] = moment.unix(+publication.create_at).format("DD/MM/YYYY");
                    });

                    console.log(this.publicationDates);

                    this.total = response.total_items;
                    this.pages = response.pages;

                    if (this.page > this.pages) {
                        this._router.navigate(['/home']);
                    }

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
}