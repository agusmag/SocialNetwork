//Archivo de configuración de rutas para componentes
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Componentes
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';

//Se define una constante con las rutas de la aplicación, una ruta por módulo.
const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'mis-datos', component: UserEditComponent },
    { path: 'gente', component: UsersComponent },
    { path: 'gente/:page', component: UsersComponent },
    { path: '**', component: HomeComponent }
];

//Se exporta la configuración de rutas definida.
export const appRoutingProviders : any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot( appRoutes );