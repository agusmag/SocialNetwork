import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//Routing
import { routing, appRoutingProviders } from './app.routing';

//Componentes
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';
import { StatsComponent } from './components/stats/stats.component';
import { PublicationsComponent } from './components/publications/publications.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { MomentModule } from 'angular2-moment';

//Se tienen que incluir todos los componenetes en declarations, para poder usarlos en el proyecto.
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    UserEditComponent,
    UsersComponent,
    StatsComponent,
    PublicationsComponent,
    TimelineComponent
  ],
  //Aquí se cargan los diferentes módulos del proyecto, como las rutas por ejemplo.
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    MomentModule
  ],
  //Aquí se pasan los servicios del  proyecto, como por ejemplo el provider de rutas.
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
