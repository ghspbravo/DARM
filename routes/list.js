var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();

/* GET list. */
router.get('/', function(req, res, next) {

  try {
    var db = pgp('postgres://developer:rtfP@ssw0rd@db.mirvoda.com:5454/darm')

    db.any('SELECT * FROM movies LIMIT 100', [true]).then(movies => {
      res.json({ movies: movies });
    });
  } 
  catch(e) {
    console.error(e)
	}
	finally {
		pgp.end()
	}
});

module.exports = router;
