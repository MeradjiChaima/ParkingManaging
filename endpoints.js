const express = require('express');
const { filterParkings, updateUserPhoto , getUserById,getUserIdByEmail, getBusInfoByParkingID , getBikeInfoByParkingID ,  getCarInfoByParkingID, getReviewsByParkingID, getServicesByParkingID,getAllReservationsByEmail, getAllReservations,getAllParkings , getAllUsers ,createUser, authenticateUser ,getParkingDetails, makeReservation, getUserReservations ,searchParkingByKeyword } = require('./queries');
const path = require('path'); // Déplacez cette ligne vers le haut
const multer = require('multer');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());


//--------------------------------Routes Usrs ----------------------------------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/users');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Utilisez le nom de fichier d'origine
    }
});

// Configurer multer pour l'upload de fichiers
const upload = multer({ storage: storage });

app.put('/users/:userId/photo', upload.single('photo'), (req, res) => {
    const userId = req.params.userId;
    const newPhotoPath = req.file.path; // Utilisez req.file.path pour obtenir le chemin de l'image téléchargée

    updateUserPhoto(userId, newPhotoPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo de l\'utilisateur.' });
        }
        
        res.status(200).json({ message: 'La photo de l\'utilisateur a été mise à jour avec succès.' });
    });
});



app.get('/users/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'images/users', imageName);
    res.sendFile(imagePath);
});

app.use(express.static('images/users'));

app.get('/users', (req, res) => {
    getAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
        }
        res.json(users);
    });
});


// Route pour créer un nouvel utilisateur
app.post('/register', (req, res) => {
    const userData = req.body;
    createUser(userData, (err, userId) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la création du compte utilisateur.' });
        }
        res.json({ message: 'Compte utilisateur créé avec succès.', userId });
    });
});


app.get('/user/id', (req, res) => {
    const email = req.query.email; // Récupérer l'adresse email à partir de la requête URL
    getUserIdByEmail(email, (err, user) => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la récupération des données de l\'utilisateur.' });
            return;
        }
        if (!user) {
            res.status(404).json({ message: 'Aucun utilisateur trouvé avec cette adresse email.' });
            return;
        }
        res.status(200).json(user);
    });
});


app.get('/userId', (req, res) => {
    const id = req.query.id; // Récupérer l'ID utilisateur à partir de la requête URL
    getUserById(id, (err, user) => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la récupération des données de l\'utilisateur.' });
            return;
        }
        if (!user) {
            res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet ID.' });
            return;
        }
        res.status(200).json(user);
    });
});




// Route pour l'authentification de l'utilisateur
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    authenticateUser({ email, password }, (err, isAuthenticated, user) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'authentification.' });
        }
        if (!isAuthenticated) {
            return res.status(401).json({ error: 'Adresse email ou mot de passe incorrect.' });
        }
        res.json({ message: 'Authentification réussie.', user });
    });
});


//--------------------------------------Routes Parkings--------------------------------------------


app.get('/parkings/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'images/parkings', imageName);
    res.sendFile(imagePath);
});

app.use(express.static('images/parkings'));

app.get('/parkings', (req, res) => {
    getAllParkings((err, parkings) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des parkings.' });
        }
        res.json(parkings);
    });
});

app.get('/parkingSearch', (req, res) => {
    const keyword = req.query.keyword; 
    if (!keyword) {
        return res.status(400).json({ error: 'Mot clé de recherche non fourni dans la requête.' });
    }
    searchParkingByKeyword(keyword, (err, parkings) => { 
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la recherche des parkings.' });
        }
        res.json(parkings);
    });
});

app.get('/parking/:id', (req, res) => {
    const parkingId = req.params.id;
    getParkingDetails(parkingId, (err, parking) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des détails du parking.' });
        }
        if (!parking) {
            return res.status(404).json({ error: 'Parking non trouvé.' });
        }
        res.json(parking);
    });
});

app.get('/services/:parkingID', (req, res) => {
    const parkingID = req.params.parkingID;
    if (!parkingID) {
        return res.status(400).json({ error: 'ID du parking non fourni dans la requête.' });
    }
    getServicesByParkingID(parkingID, (err, services) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des services.' });
        }
        res.json(services);
    });
});
app.get('/parkingReviews/:id', (req, res) => {
    const parkingID = req.params.id;
    if (!parkingID) {
        return res.status(400).json({ error: 'Parking ID not provided in the request.' });
    }

    getReviewsByParkingID(parkingID, (err, reviews) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving reviews.' });
        }
        res.json(reviews);
    });
});

app.get('/carInfo/:parkingID', (req, res) => {
    const parkingID = req.params.parkingID; 
    getCarInfoByParkingID(parkingID, (err, carInfo) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving car info.' });
        }
        res.json(carInfo);
    });
});

app.get('/bikeInfo/:parkingID', (req, res) => {
    const parkingID = req.params.parkingID; 
    getBikeInfoByParkingID(parkingID, (err, bikeInfo) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving bike info.' });
        }
        res.json(bikeInfo);
    });
});

app.get('/busInfo/:parkingID', (req, res) => {
    const parkingID = req.params.parkingID; 
    getBusInfoByParkingID(parkingID, (err, busInfo) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving bus info.' });
        }
        res.json(busInfo);
    });
});

app.post('/FilterParkings', (req, res) => {
    const { commune, types, maxPrice } = req.body;
    filterParkings(commune, types, maxPrice, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la recherche des parkings.' });
        }
        res.json(results);
    });
});

//-----------------------------------------Reservations Routes ----------------------------------
// Route pour get all reservation 
app.get('/AllReservations', (req, res) => {
    getAllReservations((err, reservations) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des réservations.' });
        }
        res.json(reservations);
    });
});
// Route pour get all reservation by Email user 
app.get('/reservationsByEmail/:email', (req, res) => {
    const emailUser = req.params.email;
    getAllReservationsByEmail(emailUser, (err, reservations) => {
        if (err) {
            console.error('Erreur lors de la récupération des réservations :', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
        } else {
            res.status(200).json(reservations);
        }
    });
});
// Route pour effectuer une réservation
app.post('/makeReservation', function (req, res) {
    const reservationData = req.body; 
    makeReservation(reservationData, function (err, reservation) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ reservation: reservation }); 
        }
    });
});



// Route pour afficher les réservations de l'utilisateur
app.get('/reservations/:userId', (req, res) => {
    const userId = req.params.userId;
    getUserReservations(userId, (err, reservations) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des réservations de l\'utilisateur.' });
        }
        res.json(reservations);
    });
});


//------------------------------ places Routes -----------------------------------------------






const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
