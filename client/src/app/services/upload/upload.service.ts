import { Injectable } from '@angular/core';
import { GLOBAL } from '../global';

@Injectable()
//Clase Service para realizar requests al backend sobre manejo de imágenes de usuarios.
export class UploadService{
    public url: string;

    constructor(){
        this.url = GLOBAL.url;
    }

    //Método para realizar el request de subida de archivo de un usuario autenticado.
    makeFileRequest( url: string, params: Array<string>, files: Array<File>, token: string, name: string ){
        //Se usa xhr, es decir la forma nativa de js para realizar Request.
        return new Promise( function( resolve, reject ){
            //Se declara un FormData que contendrá los datos.
            var formData: any = new FormData();
            //Se instancia un tipo request.
            var xhr = new XMLHttpRequest();

            //Por cada archivo que tenga el array se adjuntará al formulario.
            for( var i = 0; i < files.length; i++ ){
                formData.append( name, files[i], files[i].name );
            }

            //Si el estado es 4 y el status es 200, significa que puedo realizar el request, por lo que se parsea la respuesta.
            xhr.onreadystatechange = function(){
                if ( xhr.readyState == 4){
                    if ( xhr.status == 200 ){
                        resolve( JSON.parse( xhr.response ));
                    }else{
                        reject( xhr.response );
                    }
                }
            }

            //Se abre la conexión y se realiza el post del formulario con los archivos adjuntos.
            xhr.open( 'POST', url, true );
            xhr.setRequestHeader('Authorization', token );
            xhr.send( formData );
        });
    }
}