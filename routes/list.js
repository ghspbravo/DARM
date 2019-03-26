var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();

/* GET list. */
router.get('/', function(req, res, next) {

  var db = pgp('postgres://developer:rtfP@ssw0rd@84.201.147.162:5432/darm')

  try {
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
