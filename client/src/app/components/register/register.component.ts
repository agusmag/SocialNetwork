import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router';

//Modelos
import { User } from '../../models/user/user';

//Servicios
import { UserService } from '../../services/user/user.service';

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    providers: [ UserService ]
})

export class RegisterComponent implements OnInit{
    public title:string;
    public user: User;
    public status: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService

    ){
        this.title = 'Registro';
        this.user = new User( "", "", "", "", "", "", "ROLE_USER", "");
    }
    
    ngOnInit(){
        console.log('[RegisterComponent] Loaded');
    };

    onSubmit( registerForm ){
        console.log("[RegisterComponen] Form submited." );
        //El subscribe permite obtener la respuesta de ese request.
        this._userService.register( this.user ).subscribe(
            response => {
                if ( response.user && response.user._id ) {
                    this.status = 'success';
                    //Método propio del formulario para poder limpiar sus datos.
                    registerForm.reset();
                }else{
                    this.status = 'failed';
                }
            },
            error => {
                console.log( <any>error );
            }
        );
    }
}