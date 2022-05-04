// -> Datos predefinidos para el buen funcionamiento de la app
const contenedor = document.getElementById('main');

function addToDatabase(list) {
	for (card of list){
		addObject(card);
	}
}

function showCards(list) {
	const fragment = new DocumentFragment;
	for (card of list){
		// addObject(card);
		let cardR = createCard(card);
		fragment.appendChild(cardR);
	}
	contenedor.appendChild(fragment);
}

// -> Creacion de base de datos
const IDBRequest = indexedDB.open("equipo2DB", 1);
IDBRequest.addEventListener("upgradeneeded", () =>{
	const db = IDBRequest.result;
	db.createObjectStore("tarjetas",{
		autoIncrement: true,
	});
});

// -> Manejo de errores
IDBRequest.addEventListener("success", () =>{
	console.log("la base de datos se abrio correctamente");
	fetch("/cards.json")
	.then(response => response.json())
	.then(data => {
		let valorCookie = document.cookie.replace(/(?:(?:^|.*;\s*)datosCargados\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if (valorCookie == NaN || valorCookie == "") {
			console.log("se creo una cookie");
			document.cookie = `datosCargados=0; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
			valorCookie = document.cookie.replace(/(?:(?:^|.*;\s*)datosCargados\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		}
		showCards(data.list)
		if (data.version == valorCookie){
			valorCookie = parseInt(valorCookie, 10) + 1;
			document.cookie = `datosCargados=${valorCookie}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
			// addToDatabase(data.list);
		} else {
			console.log("nada para agregar");
			readAllObjects();
		}
	});
});

IDBRequest.addEventListener("error", () =>{
	console.log("ocurrio un error al abrir la base de datos");
});

// -> Construccion del CRUD
function addObject(object){
	const IDBdata = getIDBdata("tarjetas", "readwrite")
	IDBdata[1].add(object);
	IDBdata[0].addEventListener("complete", () =>{
		console.log("objeto agregado correctamente");
		contenedor.appendChild(createCard(object));
	});
}

function readObject(id){
	const IDBdata = getIDBdata("tarjetas", "readonly");
	const request = IDBdata[1].get(id).onsuccess = (e) =>{
		console.log(e.target.result);
	}
}

function updateObject(key, object){
	const IDBdata = getIDBdata("tarjetas", "readwrite")
	IDBdata[1].put(object, key);
	IDBdata[0].addEventListener("complete", () =>{
		console.log("objeto modificado correctamente");
	});
}

function deleteObject(key){
	const IDBdata = getIDBdata("tarjetas", "readwrite")
	IDBdata[1].delete(key);
	IDBdata[0].addEventListener("complete", () =>{
		console.log("objeto eliminado correctamente");
	});
}

const getIDBdata = (storage, mode) =>{
	const db = IDBRequest.result;
	const IDBTransaction = db.transaction(storage, mode);
	const objectStore = IDBTransaction.objectStore(storage);
	return [IDBTransaction, objectStore];
}

// -> Sistema para mostrar la informacion en la pagina desde la base de datos
function readAllObjects() {
	const IDBdata = getIDBdata("tarjetas", "readonly")
	const cursor = IDBdata[1].openCursor();
	const fragment = new DocumentFragment;
	cursor.addEventListener("success", () =>{
		if (cursor.result) {
			let card = createCard(cursor.result.value);
			// console.log(card)
			fragment.appendChild(card);
			cursor.result.continue();
		} else {
			// console.log("todos los objetos fueron leidos");
			contenedor.appendChild(fragment);
		}
	});
}

function createCard(dates) {
	const container = document.createElement('DIV');
	container.classList.add("card", "active");
	container.setAttribute("category", dates.tag)
	container.innerHTML = `
		<h2 class="pregunta">${dates.pregunta}</h2>
		<p class="respuesta">${dates.respuesta}</p>
	`
	return container;
}

// -> Filtro poe categorias
function filter(id) {
	const idList = ["todo", "teoria", "funcionalidad", "ventaja", "problema"];
	const arr = Array.prototype.slice.call(contenedor.children);
	for (card of arr) {
		if (id == 0) card.classList.add("active");
		else if (card.getAttribute("category") == idList[id]) card.classList.add("active");
		else card.classList.remove("active");
	}
}