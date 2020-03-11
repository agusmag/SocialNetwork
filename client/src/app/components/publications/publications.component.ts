import { Component, OnInit } from "@angular/core";

// Modelos
import { Publication } from '../../models/publication/publication';

// Servicios
import { UserService } from '../../services/user/user.service';
import { PublicationService } from '../../services/publications/publications.service';

import { GLOBAL } from '../../services/global';

@Component({
    selector: 'publications',
    templateUrl: './publications.component.html',
    providers: [ UserService, PublicationService ]
})
export class PublicationsComponent implements OnInit{
    public url;
    public identity;
    public token;
    public publication: Publication;
    public status;

    constructor(
        private _userService: UserService,
        private _publicationService: PublicationService
    ){
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.publication = new Publication("", "", "", this.identity._id, "");
    }

    ngOnInit(){
        console.log('publications.component: El componente ha cargado!');
    }

    onSubmit(form){
        this._publicationService.addPublication(this.token, this.publication).subscribe(
            response => {
                if (response.publicationStored ) {
                    //this.publication = response.publication;
                    form.reset();
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