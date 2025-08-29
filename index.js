const scoreManagement = require("./logic/score_management.js");

// ######    CONFIGURATION DU PROJET    #####

// module express pour gérer les routes
const express = require("express");
const app = express();
// extension pour parser le json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// base de données sqlite
const sqlite3 = require('sqlite3').verbose();

const port = 2025;

// path
const path = require("path");


// ## CONFIG BASE DE DONNEES

// Connexion à une base sqlite (créée si elle n’existe pas)
const db = new sqlite3.Database('./scores.db');
scoreManagement.setDb(db); // donner accès à la db au fichier scoreManagement

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

//  Page d'affichage des scores
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/scores.html'));
});

// css files
app.get('/css/scores.css', (req, res) => {
    res.sendFile(path.join(__dirname,'/static/scores.css'))
})

// Ecouter les requêtes POST sur /sendscores
app.post("/api/send/scores", (req, res) => {
    // on récupère les données de la requête
    const data = req.body;
    res.json({message: "Données reçues", data});
    scoreManagement.addScore(data["pseudo"], data["time"]);
    scoreManagement.echoScores(undefined,12);
    
});


// Envoyer les scores (Les 100 meilleurs MAX)
app.get('/api/get/scores', (req, res) => {
    scoreManagement.getScores((rows) => {
        res.json(rows);
    },100)
});






// Démarrer le serveur
app.listen(port, () => {
    console.log(` Serveur Lancé sur http://localhost:${port}`);
});