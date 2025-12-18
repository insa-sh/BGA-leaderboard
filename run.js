const scoreManagement = require("./logic/score_management.js");

// ######    CONFIGURATION DU PROJET    #####

// module express pour gérer les routes
const express = require("express");
const app = express();
// extension pour parser le json
// base de données sqlite
const sqlite3 = require('sqlite3').verbose();
// pour lire les fichiers .env
require('dotenv').config();
// gestionaire de fichiers
const fs = require('fs');



const port = 2025;

// path
const path = require("path");
const { EMPTY } = require("sqlite3");
const { isSet } = require("util/types");

app.use(express.json());
app.use(express.static(path.join(__dirname,'/static')))
app.use(express.urlencoded({ extended: true }));
// autentification
// 0 : rien (pas safe)
// 1 : avec code (pas safe non plus -> à utiliser pour une simple démo où le jeu n'est pas téléchargé sur des machines externes)
// 2 : à définir (système de comptes ?)
const auth_system = process.env.AUTH_SYSTEM || 0;

let secretToken;
if (auth_system == 1) {
    secretToken = process.env.SECRET_TOKEN;
}



// ## CONFIG BASE DE DONNEES

// Connexion à une base sqlite (créée si elle n’existe pas)
const db = new sqlite3.Database('./scores.db');
scoreManagement.setDb(db); // donner accès à la db au fichier scoreManagement
scoreManagement.setAuthConfig({ auth_system, secretToken });

// Création d'une table si elle n'existe pas
db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudo TEXT,
    score INTEGER,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);



// #####  ROUTES ET REQUETES  #####

// req et res correspondent à la requête et la réponse HTTP

// Page du jeu
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/index.html'));
});

//  Page d'affichage des scores
app.get('/scoreboard', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/scoreboard/scores.html'));
});

// css files
app.get('/css/scores.css', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/scoreboard/scores.css'))
})

// Polices d'écriture : tous les fichiers du dossier font sont publics
app.get('/fonts/:file', (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, 'static/fonts', fileName)
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Fichier non trouvé');
    }
})


// images
app.get('/images/:file', (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, 'static/img', fileName)
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Image non trouvée');
    }
})


// Ecouter les requêtes POST sur /sendscores
app.post("/api/send/scores", (req, res) => {
    // on récupère les données de la requête
    const data = req.body;
    res.json({ message: "Données reçues", data });

    var token = undefined;
    if (data["token"]) { token = data["token"]; }
    scoreManagement.addScore(data["pseudo"], data["time"], token);
    scoreManagement.echoScores(undefined, 12);

});


// Envoyer les scores (Les 100 meilleurs MAX)
app.get('/api/get/scores', (req, res) => {
    scoreManagement.getScores((rows) => {
        res.json(rows);
    }, 100)
});






// Démarrer le serveur
app.listen(port, () => {
    console.log(` Serveur Lancé sur http://localhost:${port}`);
});