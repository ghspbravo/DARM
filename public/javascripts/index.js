document.addEventListener('DOMContentLoaded', () => {

	document.getElementsByClassName(CLASSNAME_LIST_ENTRY) && loadMoviesList()

	document.getElementsByClassName(CLASSNAME_SEARCH_FORM) && attachSearchEvents()

	document.getElementsByClassName(CLASSNAME_RESTORE_CONTROLS) && attachClearEvents()
})

/**@const {String} Название класса для входной точки элементов таблицы */
const CLASSNAME_LIST_ENTRY = "list-entry"
/**@const {String} Название класса для формы поиска */
const CLASSNAME_SEARCH_FORM = "search-form"
/**@const {String} Название класса для обработчиков сброса */
const CLASSNAME_RESTORE_CONTROLS = "js-restore-table"

/**
 * Вставляет результаты выборки в разметку
 * 
 * @param {object} movies - список фильмов
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

	const entryNode = document.getElementsByClassName(CLASSNAME_LIST_ENTRY)[0]
	entryNode.innerHTML = ''
	entryNode.appendChild(wrapper)

	const entryRecordsNode = document.getElementsByClassName(CLASSNAME_LIST_ENTRY)[0].querySelector('tbody')
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
 * @param {String} str - строка для поиска
 * @param {String} type - опции поиска
 */
const dbSearch = (str, type) => {
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
const attachSearchEvents = () => {
	const searchForm = document.getElementsByClassName(CLASSNAME_SEARCH_FORM)[0]

	// Элементы фильтра также запускают поиск
	Object.values(searchForm.querySelectorAll('input[type=radio]')).forEach(
		option => option.addEventListener('click', () => searchForm.dispatchEvent(
			new Event('submit')
		))
	)

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

/**
 * Навешать обработчики на элементы сброса
 */
const attachClearEvents = () => {
	const restoreNodes = document.getElementsByClassName(CLASSNAME_RESTORE_CONTROLS)

	Object.values(restoreNodes).forEach(
		/**@param {Element} node */
		node => node.addEventListener('click', () => loadMoviesList()))
}