import { Injectable } from '@angular/core'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GLOBAL } from '../../services/global';

import { Follow } from '../../models/follow/follow';

@Injectable()
export class FollowService {
    public url: string;
    public token: any;

    constructor(
        public _http: HttpClient
    ){
        this.url = GLOBAL.url;
    }

    getToken(){
        let token = JSON.parse(localStorage.getItem('token'));

        if ( token != 'undefined' ){
            this.token = token;
        }else{
            this.token = null;
        }

        return this.token;
    };

    //Agregar un seguidor a la cuenta logueada
    addFollow(follow): Observable<any>{
        let params = JSON.stringify(follow);
        
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', this.getToken());
        
        return this._http.post( this.url + 'follow-user', params, { headers: headers });
    }

    //Eliminar un seguidor de la cuenta logueada
    deleteFollow(id): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', this.getToken());
        
        return this._http.delete(this.url+'unfollow-user/' + id, { headers: headers });
    }
}