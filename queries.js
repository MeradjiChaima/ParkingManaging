const connection = require('./db');

// liste parkings 
//---------------------------------------------------------------------------
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
    const { Nom, Prenom, Adresse_email, Mot_de_passe, Compte_Gmail, Photo } = user;
    const sql = 'INSERT INTO Utilisateurs (Nom, Prenom, Adresse_email, Mot_de_passe, Compte_Gmail, Photo) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [Nom, Prenom, Adresse_email, Mot_de_passe, Compte_Gmail, Photo], (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de l\'utilisateur :', err);
            return callback(err, null);
        }
        console.log('Utilisateur créé avec succès.');
        callback(null, result.insertId);
    });
}

// login ( existed user ) 
//---------------------------------------------------------------------------
function authenticateUser(credentials, callback) {
    const { email, password } = credentials;
    const sql = 'SELECT * FROM Utilisateurs WHERE Adresse_email = ? AND Mot_de_passe = ?';
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



// details parking  
//---------------------------------------------------------------------------

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

// reserve parking  
//---------------------------------------------------------------------------

// Faire une réservation
function makeReservation(reservationData, callback) {
    const { ID_utilisateur, ID_parking, ID_place, Date_debut, Date_fin, Code_QR, Type_place} = reservationData;
    
    connection.beginTransaction(function(err) {
        if (err) { 
            console.error('Erreur lors du début de la transaction :', err);
            return callback(err, null);
        }
        
        const updatePlaceSql = 'UPDATE Places SET Valide = false WHERE Num_place = ? AND ID_parking = ?';
        connection.query(updatePlaceSql, [ID_place, ID_parking], function(err, result) {
            if (err) { 
                return connection.rollback(function() {
                    console.error('Erreur lors de la mise à jour de l\'état de la place :', err);
                    callback(err, null);
                });
            }

            const updateParkingSql = 'UPDATE Parkings SET Num_valides = Num_valides - 1, Num_reserves = Num_reserves + 1 WHERE ID_parking = ?';
            connection.query(updateParkingSql, [ID_parking], function(err, result) {
                if (err) { 
                    return connection.rollback(function() {
                        console.error('Erreur lors de la mise à jour du nombre de places dans le parking :', err);
                        callback(err, null);
                    });
                }
            
                const insertReservationSql = 'INSERT INTO Reservations (ID_utilisateur, ID_parking, ID_place, Date_debut, Date_fin, Code_QR, Type_place) VALUES (?, ?, ?, ?, ?, ?, ?)  ';
                connection.query(insertReservationSql, [ID_utilisateur, ID_parking, ID_place, Date_debut, Date_fin, Code_QR, Type_place], function(err, result) {
                    if (err) { 
                        return connection.rollback(function() {
                            console.error('Erreur lors de l\'insertion de la réservation :', err);
                            callback(err, null);
                        });
                    }
                
                    connection.commit(function(err) {
                        if (err) { 
                            return connection.rollback(function() {
                                console.error('Erreur lors de la validation de la transaction :', err);
                                callback(err, null);
                            });
                        }
                        
                        console.log('Réservation effectuée avec succès.');
                        callback(null, result.insertId);
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


module.exports = { getAllParkings , getAllUsers ,createUser, authenticateUser ,getParkingDetails, makeReservation, getUserReservations };