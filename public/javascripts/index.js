document.addEventListener('DOMContentLoaded', () => {

	document.querySelector('.list-entry') && loadMoviesList()

	document.querySelector('.search-form') && attachEvents()
})

/**
 * Вставляет результаты выборки в разметку
 * 
 * @param movies - список фильмов
 */
const insertListIntoDom = (movies) => {
	let wrapper = document.createElement('table')

	wrapper.classList.add('search-results-table')
	wrapper.innerHTML = `<thead>
		<tr>
			<td>Id</td>
			<td>Title</td>
			<td>Year</td>
		</tr>
	</thead>
	<tbody></tbody>`

	const entryNode = document.querySelector('.list-entry')
	entryNode.innerHTML = ''
	entryNode.appendChild(wrapper)

	const entryRecordsNode = document.querySelector('.list-entry tbody')
	movies.forEach(movie => {
		let recordsRow = document.createElement('tr')
		recordsRow.innerHTML = `
			<td>${movie.id}</td>
			<td>${movie.name}</td>
			<td>${movie.year}</td>`
		
			entryRecordsNode.appendChild(recordsRow)
	})
}

/**
 * Загрузить все фильмы
 */
const loadMoviesList = () => {
	fetch('/list').then(data  => data.json())
		.then(data => insertListIntoDom(data.movies))
		.catch(e => console.error(e))
}

/**
 * Поиск по БД
 * 
 * @param str - строка для поиска
 * 
 * @param type - опции поиска
 */
const dbSearch = (str, type) => {
	console.log('init search')
	fetch('/search', {
		method: 'post',
		body: JSON.stringify({
			query: str,
			type: type
		}),
		headers: {
			"Content-Type": "application/json"
		}
	}).then(data => data.json())
		.then(data => insertListIntoDom(data.movies))
		.catch(e => console.error(e))
}

/**
 * Навешать обработчики на форму
 */
const attachEvents = () => {
	const searchForm = document.querySelector('.search-form')

	searchForm.addEventListener('submit', e => {
		e.preventDefault()

		let formElements = searchForm.elements,
			query = formElements[0].value,
			type = searchForm.querySelectorAll('input[type=radio]')

		if (query.length < 3) return

			type = Object.values(type)
				.filter(option => option.checked)
				.map(option => option.value)[0]

		dbSearch(query, type)
	})
}