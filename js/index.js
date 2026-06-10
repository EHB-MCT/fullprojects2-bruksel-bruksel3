let images = [];

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

function getFilteredImages() {
	const bekendChecked = document.getElementById("bekend").checked;
	const onbekendChecked = document.getElementById("onbekend").checked;
	if (bekendChecked) return images.filter((img) => img.bekend);
	if (onbekendChecked) return images.filter((img) => !img.bekend);
	return images;
} // Returns the filtered image list based on the active checkbox

let shuffled = [];
let offset = 0;
const CARDS_PER_PAGE = 12;

function loadImages() {
	const filtered = getFilteredImages();
	shuffled = shuffle(filtered);
	offset = 0;
	const gallery = document.querySelector(".gallery");
	gallery.innerHTML = "";
	const count = Math.min(CARDS_PER_PAGE, shuffled.length);
	for (let i = 0; i < count; i++) {
		const card = document.createElement("div");
		card.classList.add("card");
		card.innerHTML = `<img src="${shuffled[i].src}" alt="Beeldenbank foto" style="width:100%;height:100%;object-fit:cover;display:block;">`;
		gallery.appendChild(card);
	}
	offset = count;
} // Resets and renders the first batch of filtered images into the gallery

document.addEventListener("DOMContentLoaded", () => {
	const gallery = document.querySelector(".gallery");
	const meerBtn = document.createElement("button");
	meerBtn.textContent = "meer";
	meerBtn.classList.add("meer-btn");
	gallery.insertAdjacentElement("afterend", meerBtn);

	meerBtn.addEventListener("click", () => {
		if (offset >= shuffled.length) return;
		const gallery = document.querySelector(".gallery");
		const count = Math.min(CARDS_PER_PAGE, shuffled.length - offset);
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

	bekendCb.addEventListener("change", () => {
		if (bekendCb.checked) onbekendCb.checked = false;
		loadImages();
	});

	onbekendCb.addEventListener("change", () => {
		if (onbekendCb.checked) bekendCb.checked = false;
		loadImages();
	});
}); // Sets up the load-more button and checkbox filter interactions on page load
