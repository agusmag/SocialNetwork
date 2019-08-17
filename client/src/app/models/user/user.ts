//Clase modelo para representar un usuario en la aplicación.

export class User{
    //Si se definen así, se ahorra código de declaración de variable, y la asignación mediante constructor.
    constructor(
        public _id: string,
        public name: string,
        public surname: string,
        public nick: string,
        public email: string,
        public password: string,
        public role: string,
        public image: string
    ){}
}