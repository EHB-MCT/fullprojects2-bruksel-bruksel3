let shuffled = []; // Global variable to hold the currently shuffled list of images based on filters
let offset = 0; // Global variables to manage the shuffled image list and the current offset for loading more images
const CARDS_PER_MEER = 12; // Number of images to load each time the "meer" button is clicked
let images = []; // Global variable to hold the full list of images fetched from the JSON file
let searchQuery = ""; // Global variable to hold the current search query for filtering images based on filename parts
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
	// Preload images and create divs for each background image, then start the slideshow interval
	const slides = bgs.map((src) => {
		const div = document.createElement("div");
		div.classList.add("bg-slide");
		div.style.backgroundImage = `url("${src}")`;
		document.body.appendChild(div);
		return div;
	});
	// Show the first slide immediately
	slides[0].classList.add("active");

	setInterval(() => {
		slides[current].classList.remove("active");
		current = (current + 1) % slides.length;
		slides[current].classList.add("active");
	}, 3000);
})();
// Main gallery and filtering logic

fetch("JSON/index.json")
	.then((response) => response.json())
	.then((data) => {
		const datalist = document.getElementById("suggestions");
		const suggestions = new Set();

		data.forEach((item) => {
			const filename = item.src.split("/").pop();
			const clean = filename.replace(/\.[^/.]+$/, ""); // Remove file extension from the filename to get a clean base name
			const parts = clean.split(/[, ]+/); // Split the clean filename into parts using commas and spaces as delimiters
			const filteredParts = parts.slice(1); // Exclude the first part of the filename, which is typically not useful for search suggestions
			// Process each part of the filename (except the first one) to extract potential search suggestions
			filteredParts.forEach((word) => {
				const w = word.trim();
				if (!w) return;
				//if (forbidden.has(w.toLowerCase())) return;
				if (w.length < 2) return;
				if (!isNaN(w)) return;
				// Add the cleaned and validated word to the suggestions set, ensuring uniqueness
				suggestions.add(w);
			});
		});

		suggestions.forEach((word) => {
			const option = document.createElement("option");
			option.value = word;
			datalist.appendChild(option);
		});
	});
// After populating the search suggestions, fetch the main image data and initialize the gallery

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
// List of location IDs corresponding to checkboxes for filtering images by location
function getFilteredImages() {
	const bekendChecked = document.getElementById("bekend").checked;
	const onbekendChecked = document.getElementById("onbekend").checked;

	const selectedLocations = LOCATION_IDS.filter(
		(id) => document.getElementById(id)?.checked,
	);
	// Start with the full image list and apply filters based on bekendheid, selected locations, year range, and search query
	let filtered = images;
	if (bekendChecked) filtered = filtered.filter((img) => img.bekend);
	else if (onbekendChecked) filtered = filtered.filter((img) => !img.bekend);

	if (selectedLocations.length > 0) {
		filtered = filtered.filter((img) => selectedLocations.includes(img.plaats));
	}
	// Filter images based on the specified year range, using 1920 and 2019 as defaults if inputs are empty or invalid
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
	// If a search query is present, further filter images by checking if any part of the filename (after the first part) includes the search query
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
		card.innerHTML = `<img src="${shuffled[i].src}" alt="Beeldenbank foto" style="width:100%;height:100%;object-fit:cover;display:block;cursor:pointer;">`;
		card.querySelector("img").addEventListener("click", () => openModal(shuffled[i].src));
		gallery.appendChild(card);
	}
	offset = count;
} // Resets and renders the first batch of filtered images into the gallery

function openModal(src) {
	const modal = document.getElementById("img-modal");
	const modalImg = document.getElementById("img-modal-img");
	const modalName = document.getElementById("img-modal-name");
	const downloadBtn = document.getElementById("img-modal-download");
	const shareBtn = document.getElementById("img-modal-share");
	const name = src.split("/").pop().replace(/\.[^/.]+$/, "");
	modalImg.src = src;
	modalImg.alt = name;
	modalName.textContent = name;
	downloadBtn.href = src;
	downloadBtn.download = src.split("/").pop();
	shareBtn.onclick = () => {
		if (navigator.share) {
			navigator.share({ title: name, url: window.location.origin + "/" + src });
		} else {
			navigator.clipboard.writeText(window.location.origin + "/" + src).then(() => {
				shareBtn.textContent = "Link gekopieerd!";
				setTimeout(() => {
					shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Delen';
				}, 2000);
			});
		}
	};
	modal.style.display = "flex";
}

function renderFilterPills() {
	const container = document.querySelector(".top-filters");
	if (!container) return;
	container.innerHTML = "";

	// Wijk pill
	const selectedWijken = LOCATION_IDS.filter((id) => {
		const cb = document.getElementById(id);
		return cb && cb.checked;
	});
	if (selectedWijken.length > 0) {
		const pill = document.createElement("div");
		pill.classList.add("filter-pill");
		const extra =
			selectedWijken.length > 1
				? ` <span class="pill-extra"> + ${selectedWijken.length - 1}</span>`
				: "";
		pill.innerHTML = `${selectedWijken[0]}${extra} <i class="fa-solid fa-minus pill-remove"></i>`;
		pill.querySelector(".pill-remove").addEventListener("click", () => {
			selectedWijken.forEach((id) => {
				const cb = document.getElementById(id);
				if (cb) cb.checked = false;
			});
			loadImages();
			renderFilterPills();
		});
		container.appendChild(pill);
	}
	//
	// Datum pill
	const fromVal = document.getElementById("fromYear")?.value;
	const toVal = document.getElementById("toYear")?.value;
	if (fromVal || toVal) {
		const pill = document.createElement("div");
		pill.classList.add("filter-pill");
		const label =
			fromVal && toVal
				? `${fromVal} – ${toVal}`
				: fromVal
					? `vanaf ${fromVal}`
					: `tot ${toVal}`;
		pill.innerHTML = `${label} <i class="fa-solid fa-minus pill-remove"></i>`;
		pill.querySelector(".pill-remove").addEventListener("click", () => {
			const f = document.getElementById("fromYear");
			const t = document.getElementById("toYear");
			if (f) f.value = "";
			if (t) t.value = "";
			loadImages();
			renderFilterPills();
		});
		container.appendChild(pill);
	}

	// Bekend/onbekend pill
	const bekendCb = document.getElementById("bekend");
	const onbekendCb = document.getElementById("onbekend");
	if (bekendCb?.checked || onbekendCb?.checked) {
		const pill = document.createElement("div");
		pill.classList.add("filter-pill");
		const label = bekendCb?.checked ? "Locatie: Ja" : "Locatie: Nee";
		pill.innerHTML = `${label} <i class="fa-solid fa-minus pill-remove"></i>`;
		pill.querySelector(".pill-remove").addEventListener("click", () => {
			if (bekendCb) bekendCb.checked = false;
			if (onbekendCb) onbekendCb.checked = false;
			loadImages();
			renderFilterPills();
		});
		container.appendChild(pill);
	}
}

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
			card.innerHTML = `<img src="${shuffled[offset + i].src}" alt="Beeldenbank foto" style="width:100%;height:100%;object-fit:cover;display:block;cursor:pointer;">`;
			(function(imgData) {
				card.querySelector("img").addEventListener("click", () => openModal(imgData.src));
			})(shuffled[offset + i]);
			gallery.appendChild(card);
		}
		offset += count;
		if (offset >= shuffled.length) meerBtn.style.display = "none";
	});

	const modal = document.getElementById("img-modal");
	const modalClose = document.getElementById("img-modal-close");
	modalClose.addEventListener("click", () => { modal.style.display = "none"; });
	modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
	document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.style.display = "none"; });

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
		renderFilterPills();
	});

	onbekendCb.addEventListener("change", () => {
		if (onbekendCb.checked) clearOtherFilters();
		loadImages();
		renderFilterPills();
	});

	LOCATION_IDS.forEach((id) => {
		const cb = document.getElementById(id);
		if (cb)
			cb.addEventListener("change", () => {
				if (cb.checked) uncheckOnbekend();
				loadImages();
				renderFilterPills();
			});
	});

	const fromInput = document.getElementById("fromYear");
	const toInput = document.getElementById("toYear");
	if (fromInput)
		fromInput.addEventListener("input", () => {
			if (fromInput.value) uncheckOnbekend();
			loadImages();
			renderFilterPills();
		});
	if (toInput)
		toInput.addEventListener("input", () => {
			if (toInput.value) uncheckOnbekend();
			loadImages();
			renderFilterPills();
		});
}); // Sets up the load-more button and checkbox filter interactions on page load
