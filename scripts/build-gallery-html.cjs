const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const pictures = require(path.join(root, "src/html/json/pictures.json")).pictures;
const { order, rows } = require(path.join(root, "scripts/gallery-order.json"));
const byId = Object.fromEntries(pictures.map((p) => [p.id, p]));

function techniqueLabel(technique) {
	const parts = technique.split(",").map((s) => s.trim());
	const last = parts[parts.length - 1] || technique;
	return last.charAt(0).toUpperCase() + last.slice(1);
}

function genreLabel(genre) {
	return genre.charAt(0).toUpperCase() + genre.slice(1);
}

function imgSrc(src) {
	return src.replace(/^img\//, "@img/");
}

function renderItem(p, index) {
	const lazy =
		index === 0
			? `fetchpriority="high"`
			: `loading="lazy"`;
	const avail = p.available
		? `<span class="gallery-item__avail">Можно приобрести</span>`
		: `<span class="gallery-item__avail gallery-item__avail--sold">В коллекции</span>`;
	const caption = `${p.title} — ${p.genre}, ${p.technique}, ${p.size}`;
	const techLabel = techniqueLabel(p.technique);

	return `\t\t\t<a
\t\t\t\tclass="gallery-item"
\t\t\t\thref="${imgSrc(p.image.src)}"
\t\t\t\tdata-fancybox="gallery"
\t\t\t\tdata-caption="${escapeAttr(caption)}"
\t\t\t\tdata-genre="${p.genreId}"
\t\t\t\tdata-technique="${escapeAttr(p.technique)}">
\t\t\t\t<img
\t\t\t\t\tclass="gallery-item__img"
\t\t\t\t\tsrc="${imgSrc(p.image.src)}"
\t\t\t\t\talt="${escapeAttr(p.image.alt)}"
\t\t\t\t\twidth="875"
\t\t\t\t\theight="585"
\t\t\t\t\t${lazy}>
\t\t\t\t<span class="gallery-item__caption">
\t\t\t\t\t<span class="gallery-item__top">
\t\t\t\t\t\t<span class="gallery-item__name">${escapeHtml(p.title)}</span>
\t\t\t\t\t\t<span class="gallery-item__size">${escapeHtml(p.size)}</span>
\t\t\t\t\t</span>
\t\t\t\t\t<span class="gallery-item__meta">
\t\t\t\t\t\t<span>${escapeHtml(genreLabel(p.genre))}</span>
\t\t\t\t\t\t<span class="gallery-item__sep" aria-hidden="true"></span>
\t\t\t\t\t\t<span>${escapeHtml(techLabel)}</span>
\t\t\t\t\t\t${avail}
\t\t\t\t\t</span>
\t\t\t\t</span>
\t\t\t</a>`;
}

function escapeAttr(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;");
}

function escapeHtml(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

const typeCount = { duo: 2, trio: 3, asymmetric: 3, quad: 4, stack: 3 };
let cursor = 0;
const rowHtml = [];

rows.forEach((type, rowIndex) => {
	const count = typeCount[type];
	const ids = order.slice(cursor, cursor + count);
	cursor += count;
	const items = ids
		.map((id, i) => renderItem(byId[id], rowIndex === 0 && i === 0 ? 0 : 1))
		.join("\n");

	if (type === "stack") {
		const [left, top, bottom] = ids;
		rowHtml.push(`\t\t<div class="gallery__row gallery__row--stack">
\t\t\t<div class="gallery__stack-main">
${renderItem(byId[left], 1)}
\t\t\t</div>
\t\t\t<div class="gallery__stack-side">
${renderItem(byId[top], 1)}
${renderItem(byId[bottom], 1)}
\t\t\t</div>
\t\t</div>`);
	} else {
		rowHtml.push(`\t\t<div class="gallery__row gallery__row--${type}">
${items}
\t\t</div>`);
	}
});

const html = `<section class="gallery" data-gallery>
\t<div class="container gallery__inner">
${rowHtml.join("\n\n")}
\t</div>
</section>
`;

fs.writeFileSync(path.join(root, "src/html/sections/gallery-grid.html"), html);
console.log("wrote gallery-grid.html", order.length, "items", rows.length, "rows");

// techniques for hero selects
const techniques = [...new Set(pictures.map((p) => p.technique))];
fs.writeFileSync(
	path.join(root, "src/html/json/gallery-techniques.json"),
	JSON.stringify(techniques, null, 2)
);
console.log("techniques", techniques.length);
