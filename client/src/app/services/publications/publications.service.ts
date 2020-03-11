import { Injectable } from '@angular/core'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GLOBAL } from '../../services/global';

import { Publication } from '../../models/publication/publication';

@Injectable()
export class PublicationService {
    public url: string;

    constructor( private _http: HttpClient ){
        this.url = GLOBAL.url;
    }

    // Método para agregar una nueva publicación a la base de datos.
    addPublication(token, publication): Observable<any>{
        let params = JSON.stringify(publication);

        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', token);

        return this._http.post(this.url + 'publication', params, { headers:headers });
    }

    // Método para listar todas las publicaciones de los usuarios que sigue el logueado.
    getPublications(token, page = 1): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', token);

        return this._http.get(this.url + 'publications/' + page, { headers: headers });
    }

    // Método para eliminar una publicación
    deletePublication(token, idPublication): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', token);

        return this._http.delete(this.url + 'publication/' + idPublication, {headers: headers});
    }
}