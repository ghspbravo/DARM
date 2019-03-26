var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();

/* GET list. */
router.post('/', function(req, res, next) {

	var db = pgp('postgres://developer:rtfP@ssw0rd@84.201.147.162:5432/darm')
	
  try {
		console.log(buildQuery(req.body.type, req.body.query)) //log query
    db.any(buildQuery(req.body.type, req.body.query), [req.body.query]).then(movies => {
			console.log(movies) //log result
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
 * @param {String} type - дополнительные опции поиска
 * @param {String} query - поисковый запрос
 */
const buildQuery = (type, query) => {
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
		return parseInt(query)
		? `
		SELECT * 
		FROM movies 
		WHERE year = $1
		LIMIT 100`
		: `
		SELECT * 
		FROM movies 
		WHERE name LIKE '%$1:value%'
		LIMIT 100`

		default:
			break;
	}
}