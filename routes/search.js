var express = require('express');
var router = express.Router();
var pgp = require('pg-promise')();
var SolrNode = require('solr-node');

/* GET list. */
router.post('/', function (req, res, next) {


	try {
		var db = pgp('postgres://developer:rtfP@ssw0rd@84.201.147.162:5432/darm')

		console.log(buildQuery(req.body.type, req.body.query)) //log query
		db.any(buildQuery(req.body.type, req.body.query), [req.body.query]).then(movies => {
			console.log(movies) //log result
			res.json({ movies: movies });
		});
	}
	catch (e) {
		console.error(e)
	}
	finally {
		pgp.end()
	}
});

router.post('/lucene', function (req, res, next) {

	try {

		var client = new SolrNode({
			host: '127.0.0.1',
			port: '8983',
			core: 'darm',
			protocol: 'http'
		});

		client.search(buildLuceneQuery(req.body.type, req.body.query, client), function (err, result) {
			if (err) {
				console.log(err);
				return;
			}
			console.log('Response:', result.response);

			res.json({ movies: result.response.docs });
		});

	}
	catch (e) {
		console.error(e)
	}
});

module.exports = router;

/**
 * Оформить запрос к Lucene
 * @param {String} type - дополнительные опции поиска
 * @param {String} query - поисковый запрос
 */
const buildLuceneQuery = (type, query, client) => {
	switch (type) {
		case 'searchAnyWordsInTitle':
			return client.query().q(`name:${query}`)

		case 'searchAllWordsInTitle':
			return client.query().q(`name:"${query}"`)

		case 'searchPartTitle':
			return client.query().q(`name:*${query}*`)

		case 'searchYearAndPartTitle':
			return parseInt(query)
			? client.query().q(`year:${query}`)
			: client.query().q(`name:*${query}*`)
	
		default:
			break;
	}
}

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
			LIMIT 10`

		case 'searchAllWordsInTitle':
			return `
			SELECT * 
			FROM movies 
			WHERE name = $1 
			LIMIT 10`

		case 'searchPartTitle':
			return `
		SELECT * 
		FROM movies 
		WHERE name LIKE '%$1:value%'
		LIMIT 10`

		case 'searchYearAndPartTitle':
			return parseInt(query)
				? `
		SELECT * 
		FROM movies 
		WHERE year = $1
		LIMIT 10`
				: `
		SELECT * 
		FROM movies 
		WHERE name LIKE '%$1:value%'
		LIMIT 10`

		default:
			break;
	}
}