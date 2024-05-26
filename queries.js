const connection = require('./db');

//---------------------------------------gestion parking --------------------------

function getAllParkings(callback) {
    const sql = 'SELECT * FROM Parkings';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des parkings :', err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

function getParkingDetails(parkingId, callback) {
    const sql = 'SELECT * FROM Parkings WHERE ID_parking = ?';
    connection.query(sql, [parkingId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des détails du parking :', err);
            return callback(err, null);
        }
        if (result.length === 0) {
            return callback(null, null);
        }
        console.log('Détails du parking récupérés avec succès.');
        callback(null, result[0]);
    });
}

function searchParkingByKeyword(keyword, callback) {
    // La requête SQL est modifiée pour rechercher dans les champs Nom et Commune
    const sql = "SELECT * FROM Parkings WHERE Nom LIKE ? OR Commune LIKE ?";
    // Les valeurs des paramètres sont ajustées pour correspondre au mot clé de recherche
    connection.query(sql, ['%' + keyword + '%', '%' + keyword + '%'], (err, result) => {
        if (err) {
            console.error('Erreur lors de la recherche des parkings par mot clé :', err);
            return callback(err, null);
        }
        console.log('Résultats de la recherche récupérés avec succès.');
        callback(null, result);
    });
}

function getServicesByParkingID(parkingID, callback) {
    const sql = "SELECT * FROM Services WHERE idParking = ?";
    connection.query(sql, [parkingID], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des services par ID de parking :', err);
            return callback(err, null);
        }
        console.log('Résultats de la récupération des services avec succès.');
        callback(null, result);
    });
}

function getReviewsByParkingID(parkingID, callback) {
    const sql = `
        SELECT reviwes.review, reviwes.note, utilisateurs.username AS user
        FROM reviwes
        INNER JOIN utilisateurs ON reviwes.idUser = utilisateurs.ID_utilisateur
        WHERE reviwes.idParking = ?
    `;
    connection.query(sql, [parkingID], (err, results) => {
        if (err) {
            console.error('Error retrieving reviews by parking ID:', err);
            return callback(err, null);
        }
        console.log('Reviews retrieved successfully.');
        callback(null, results);
    });
}

function getCarInfoByParkingID(parkingID, callback) {
    const sql = `
        SELECT 
            COUNT(*) AS total_car_places,
            SUM(CASE WHEN Valide = 1 THEN 1 ELSE 0 END) AS valid_car_places,
            Prix_place AS car_price
        FROM 
            places
        WHERE 
            ID_parking = ? AND Type = 'car';
    `;
    connection.query(sql, [parkingID], (err, result) => {
        if (err) {
            console.error('Error retrieving car info:', err);
            return callback(err, null);
        }
        callback(null, result[0]);
    });
}

function getBikeInfoByParkingID(parkingID, callback) {
    const sql = `
        SELECT 
            COUNT(*) AS total_bike_places,
            SUM(CASE WHEN Valide = 1 THEN 1 ELSE 0 END) AS valid_bike_places,
            Prix_place AS bike_price
        FROM 
            places
        WHERE 
            ID_parking = ? AND Type = 'bike';
    `;
    connection.query(sql, [parkingID], (err, result) => {
        if (err) {
            console.error('Error retrieving bike info:', err);
            return callback(err, null);
        }
        callback(null, result[0]);
    });
}

function getBusInfoByParkingID(parkingID, callback) {
    const sql = `
        SELECT 
            COUNT(*) AS total_bus_places,
            SUM(CASE WHEN Valide = 1 THEN 1 ELSE 0 END) AS valid_bus_places,
            Prix_place AS bus_price
        FROM 
            places
        WHERE 
            ID_parking = ? AND Type = 'bus';
    `;
    connection.query(sql, [parkingID], (err, result) => {
        if (err) {
            console.error('Error retrieving bus info:', err);
            return callback(err, null);
        }
        callback(null, result[0]);
    });
}

function filterParkings(commune, types, maxPrice, callback) {
    // Construire la requête SQL de base
    let sql = "SELECT DISTINCT p.* FROM parkings p INNER JOIN places pl ON p.ID_parking = pl.ID_parking WHERE 1 = 1";

    // Ajouter le filtre par commune si spécifié
    if (commune) {
        sql += " AND p.Commune = ?";
    }

    // Ajouter les types de places à la requête SQL si spécifiés
    if (types && types.length > 0) {
        let typesCondition = types.map(type => "pl.Type = '" + type + "'").join(" OR ");
        sql += " AND (" + typesCondition + ")";
    }

    // Ajouter le filtre de prix maximum si spécifié
    if (maxPrice) {
        sql += " AND pl.Prix_place <= ?";
    }

    // Paramètres de la requête SQL
    let params = [];
    if (commune) {
        params.push(commune);
    }
    if (maxPrice) {
        params.push(maxPrice);
    }

    // Exécuter la requête SQL avec les valeurs des paramètres
    connection.query(sql, params, (err, result) => {
        if (err) {
            console.error('Erreur lors de la recherche des parkings :', err);
            return callback(err, null);
        }
        console.log('Résultats de la recherche récupérés avec succès.');
        callback(null, result);
    });
}


// liste users
//---------------------------------------------------------------------------
function getAllUsers(callback) {
    const sql = 'SELECT * FROM Utilisateurs';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des utilisateurs :', err);
            return callback(err, null);
        }
        callback(null, results);
    });
}


// register ( new user )
//---------------------------------------------------------------------------
function createUser(user, callback) {
    const { Username , Adresse_email, Mot_de_passe, PhoneNumber} = user;
    const sql = "INSERT INTO Utilisateurs (Username, Adresse_email, Mot_de_passe, PhoneNumber) VALUES (?, ?, ?,?)";
    connection.query(sql, [Username, Adresse_email, Mot_de_passe, PhoneNumber], (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de l\'utilisateur :', err);
            return callback(err, null);
        }
        console.log('Utilisateur créé avec succès.');
        callback(null, result.insertId);
    });
}

function authenticateUser(credentials, callback) {
   const { email, password } = credentials;
   const sql = 'SELECT * FROM utilisateurs WHERE Adresse_email = ? AND Mot_de_passe = ?';
   connection.query(sql, [email, password], (err, result) => {
       if (err) {
            console.error('Erreur lors de l\'authentification de l\'utilisateur :', err);
            return callback(err, null);
        }
        if (result.length === 0) {
            return callback(null, false);
        }
        console.log('Utilisateur authentifié avec succès.');
        callback(null, true, result[0]);
    });
}

function getUserIdByEmail(email, callback) {
    const sql = "SELECT * FROM Utilisateurs WHERE Adresse_email = ?";
    connection.query(sql, [email], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'ID utilisateur :', err);
            return callback(err, null);
        }
        if (rows.length === 0) {
            console.log('Aucun utilisateur trouvé avec cette adresse email.');
            return callback(null, null);
        }
        const user = rows[0]; // Récupérer toutes les données de l'utilisateur
        console.log('Utilisateur récupéré avec succès :', user);
        callback(null, user);
    });
}

function getUserById(idUser, callback) {
    const sql = "SELECT * FROM Utilisateurs WHERE ID_utilisateur = ?";
    connection.query(sql, [idUser], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'ID utilisateur :', err);
            return callback(err, null);
        }
        if (rows.length === 0) {
            console.log('Aucun utilisateur trouvé avec cette adresse email.');
            return callback(null, null);
        }
        const user = rows[0]; // Récupérer toutes les données de l'utilisateur
        console.log('Utilisateur récupéré avec succès :', user);
        callback(null, user);
    });
}


function updateUserPhoto(userId, newPhotoPath, callback) {
    const fs = require('fs');
    const path = require('path');

    // Extraire le nom du fichier à partir du chemin complet de l'image
    const fileName = path.basename(newPhotoPath);

    // Mettre à jour le nom du fichier dans la base de données
    const sqlUpdate = 'UPDATE Utilisateurs SET Photo = ? WHERE ID_utilisateur = ?';
    connection.query(sqlUpdate, [fileName, userId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la photo de l\'utilisateur :', err);
            return callback(err);
        }

        // Déplacer la photo vers le dossier images/users avec le nom de fichier extrait
        const imagePath = path.join(__dirname, 'images/users', fileName);
        fs.rename(newPhotoPath, imagePath, (err) => {
            if (err) {
                console.error('Erreur lors du déplacement de la photo :', err);
                return callback(err);
            }

            console.log('La photo a été mise à jour avec succès et déplacée vers le dossier images/users');
            callback(null);
        });
    });
}


// Get all reservations
function getAllReservations(callback) {
    const query = 'SELECT * FROM Reservations';

    connection.query(query, (err, reservations) => {
        if (err) {
            console.error('Erreur lors de la récupération des réservations :', err);
            return callback(err, null);
        }
        callback(null, reservations);
    });
}

// Get reservation by email 
function getAllReservationsByEmail(emailUser, callback) {
    const query = 'SELECT * FROM Reservations WHERE EmailUser = ?';
    // Remplacer 'emailUser' par le nom de la colonne contenant l'email de l'utilisateur dans votre table Reservations
    connection.query(query, [emailUser], (err, reservations) => {
        if (err) {
            console.error('Erreur lors de la récupération des réservations :', err);
            return callback(err, null);
        }
        callback(null, reservations);
    });
}


// Faire une réservation
function makeReservation(reservationData, callback) {
    const { ID_utilisateur, ID_parking, Date_debut, Date_fin, Code_QR, Type_place } = reservationData;

    connection.beginTransaction(function (err) {
        if (err) {
            console.error('Erreur lors du début de la transaction :', err);
            return callback(err, null);
        }

        const selectPlaceSql = 'SELECT ID_place FROM places WHERE ID_parking = ? AND valide = true LIMIT 1';
        connection.query(selectPlaceSql, [ID_parking], function (err, placeResult) {
            if (err) {
                return connection.rollback(function () {
                    console.error('Erreur lors de la récupération de la place disponible :', err);
                    callback(err, null);
                });
            }

            if (placeResult.length === 0) {
                console.error('Aucune place disponible dans ce parking.');
                return connection.rollback(function () {
                    callback(new Error('Aucune place disponible dans ce parking.'), null);
                });
            }

            const ID_place = placeResult[0].ID_place;

            const updatePlaceSql = 'UPDATE Places SET Valide = false WHERE ID_place = ? AND ID_parking = ?';
            connection.query(updatePlaceSql, [ID_place, ID_parking], function (err, result) {
                if (err) {
                    return connection.rollback(function () {
                        console.error('Erreur lors de la mise à jour de l\'état de la place :', err);
                        callback(err, null);
                    });
                }

                const updateParkingSql = 'UPDATE Parkings SET Num_valides = Num_valides - 1 WHERE ID_parking = ?';
                connection.query(updateParkingSql, [ID_parking], function (err, result) {
                    if (err) {
                        return connection.rollback(function () {
                            console.error('Erreur lors de la mise à jour du nombre de places dans le parking :', err);
                            callback(err, null);
                        });
                    }

                    const insertReservationSql = 'INSERT INTO Reservations (ID_utilisateur , ID_parking, ID_place, Date_debut, Date_fin, Code_QR, Type_place) VALUES (?, ?, ?, ?, ?, ?, ?)';
                    connection.query(insertReservationSql, [ID_utilisateur, ID_parking, ID_place, Date_debut, Date_fin, Code_QR, Type_place], function (err, result) {
                        if (err) {
                            return connection.rollback(function () {
                                console.error('Erreur lors de l\'insertion de la réservation :', err);
                                callback(err, null);
                            });
                        }

                        const reservation = {
                            ID_reservation: result.insertId,
                            EmailUser,
                            ID_parking,
                            ID_place,
                            Date_debut,
                            Date_fin,
                            Code_QR,
                            Type_place
                        };

                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    console.error('Erreur lors de la validation de la transaction :', err);
                                    callback(err, null);
                                });
                            }

                            console.log('Réservation effectuée avec succès.');
                            callback(null, reservation); // Retourner la réservation ajoutée
                        });
                    });
                });
            });
        });
    });
}



// mes reservations 
//---------------------------------------------------------------------------
function getUserReservations(userId, callback) {
    const sql = 'SELECT * FROM Reservations WHERE ID_utilisateur = ?';
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des réservations de l\'utilisateur :', err);
            return callback(err, null);
        }
        console.log('Réservations de l\'utilisateur récupérées avec succès.');
        callback(null, results);
    });
}


module.exports = {filterParkings, updateUserPhoto ,getUserById, getUserIdByEmail , getBusInfoByParkingID, getBikeInfoByParkingID, getCarInfoByParkingID, getReviewsByParkingID, getServicesByParkingID, getAllReservationsByEmail, getAllReservations, getAllParkings , getAllUsers ,createUser, authenticateUser ,getParkingDetails, makeReservation, getUserReservations , searchParkingByKeyword};