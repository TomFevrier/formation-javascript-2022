/**
 * Pour initialiser un projet NodeJS :
 * npm init
 * Une fois tous les champs remplis, un fichier package.json est créé
 * 
 * Pour installer des paquets :
 * npm i nom-du-paquet1 nom-du-paquet2
 * 
 * Les paquets installés apparaissent dans le fichier package.json, ce qui permet à un·e autre
 * développeur·se de simplement exécuter "npm install" pour installer toutes les dépendances
 * nécessaires à ton projet, sans avoir besoin du dossier node_modules/ qui peut être très lourd.
 * 
 * 
 * NodeJS, c'est un peu le bordel. Deux standards d'import/export coexistent en JavaScript :
 * - CommonJS :	const fs = require('fs');	(très répandu)
 * - ESM :		import fs from 'fs';		(assez récent)
 * 
 * Avantages du standard ESM :
 * - c'est la même syntaxe que sur le web
 * - NodeJS va passer à 100 % ESM très bientôt, donc autant prendre de bonnes habitudes
 * 
 * Pour exécuter du code CommonJS en mode ESM, pendant la période de transition :
 * node -r esm .
 */

// fs (filesystem) : installé par défaut dans NodeJs, permet de lire/écrire des fichiers
import fs from 'fs';

// node-fetch : permet d'exécuter des requêtes HTTP, notamment pour lire des fichiers distants
// => comportement identique à la fonction fetch() qui est le standard sur le web
import fetch from 'node-fetch';


// fetch renvoie une PROMESSE = le résultat asynchrone d'un tâche qui peut prendre du temps à s'exécuter
const promise = fetch('https://media.lesechos.fr/infographie/embed-tracker-parrainages/data-2022.json');
console.log(promise); // Promise { <pending> }

/** Comment manipuler les promesses ? **/

/* Option 1 : then */
// .then() prend comme paramètre une fonction, qui reçoit le résultat de la promesse une fois résolue
fetch('https://media.lesechos.fr/infographie/embed-tracker-parrainages/data-2022.json')
	.then((response) => response.json())
	// response est la réponse de la requête : code 200 = elle a abouti, sinon erreur (403, 404, etc.)
	// On convertit la réponse en JSON avec .json(), qui renvoie elle-même une promesse
	.then((data) => {
		// data est le résultat de la promesse renvoyée par response.json() : notre tableau de données
		console.log(data.length);
		// Le reste de notre code...
	});

/* Option 2 : async/await */
// await permet d'attendre que la promesse soit résolue pour récupérer son résultat
(async () => {
	const response = await fetch('https://media.lesechos.fr/infographie/embed-tracker-parrainages/data-2022.json');
	const data = await response.json();
	console.log(data.length);
	// Le reste de notre code...
})();
// await ne peut fonctionner qu'au sein d'une fonction asynchrone (async), c'est pourquoi
// on entoure le code d'une fonction async anonyme invoquée immédiatement

/* Option 3 : mêler les deux ! */
(async () => {
	const data2022 = await fetch('https://media.lesechos.fr/infographie/embed-tracker-parrainages/data-2022.json')
		.then((r) => r.json());
	console.log(data2022.length);


	/* Quel pourcentage des parrainages sont des hommes ? */
	console.log(data2022.filter((d) => d.civility === 'M.').length / data2022.length * 100);
	// filter() prend en paramètre une fonction qui s'applique à chaque élément d du tableau data2022,
	// et ne renvoie que les éléments qui vérifient la condition donnée


	/* Combien de parrainages proviennent de maires (y compris délégué·e·s, d'arrondissement, etc.) ? */
	console.log(data2022.filter((d) => d.mandate.includes('Maire')).length);
	// includes() indique si la chaîne contient un certain texte


	/* Combien de femmes maires ont parrainé Zemmour ? */
	console.log(data2022.filter((d) => d.candidate === 'zemmour' && d.mandate.includes('Maire') && d.civility === 'Mme').length);


	/* Quel·le·s candidat·e·s ont reçu des parrainages ? */
	console.log([...new Set(data2022.map((d) => d.candidate))]);
	// .map() renvoie un nouveau tableau avec les noms des candidat·e·s
	// new Set() permet de construire un Set avec les noms uniques
	// [...] (opérateur de décomposition) permet de convertir le Set en tableau
	// => Technique très utile pour obtenir les éléments uniques dans un tableau avec des doublons !


	/** Le cas reduce() **/
	// reduce() est galère à comprendre mais SUPER utile et performant, pour...
	
	/* ...faire la somme d'un tableau de nombres */
	const array = [2, 3, 8, 6, 1, 7, 4, 5];
	console.log(array.reduce((acc, d) => acc + d, 0));
	// 0 est la valeur initiale de l'accumulateur (acc)
	// puis à chaque étape, on ajoute d à l'accumulateur
	// Résultat : on obtient la somme des éléments du tableau

	/* ...créer un nouveau tableau */
	console.log(array.reduce((acc, d) => [...acc, d * 2], []));
	// Ici, la valeur initial d'acc est un tableau vide
	// puis à chaque étape, on ajoute d * 2 au tableau
	// Équivalent à array.map((d) => d * 2)

	console.log(array.reduce((acc, d) => {
		if (d >= 4) {
			return [...acc, d];
		}
		return acc;
	}, []));
	// Ici, à chaque étape on n'ajoute d au tableau que si d >= 4
	// Équivalent à array.filter((d) => d >= 4)

	/* ...exécuter des promesses l'une après l'autre */
	// Admettons qu'on souhaite scraper le texte d'une série de pages web...
	const URLS = [
		'https://example.com',
		'https://tomfevrier.io',
		'https://lesechos.fr'
	];

	// (fonction qui permet d'attendre un certain temps, ne t'en soucie pas trop)
	const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time))

	const webpagesSimultaneous = await Promise.all(URLS.map(async (url) => {
		console.log('Scraping', url);
		const html = await fetch(url).then((r) => r.text());
		await sleep(2000);
		return html;
	}));
	console.log(webpagesSimultaneous);
	// Promise.all() permet de renvoyer le résultat d'un tableau de promesses
	// Problème : les 3 pages sont scrapées en même temps !

	const webpagesSequential = await URLS.reduce(async (promise, url) => {
		const pages = await promise;
		console.log('Scraping', url);
		const html = await fetch(url).then((r) => r.text());
		await sleep(2000);
		return [...pages, html];
	}, Promise.resolve([]));
	console.log(webpagesSequential);
	// Comment ça marche ?
	// - on initialise l'accumulateur avec une promesse qui renvoie un tableau vide
	// - à chaque étape, on await cette promesse pour récupérer les pages déjà scrapées
	// - après les 2 secondes de pause, on renvoie un tableau avec la nouvelle page
	// - à la fin, on a une unique promesse qui se résout avec un tableau contenant les 3 pages
	// MIND BLOWN 🤯
	
	
	/** Comment savoir qui les élu·e·s qui ont parrainé Zemmour en 2022 avaient parrainé en 2017 ? **/

	/* Comment lire un fichier JSON local avec NodeJS */
	const data2017 = JSON.parse(fs.readFileSync('data-2017.json').toString());
	// fs.readFileSync() lit le fichier de manière synchrone mais renvoie un buffer illisible
	// On le convertit en chaîne de caractère avec .toString()
	// On le convertit en JSON avec JSON.parse()

	// À noter que sur le web, on utilisera fetch() peu importe si le fichier est local ou distant

	// BOUM 💥
	console.log(
		data2022.filter((d) => d.candidate === 'zemmour').reduce((acc, d) => {
			const sponsor2017 = data2017.find((e) => e.name === d.name && e.constituency === d.constituency);
			if (sponsor2017) {
				const candidate2017 = sponsor2017.candidate;
				acc[candidate2017] = (acc[candidate2017] || 0) + 1;
			}
			return acc;
		}, {})
	);

	/**
	 * Décomposons un peu...
	 * - on filtre les parrainages de 2022 pour n'avoir que ceux de Zemmour
	 * - on initialise l'accumulateur comme un objet vide {}
	 * - à chaque étape, si le ou la même élu·e avait parrainé quelqu'un (même nom et même circonscription)...
	 * - ... on récupère le ou la candidat·e qu'iel avait parrainé·e...
	 * - ... et on incrémente le compteur à la bonne clé dans notre objet/dictionnaire
	 * - enfin, on retourne l'accumulateur pour l'étape suivante
	 * 
	 * Précision :
	 * À la place de acc[candidate2017] = (acc[candidate2017] || 0) + 1, on aurait pu écrire :
	 * if (acc[candidate2017]) {
	 * 		// Candidat·e déjà rencontré·e, on incrémente
	 * 		acc[candidate2017]++;
	 * }
	 * else {
	 * 		// Candidat·e jamais rencontré·e, on initialise à 1
	 * 		acc[candidate2017] = 1;
	 * }
	 * Parfois, on peut préférer la clarté à la concision, c'est à toi de juger !
	 */
})();