//Clase modelo para representar una publicación en la aplicación.

export class Publication{
    constructor(
        public _id: string,
        public create_at: string,
        public text: string,
        public user: string,
        public file: string
    ){}
}