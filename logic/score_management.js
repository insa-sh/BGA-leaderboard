// fichier qui décrit la gestion des scores


// Ajouter un score
export function addScore(pseudo, score) {
    db.run(`INSERT into scores (pseudo, score) VALUES (?, ?)`, [pseudo, score],
        function (err) {
            if (err) {
                console.log("\x1b[31mERREUR lors de l'enregistrement du score: ", err.message, "\x1b[0m");
            } else {
                console.log(`\x1b[32mSUCCES - Nouveau score enregistré pour ${pseudo} !\x1b[0m`);
            }

        });
}


// Lire les meilleurs scores
export function getScores(callback = undefined, top = 10) {
        if (!is_int(top)){
            top = 10;
        }
        db.all(`SELECT pseudo, score, date FROM scores ORDER BY score ASC LIMIT ${top}`, [], (err, rows) => {
            if (err) throw err;
            callback(rows);
        });
    }


// afficher les scores dans la console du serveur
export function echoScores(rows = undefined, top = 10) {
    if (rows== undefined) {
        getScores(echoScores,top)
        console.log(`Top ${top}:`)
    } else {
        console.log(rows);

    }
}


// vérifier entier ou pas
function is_int(value){
  if((parseFloat(value) == parseInt(value)) && !isNaN(value)){ 
      console.log(`${value} est un integer`);
      return true;
  } else {
      console.log(`${value} n\'est pas un integer`);
      return false;
  }
}

let db;

export function setDb(database) {
    db = database;
}