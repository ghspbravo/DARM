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
			<td>${movie.name}  <a href="${buildFilmLink(movie.id)}" target="_blank"><i style="font-size: 14px" class="material-icons">open_in_new</i></a></td>
			<td>${movie.year}</td>`
		
			entryRecordsNode.appendChild(recordsRow)
	})
}

/**
 * Загрузить все фильмы и вставить в документ
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
 * Поиск по Документам Lucene
 * 
 * @param {String} str - строка для поиска
 * @param {String} type - опции поиска
 */
const luceneSearch = (str, type) => {
	fetch('/search/lucene', {
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
	Object.values(searchForm.querySelectorAll('input[type=radio], input[type=checkbox]')).forEach(
		option => option.addEventListener('click', () => searchForm.dispatchEvent(
			new Event('submit')
		))
	)

	searchForm.addEventListener('submit', e => {
		e.preventDefault()

		let formElements = searchForm.elements,
			query = formElements[0].value,
			type = searchForm.querySelectorAll('input[type=radio]'),
			useSearchEngine = searchForm.querySelector('input[type=checkbox]').checked

		if (query.length < 3) return

			type = Object.values(type)
				.filter(option => option.checked)
				.map(option => option.value)[0]

		useSearchEngine
		? luceneSearch(query, type)
		: dbSearch(query, type)
	})
}

/**
 * Навешать обработчики на элементы сброса
 */
const attachClearEvents = () => {
	const restoreNodes = document.getElementsByClassName(CLASSNAME_RESTORE_CONTROLS)

	Object.values(restoreNodes).forEach(
		/**@param {Element} node */
		node => node.addEventListener('click', () => clearSearch()))
}

/**
 * Очистка формы поиска и вывод исходного списка элементов
 */
const clearSearch = () => {
	const searchForm = document.getElementsByClassName(CLASSNAME_SEARCH_FORM)[0],
		textInputs = searchForm.querySelectorAll('input[type=text]'),
		radioInputs = searchForm.querySelectorAll('input[type=radio]')
	// clear text inputs
	textInputs.forEach(inputNode => inputNode.value="")
	// check first radio
	radioInputs.forEach(radioInput => radioInput.checked = false)
	radioInputs[0].checked = true
	// Load initial list
	loadMoviesList()
}

/**
 * Преобразовать ID в ссылку на фильм IMDB
 * @param {Integer} id - ID фильма из библиотеки IMDB
 * @returns {String} href to IMDB film
 */
const buildFilmLink = id => {
	let formatId = id.toString();
	while (formatId.length < 7) formatId = "0" + formatId
	
	return `https://www.imdb.com/title/tt${formatId}/`
}