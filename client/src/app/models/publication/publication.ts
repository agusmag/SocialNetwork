//Clase modelo para representar una publicación en la aplicación.

export class Publication{
    constructor(
        public _id: string,
        public user: string,
        public text: string,
        public file: string,
        public create_at: string
    ){}
}