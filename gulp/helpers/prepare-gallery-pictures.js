import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const loopFile = join(root, "src/html/json/gallery-pictures.json");
const worksLoopFile = join(root, "src/html/json/works-pictures.json");

const typeCount = { duo: 2, trio: 3, asymmetric: 3, quad: 4, stack: 3 };

function techniqueLabel(technique) {
	const parts = String(technique)
		.split(",")
		.map((part) => part.trim());
	const last = parts[parts.length - 1] || technique;
	return last.charAt(0).toUpperCase() + last.slice(1);
}

function genreLabel(genre) {
	return String(genre).charAt(0).toUpperCase() + String(genre).slice(1);
}

function imgSrc(src) {
	return String(src).replace(/^img\//, "@img/");
}

function ratioClass(type, index) {
	if (type === "trio") return "gallery-item--portrait";
	if (type === "quad") return "gallery-item--quad";
	if (type === "asymmetric") return index === 1 ? "gallery-item--wide" : "gallery-item--narrow";
	if (type === "stack") return index === 0 ? "gallery-item--tall" : "gallery-item--banner";
	return "";
}

function cellSpan(type, index) {
	if (type === "trio") return { col: 4, row: 1 };
	if (type === "quad") return { col: 3, row: 1 };
	if (type === "asymmetric") {
		return index === 1 ? { col: 6, row: 1 } : { col: 3, row: 1 };
	}
	if (type === "stack") {
		return index === 0 ? { col: 6, row: 2 } : { col: 6, row: 1 };
	}
	return { col: 6, row: 1 };
}

function toLoopItem(picture, { ratio, priority, col, row }) {
	return {
		src: imgSrc(picture.image.src),
		alt: picture.image.alt,
		caption: `${picture.title} — ${picture.genre}, ${picture.technique}, ${picture.size}`,
		genre: picture.genreId,
		technique: picture.technique,
		name: picture.title,
		size: picture.size,
		genreLabel: genreLabel(picture.genre),
		techniqueLabel: techniqueLabel(picture.technique),
		available: picture.available,
		priority,
		ratio,
		col,
		row,
	};
}

export function prepareGalleryPictures() {
	const catalog = JSON.parse(readFileSync(join(root, "src/html/json/pictures.json"), "utf8"));
	const { order, rows } = JSON.parse(readFileSync(join(root, "scripts/gallery-order.json"), "utf8"));
	const byId = Object.fromEntries(catalog.pictures.map((picture) => [picture.id, picture]));

	const items = [];
	let cursor = 0;

	rows.forEach((type) => {
		const count = typeCount[type];
		if (!count) {
			throw new Error("Unknown gallery row type: " + type);
		}

		const ids = order.slice(cursor, cursor + count);
		cursor += count;

		ids.forEach((id, index) => {
			const picture = byId[id];
			if (!picture) {
				throw new Error("Missing picture " + id);
			}

			const { col, row } = cellSpan(type, index);
			items.push(
				toLoopItem(picture, {
					ratio: ratioClass(type, index),
					priority: items.length === 0,
					col,
					row,
				}),
			);
		});
	});

	if (cursor !== order.length) {
		throw new Error("Unused gallery order items: " + (order.length - cursor));
	}

	mkdirSync(dirname(loopFile), { recursive: true });
	writeFileSync(loopFile, `${JSON.stringify(items, null, "\t")}\n`);

	return loopFile;
}

const worksOrder = [
	"work-034",
	"work-053",
	"work-078",
	"work-070",
	"work-008",
	"work-014",
	"work-025",
	"work-030",
	"work-009",
];

export function prepareWorksPictures() {
	const catalog = JSON.parse(readFileSync(join(root, "src/html/json/pictures.json"), "utf8"));
	const byId = Object.fromEntries(catalog.pictures.map((picture) => [picture.id, picture]));
	const items = worksOrder.map((id) => {
		const picture = byId[id];
		if (!picture) {
			throw new Error("Missing featured work " + id);
		}

		return {
			src: imgSrc(picture.image.src),
			alt: picture.image.alt,
			name: picture.title,
			genreLabel: genreLabel(picture.genre),
			techniqueLabel: techniqueLabel(picture.technique),
		};
	});

	mkdirSync(dirname(worksLoopFile), { recursive: true });
	writeFileSync(worksLoopFile, `${JSON.stringify(items, null, "\t")}\n`);

	return worksLoopFile;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	prepareGalleryPictures();
	prepareWorksPictures();
}
