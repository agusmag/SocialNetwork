import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

//Modelos
import { User } from '../../models/user/user';

//Servicios
import { UserService } from '../../services/user/user.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    providers: [ UserService ]
})

//Clase componente para la vista Login.
export class LoginComponent implements OnInit{
    public title:string;
    public user: User;
    public status: string;
    public identity: any;
    public token: any;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ){
        this.title = 'Iniciar sesión';
        this.user = new User("", "", "", "", "", "", "ROLE_USER", "");
    }

    //Directiva que se ejecuta luego de cargar el componente.
    ngOnInit(){
        console.log('[LoginComponent] Loaded');
    }

    onSubmit(){
        //Loguear al usuario y conseguir sus datos.
        this._userService.signUp( this.user ).subscribe(
            response => {
                this.identity = response.user;
                if ( !this.identity  || !this.identity._id ) {
                    this.status = 'failed';
                }else {
                    //Persistir datos de usuario en el localStorage, tiene que ser string si o si, no puede guardar objectos de js, por eso uso JSON.stringify.
                    localStorage.setItem('identity', JSON.stringify( this.identity ));
                    //Obtener el token de autenticación.
                    this.getToken();

                    this._router.navigate(['/']);
                }
            },
            error => {
                const errorMessage = <any>error;

                if( errorMessage != null ) {
                    console.log( errorMessage );
                    this.status = 'failed';
                }
            }
        );
    }

    //Método para realizar un request de logueo con la variable de withToken en true.
    getToken(){
        //Loguear al usuario y conseguir sus datos.
        this._userService.signUp( this.user, 'true' ).subscribe(
            response => {
                this.token = response.token;
                if (this.token.length == 0 ) {
                    this.status = 'failed';
                }else {
                    //Persistir datos de usuario
                    localStorage.setItem('token', JSON.stringify( this.token ));
                    
                    //Conseguir contadores y estadísticas del usuario.
                    this.getCounters();
                }
            },
            error => {
                const errorMessage = <any>error;

                if( errorMessage != null ) {
                    console.log( errorMessage );
                    this.status = 'failed';
                }
            }
        );
    };

    getCounters(){
        this._userService.getCounters().subscribe(
            response => {
                localStorage.setItem('stats', JSON.stringify( response ));
                this.status = 'success';
            },
            error =>{
                console.log( <any>error );
                this.status = 'failed';
            }
        );
    };
}