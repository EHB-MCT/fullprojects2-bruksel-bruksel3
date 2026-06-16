// Background slideshow
(function () {
	const bgs = [
		"assets/achtergrond1.jpg",
		"assets/achtergrond2.jpg",
		"assets/achtergrond3.jpg",
		"assets/achtergrond4.jpg",
		"assets/achtergrond5.jpg",
	];
	let current = 0;

	const slides = bgs.map((src) => {
		const div = document.createElement("div");
		div.classList.add("bg-slide");
		div.style.backgroundImage = `url("${src}")`;
		document.body.appendChild(div);
		return div;
	});

	slides[0].classList.add("active");

	setInterval(() => {
		slides[current].classList.remove("active");
		current = (current + 1) % slides.length;
		slides[current].classList.add("active");
	}, 3000);
})();

let images = [];
let searchQuery = "";

fetch("JSON/index.json")
	.then((response) => response.json())
	.then((data) => {
		const datalist = document.getElementById("suggestions");
		const suggestions = new Set();

		data.forEach((item) => {
			const filename = item.src.split("/").pop();
			const clean = filename.replace(/\.[^/.]+$/, "");
			const parts = clean.split(/[, ]+/);
			const filteredParts = parts.slice(1);

			filteredParts.forEach((word) => {
				const w = word.trim();
				if (!w) return;
				//if (forbidden.has(w.toLowerCase())) return;
				if (w.length < 2) return;
				if (!isNaN(w)) return;

				suggestions.add(w);
			});
		});

		suggestions.forEach((word) => {
			const option = document.createElement("option");
			option.value = word;
			datalist.appendChild(option);
		});
	});

fetch("JSON/index.json")
	.then((res) => res.json())
	.then((data) => {
		images = data;
		loadImages();
	});

function shuffle(arr) {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
} // Randomly reorders an array using the Fisher-Yates algorithm

const LOCATION_IDS = [
	"Anderlecht",
	"Brussel",
	"Elsene",
	"Etterbeek",
	"Evere",
	"Ganshoren",
	"Jette",
	"Schaarbeek",
	"Ukkel",
	"Vorst",
	"Sint-Agatha-Berchem",
	"Sint-Gillis",
	"Sint-Jans-Molenbeek",
	"Sint-Pieters-Woluwe",
	"Sint-Lambrechts-Woluwe",
	"Sint-Joost-ten-Node",
	"Watermaal-Bosvoorde",
	"Oudergem",
	"Koekelberg",
];

function getFilteredImages() {
	const bekendChecked = document.getElementById("bekend").checked;
	const onbekendChecked = document.getElementById("onbekend").checked;

	const selectedLocations = LOCATION_IDS.filter(
		(id) => document.getElementById(id)?.checked,
	);

	let filtered = images;
	if (bekendChecked) filtered = filtered.filter((img) => img.bekend);
	else if (onbekendChecked) filtered = filtered.filter((img) => !img.bekend);

	if (selectedLocations.length > 0) {
		filtered = filtered.filter((img) => selectedLocations.includes(img.plaats));
	}

	const fromYear = parseInt(document.getElementById("fromYear").value);
	const toYear = parseInt(document.getElementById("toYear").value);

	if (!isNaN(fromYear) || !isNaN(toYear)) {
		filtered = filtered.filter((img) => {
			if (!img.datum) return false;
			const from = isNaN(fromYear) ? 1920 : fromYear;
			const to = isNaN(toYear) ? 2019 : toYear;
			return img.datum >= from && img.datum <= to;
		});
	}

	if (searchQuery) {
		filtered = filtered.filter((img) => {
			const filename = img.src.split("/").pop().toLowerCase();
			const clean = filename.replace(/\.[^/.]+$/, "");

			const parts = clean.split(/[, ]+/).slice(1);

			return parts.some((word) => word.toLowerCase().includes(searchQuery));
		});
	}

	return filtered;
} // Returns the filtered image list based on bekendheid, selected locations, and year range

let shuffled = [];
let offset = 0;
const CARDS_PER_MEER = 12;

function loadImages() {
	const filtered = getFilteredImages();
	shuffled = shuffle(filtered);
	offset = 0;
	const gallery = document.querySelector(".gallery");
	gallery.innerHTML = "";
	const count = Math.min(CARDS_PER_MEER, shuffled.length);
	for (let i = 0; i < count; i++) {
		const card = document.createElement("div");
		card.classList.add("card");
		card.innerHTML = `<img src="${shuffled[i].src}" alt="Beeldenbank foto" style="width:100%;height:100%;object-fit:cover;display:block;">`;
		gallery.appendChild(card);
	}
	offset = count;
} // Resets and renders the first batch of filtered images into the gallery

document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.getElementById("searchInput");
	searchInput.addEventListener("input", (e) => {
		searchQuery = e.target.value.toLowerCase().trim();
		loadImages();
	});
	const gallery = document.querySelector(".gallery");
	const meerBtn = document.createElement("button");
	meerBtn.textContent = "meer";
	meerBtn.classList.add("meer-btn");
	gallery.insertAdjacentElement("afterend", meerBtn);

	meerBtn.addEventListener("click", () => {
		if (offset >= shuffled.length) return;
		const gallery = document.querySelector(".gallery");
		const count = Math.min(CARDS_PER_MEER, shuffled.length - offset);
		for (let i = 0; i < count; i++) {
			const card = document.createElement("div");
			card.classList.add("card");
			card.innerHTML = `<img src="${shuffled[offset + i].src}" alt="Beeldenbank foto" style="width:100%;height:100%;object-fit:cover;display:block;">`;
			gallery.appendChild(card);
		}
		offset += count;
		if (offset >= shuffled.length) meerBtn.style.display = "none";
	});

	const bekendCb = document.getElementById("bekend");
	const onbekendCb = document.getElementById("onbekend");

	function clearOtherFilters() {
		bekendCb.checked = false;
		LOCATION_IDS.forEach((id) => {
			const cb = document.getElementById(id);
			if (cb) cb.checked = false;
		});
		const fromInput = document.getElementById("fromYear");
		const toInput = document.getElementById("toYear");
		if (fromInput) fromInput.value = "";
		if (toInput) toInput.value = "";
	}

	function uncheckOnbekend() {
		onbekendCb.checked = false;
	}

	bekendCb.addEventListener("change", () => {
		if (bekendCb.checked) uncheckOnbekend();
		loadImages();
	});

	onbekendCb.addEventListener("change", () => {
		if (onbekendCb.checked) clearOtherFilters();
		loadImages();
	});

	LOCATION_IDS.forEach((id) => {
		const cb = document.getElementById(id);
		if (cb)
			cb.addEventListener("change", () => {
				if (cb.checked) uncheckOnbekend();
				loadImages();
			});
	});

	const fromInput = document.getElementById("fromYear");
	const toInput = document.getElementById("toYear");
	if (fromInput)
		fromInput.addEventListener("input", () => {
			if (fromInput.value) uncheckOnbekend();
			loadImages();
		});
	if (toInput)
		toInput.addEventListener("input", () => {
			if (toInput.value) uncheckOnbekend();
			loadImages();
		});
}); // Sets up the load-more button and checkbox filter interactions on page load
