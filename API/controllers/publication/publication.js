'use strict'

const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePaginate = require('mongoose-pagination');

const Publication = require('../../models/publications/publication');
const User = require('../../models/user/user');
const Follow = require('../../models/follows/follow');

//Método que guarda una publicación de un usuario.
function savePublication(req, res) {
    const params = req.body;

    if (!params.text) {
        return res.status(200).send({
            message: "La publicación debe tener un texto."
        });
    }

    let publication = new Publication();

    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.create_at = moment().unix();

    publication.save((err, publicationStored) => {
        if (err) {
            return res.status(500).send({
                message: "Hubo un error al guardar la publicación."
            });
        }

        if (!publicationStored) {
            return res.status(404).send({
                message: "La publicación no pudo ser guardada."
            });
        }

        return res.status(200).send({
            publicationStored
        });
    });
};

//Método que obtiene todas las publicaciones de los usuarios que sigue el autenticado.
function getPublications(req, res) {
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    const itemsPerPage = 4;

    //Se obtienen todos los usuarios que sigue el autenticado.
    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) {
            return res.status(500).send({
                message: "Hubo un error al obtener los usuarios seguidos."
            });
        }

        let followsClean = [];

        follows.forEach(follow => {
            followsClean.push(follow.followed);
        });

        followsClean.push(req.user.sub);

        //El operador $in indica que va a buscar por el valor indicado dentro de un array, es decir como muchas búsquedas.
        Publication.find({ user: { $in: followsClean } }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) {
                return res.status(500).send({
                    message: "Hubo un error al obtener las publicaciones de los usuarios seguidos."
                });
            }

            if (!publications) {
                return res.status(404).send({
                    message: "No hay publicaciones."
                });
            }

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                itemsPerPage: itemsPerPage,
                publications
            });
        });
    });
};

//Método para obtener todas las publicaciones de un usuario.
function getUserPublications(req, res) {
    //Se obtiene el id del usuario logueado.
    let userId = req.user.sub;
    let page = 1;

    //Si llega un id y un número de página por la url, usamos ese id para obtener su listado de seguidos, sino el del usuario autentificado.
    if (req.params.id && isNaN(req.params.id)) {
        userId = req.params.id;
    } else if (req.params.id) {
        page = req.params.id;
    }

    //Si llega un número de página por la url buscamos en ese página, sino se usa la primera por defecto.
    if (req.params.page) {
        page = req.params.page;
    }

    //Se usan por defecto 4 usarios por página.
    const itemsPerPage = 4;

    //El operador $in indica que va a buscar por el valor indicado dentro de un array, es decir como muchas búsquedas.
    Publication.find({ user: userId }).sort('-created_at').paginate(page, itemsPerPage, (err, publications, total) => {
        if (err) {
            return res.status(500).send({
                message: "Hubo un error al obtener las publicaciones creadas."
            });
        }

        if (!publications) {
            return res.status(404).send({
                message: "No hay publicaciones creadas."
            });
        }

        return res.status(200).send({
            total_items: total,
            pages: Math.ceil(total / itemsPerPage),
            page: page,
            publications
        });
    });
};

//Método para obtener una publicación por su id.
function getPublication(req, res) {
    const publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err) {
            return res.status(500).send({
                message: "Hubo un error al obtener la publicación."
            });
        }

        if (!publication) {
            return res.status(404).send({
                message: "No exite la publicación."
            });
        }

        return res.status(200).send({
            publication
        });
    });
};

//Método para eliminar una publicación del usuario autenticado
function removePublication(req, res) {
    const publicationId = req.params.id;
    const userId = req.user.sub;

    Publication.findById(publicationId, (err, publication) => {
        if (err) {
            return res.status(500).send({
                message: "Hubo un error al obtener la publicación."
            });
        }

        if (!publication) {
            return res.status(404).send({
                message: "La publicación no existe."
            });
        }

        //Antes de informar que se ha eliminado la publicación, verifico si tiene una imagen asociada y la elimino de la carpeta uploads/publications.
        if (publication.file) {
            const pathFile = './uploads/publications/' + publication.file;

            fs.exists(pathFile, (exists) => {
                if (exists) {
                    try {
                        fs.unlinkSync(pathFile)
                            //La imagen fue eliminada con éxito, ahora se procede a eliminar la publicación.
                    } catch (err) {
                        return res.status(500).send({
                            message: "Hubo un error al eliminar la imagen de la publicación."
                        });
                    }
                }
            });
        }

        Publication.find({ 'user': userId, '_id': publicationId }).deleteOne((err) => {
            if (err) {
                return res.status(500).send({
                    message: "Hubo un error al eliminar la publicación.",
                });
            }

            return res.status(200).send({
                message: "La publicación se ha eliminado correctamente."
            });
        });
    });
};


//Método para subir archivos de imagen a una publicación, para subir imágenes en el post, tengo que usar el form-data.
function uploadImage(req, res) {
    const publicationId = req.params.id;

    //Los archivos que se agregan en un request, se agregan en files
    if (req.files) {
        //Se guardan el nombre con extención, y la extención de la imagen para validarlo.
        const filePath = req.files.image.path;
        const fileName = filePath.split('/')[2];
        const fileExtention = fileName.split('.')[1].toLowerCase();

        //Se podría optimizar esto con un helper.
        if (fileExtention == 'png' || fileExtention == 'jpg' || fileExtention == 'jpeg' || fileExtention == 'gif') {
            //Se actualiza la publicación con la imagen.
            Publication.findOne({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
                if (publication) {
                    Publication.findByIdAndUpdate(publicationId, { file: fileName }, { new: true }, (error, publicationUpdated) => {
                        if (error) {
                            return res.status(500).send({
                                message: "No se ha podido realizar esa operación."
                            });
                        }

                        if (!publicationUpdated) {
                            return res.status(404).send({
                                message: "No se ha podido actualizar la publicación."
                            });
                        }

                        //Si se actualizó correctamente, muestro la publicación con los nuevos datos.
                        return res.status(200).send({
                            publication: publicationUpdated
                        });
                    });
                } else {
                    return removeFilesOfUploads(res, filePath, "No se tiene autorización para actualizar la publicación.");
                }
            });
        } else {
            return removeFilesOfUploads(res, filePath, "La extención no es válida.");
        }
    } else {
        return res.status(200).send({
            message: "No se han subido archivos e imágenes."
        });
    }
};

//Método para eliminar un archivo del storage.
function removeFilesOfUploads(res, filePath, message) {
    fs.unlink(filePath, (error) => {
        return res.status(500).send({
            message: message
        });
    })
}

//Método para obtener la imágen de un usuario.
function getImageFile(req, res) {
    //Parámetro que recibe por url.
    const imageFile = req.params.imageFile;
    const pathFile = './uploads/publications/' + imageFile;

    fs.exists(pathFile, (exists) => {
        if (exists) {
            //Si existe esa ruta a ese archivo, lo devuelvo con el método propio de express.
            return res.sendFile(path.resolve(pathFile));
        } else {
            return res.status(404).send({
                message: "La imagen no existe."
            });
        }
    });
}

module.exports = {
    getPublication,
    getPublications,
    getUserPublications,
    savePublication,
    removePublication,
    uploadImage,
    getImageFile
};