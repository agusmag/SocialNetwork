import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from '../../services/global';

//Modelos
import { User } from '../../models/user/user';

//Servicios
import { UserService } from '../../services/user/user.service';
import { UploadService } from 'src/app/services/upload/upload.service';


@Component({
    selector: 'user-edit',
    templateUrl: './user-edit.component.html',
    providers: [ UserService, UploadService ]
})
//Clase componente para editar los datos de usuario logeuado.
export class UserEditComponent implements OnInit{
    public title: string;
    public user: User;
    public identity: any;
    public token: any;
    public status: string;
    public filesToUpload: Array<File>;
    public url: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _uploadService: UploadService
    ){
        this.title = 'Actualizar mis datos';
        this.user = this._userService.getIdentity();
        this.identity = this.user;
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
    }

    ngOnInit(){
        console.log('[UserEditComponent] Loaded.');
    }

    onSubmit(){
        this._userService.updateUser( this.user ).subscribe(
            response => {

                if ( !response.user ){
                    this.status = 'failed';
                }else {
                    this.status = 'success';
                    localStorage.setItem('identity', JSON.stringify( this.user ));
                    this.identity = this.user;

                    //Subida de imagen de usuario.
                    this._uploadService.makeFileRequest(this.url + 'image-user/' + this.user._id, [], this.filesToUpload, this.token, 'image' )
                        .then( (result: any ) => {
                            this.user.image = result.user.image;
                            localStorage.setItem('identity', JSON.stringify( this.user ));
                        });

                }
            },
            error => {
                console.log( <any>error );
                this.status = 'failed';
            }
        )
    }


    //Método para captar la subida de archivos desde el input y bindearlo al atributo.
    fileChangeEvent( fileInput: any ){
        //Se crea un array de files y se capta el archivo desde el evento.target.files, que es donde se almacena.
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }
}