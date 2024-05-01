const express = require('express');
const { getAllParkings , getAllUsers ,createUser, authenticateUser ,getParkingDetails, makeReservation, getUserReservations } = require('./queries');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/parkings', (req, res) => {
    getAllParkings((err, parkings) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des parkings.' });
        }
        res.json(parkings);
    });
});

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


// Route pour afficher les détails d'un parking
app.get('/parkings/:id', (req, res) => {
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

// Route pour effectuer une réservation
app.post('/reservations', (req, res) => {
    const reservationData = req.body;
    makeReservation(reservationData, (err, reservationId) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la réservation d\'une place.' });
        }
        res.json({ message: 'Réservation effectuée avec succès.', reservationId });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
