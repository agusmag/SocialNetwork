//Clase servicio para interactuar con la API Rest de la aplicación mediante Ajax.

import { Injectable } from '@angular/core'; //Para definir los servicios y usarlos en otras clases.
import { HttpClient, HttpHeaders } from '@angular/common/http'; //Para enviar request y cabeceras a la API vía ajax.
import { Observable } from 'rxjs'; //Para recibir la información de los métodos de la API.

//Modelos
import { User } from '../../models/user/user';

//Configuración global
import { GLOBAL } from '../global';
 
@Injectable()
export class UserService{
    public url: string; //Url del backend.
    public identity: any;
    public token: any;
    public stats: any;

    constructor(
        public _http: HttpClient
    ){
        this.url = GLOBAL.url;
    }

    //Método para realizar un request de registro de usuario.
    register( user: User ): Observable<any>{
        console.log("[UserService] Data send to backend.");
        //Se parsean los datos del usuario a json.
        let params = JSON.stringify(user);
        //Hay que pasarle la cabecera del request que se quiere hacer.
        let headers = new HttpHeaders().set('Content-Type', 'application/json');

        //Se realiza el request POST a la API (backend), register es el método que quiero llamar del backend.
        return this._http.post( this.url + 'register', params, { headers: headers });
    };

    //Método para realizar un request de identificación de usuario.
    signUp( user , withToken = null): Observable<any>{
        if ( withToken != null ){
            user.withToken = withToken;
        }

        let params = JSON.stringify( user );
        let headers = new HttpHeaders().set('Content-Type', 'application/json');

        return this._http.post( this.url + 'login', params, { headers: headers });
    };

    //Método para obtener la autenticación de usuario logueado (identity).
    getIdentity(){
        //Se obtiene el usuario almacenado en el localStorage.
        let identity = JSON.parse(localStorage.getItem('identity'));

        if ( identity != 'undefined' ){
            this.identity = identity;
        }else{
            this.identity = null;
        }

        return this.identity;
    };

    //Método para obtener la autenticación de usuario logueado (token).
    getToken(){
        //Se obtiene el token almacenado en el localStorage.
        let token = JSON.parse(localStorage.getItem('token'));

        if ( token != 'undefined' ){
            this.token = token;
        }else{
            this.token = null;
        }

        return this.token;
    };

    //Método para obtener los datos de estadística del localStorage
    getStats(){
        let stats = JSON.parse( localStorage.getItem('stats') );

        if ( stats != 'undefined' ){
            this.stats = stats;
        }else{
            this.stats = null;
        }

        return this.stats;
    }

    //Método que realiza el request para obtener las estadísticas del usuario autenticado.
    getCounters( userId = null ): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', this.getToken());

        if ( userId != null) {
            return this._http.get( this.url + 'counters/' + userId, { headers: headers });
        }else {
            return this._http.get( this.url + 'counters', { headers: headers });
        }
    }

    //Método que realiza el request para actualizar los datos del usuario autenticado.
    updateUser( user: User ): Observable<any>{
        let params = JSON.stringify( user );
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', this.getToken());
        
        return this._http.put(this.url + '/user/' + user._id, params, { headers: headers });
    }
} 