//Clase modelo para representar un seguimiento en la aplicación.

export class Follow{
    constructor(
        public _id: string,
        public user: string,
        public followed: string
    ){}
}