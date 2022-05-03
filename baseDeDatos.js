const contenedor = document.getElementById('main');

const IDBRequest = indexedDB.open("equipo2DB", 1);

IDBRequest.addEventListener("upgradeneeded", ()=>{
	const db = IDBRequest.result;
	db.createObjectStore("tarjetas",{
		autoIncrement: true,
	})
});

IDBRequest.addEventListener("success", ()=>{
	console.log("la base de datos se abrio correctamente");
	readAllObjects();
});

IDBRequest.addEventListener("error", ()=>{
	console.log("ocurrio un error al abrir la base de datos");
});

function addObject(object){
	const IDBdata = getIDBdata("tarjetas", "readwrite")
	IDBdata[1].add(object);
	IDBdata[0].addEventListener("complete", ()=>{
		console.log("objeto agregado correctamente");
		contenedor.appendChild(createCard(object));
	});
}

// PONER EN CONSOLA
// addObject({pregunta: "", respuesta: ""});

function readObject(id){
	const IDBdata = getIDBdata("tarjetas", "readonly");
	const request = IDBdata[1].get(id).onsuccess = (e) =>{
		console.log(e.target.result);
	}
}

function updateObject(key, object){
	const IDBdata = getIDBdata("tarjetas", "readwrite")
	IDBdata[1].put(object, key);
	IDBdata[0].addEventListener("complete", ()=>{
		console.log("objeto modificado correctamente");
	});
}

// PONER EN CONSOLA
// updateObject(2, {nombre: "antonio", genero: "masculino", edad: 29});

function deleteObject(key){
	const IDBdata = getIDBdata("tarjetas", "readwrite")
	IDBdata[1].delete(key);
	IDBdata[0].addEventListener("complete", ()=>{
		console.log("objeto eliminado correctamente");
	});
}

const getIDBdata = (storage, mode) =>{
	const db = IDBRequest.result;
	const IDBTransaction = db.transaction(storage, mode);
	const objectStore = IDBTransaction.objectStore(storage);
	return [IDBTransaction, objectStore];
}
function readAllObjects(){
	const IDBdata = getIDBdata("tarjetas", "readonly")
	const cursor = IDBdata[1].openCursor();
	const fragment = new DocumentFragment;
	cursor.addEventListener("success", ()=>{
		if (cursor.result) {
			let card = createCard(cursor.result.value)
			// console.log(card)
			fragment.appendChild(card);
			cursor.result.continue();
		} else {
			// console.log("todos los objetos fueron leidos");
			contenedor.appendChild(fragment)
		}
	});
}

function createCard(dates){
	const container = document.createElement('DIV');
	container.classList.add("card", "active");
	container.setAttribute("id", dates.tag)
	container.innerHTML = `
		<h2 class="pregunta">${dates.pregunta}</h2>
		<p class="respuesta">${dates.respuesta}</p>
	`;
	return container;
}


function filter(id){
	const idList = ["todo", "teoria", "funciones", "ventajas", "desventajas"];
	const arr = Array.prototype.slice.call(contenedor.children);
	for (card of arr){
		if (id == 0){
			card.classList.add("active");
		}
		else if (card.getAttribute("id") == idList[id]){
			card.classList.add("active");
		} else {
			card.classList.remove("active");
		}
	}
}