import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from './services/global';

//Servicios
import { UserService } from './services/user/user.service';

// declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ UserService ]
})
export class AppComponent implements OnInit, DoCheck{
  public title: string;
  public identity;
  public url: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ){
    this.title = 'SocialMagarus';
    this.url = GLOBAL.url;
  }

  //Método de directiva que se ejecuta el iniciar el componente.
  ngOnInit(){
   //Se obtiene el token de seguridad del localStorage por si algún usuario se logueo previamente.
    this.identity = this._userService.getIdentity();
  }

  //Método de directiva que se encarga de verificar los cambios y realizar algo.
  ngDoCheck(){
    this.identity = this._userService.getIdentity();
  }

  //Método que realiza un clear del localStorage
  logout(){
    localStorage.clear();
    this.identity = null;

    this._router.navigate(['/']);
  }
}
