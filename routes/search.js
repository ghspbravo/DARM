var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();

/* GET list. */
router.post('/', function(req, res, next) {

	var db = pgp('postgres://developer:rtfP@ssw0rd@84.201.147.162:5432/darm')
	
  try {
    // db.any(buildQuery(req.body.query, req.body.type), [true]).then(movies => {
			console.log(buildQuery(req.body.type))
    db.any(buildQuery(req.body.type), [req.body.query]).then(movies => {
			console.log(movies)
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

/**
 * Оформить запрос к БД
 * 
 * @param type - дополнительные опции поиска
 */
const buildQuery = (type) => {
	switch (type) {
		case 'searchAnyWordsInTitle':
			return `
			SELECT * 
			FROM movies 
			WHERE name LIKE '% $1:value %'
			OR  name LIKE '$1:value %'
			OR name LIKE '% $1:value'
			OR name = $1
			LIMIT 100`
			
		case 'searchAllWordsInTitle':
			return `
			SELECT * 
			FROM movies 
			WHERE name = $1 
			LIMIT 100`

		case 'searchPartTitle':
		return `
		SELECT * 
		FROM movies 
		WHERE name LIKE '%$1:value%'
		LIMIT 100`

		case 'searchYearAndPartTitle':
		return `
		SELECT * 
		FROM movies 
		WHERE name LIKE '%$1:value%'
		OR year = $1
		LIMIT 100`

		default:
			break;
	}
}