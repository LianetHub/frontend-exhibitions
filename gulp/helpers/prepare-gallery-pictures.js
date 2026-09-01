import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outFile = join(root, "gulp/gallery-pictures.json");

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

function colClass(type, index) {
	if (type === "trio") return "col-12 col-md-4";
	if (type === "quad") return "col-12 col-md-6 col-xl-3";
	if (type === "asymmetric") return index === 1 ? "col-12 col-md-6" : "col-12 col-md-3";
	if (type === "stack") return index === 0 ? "col-12 col-md-6" : "col-12";
	return "col-12 col-md-6";
}

function ratioClass(type, index) {
	if (type === "trio" || type === "quad") return "gallery-item--portrait";
	if (type === "asymmetric") return index === 1 ? "gallery-item--wide" : "gallery-item--narrow";
	if (type === "stack") return index === 0 ? "gallery-item--tall" : "gallery-item--banner";
	return "";
}

function wrap(type, index) {
	if (type !== "stack") {
		return { before: "", after: "" };
	}

	if (index === 1) {
		return { before: '<div class="col-12 col-md-6"><div class="row">', after: "" };
	}

	if (index === 2) {
		return { before: "", after: "</div></div>" };
	}

	return { before: "", after: "" };
}

function toLoopItem(picture, { col, ratio, before, after, priority }) {
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
		col,
		ratio,
		before,
		after,
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

			const { before, after } = wrap(type, index);
			items.push(
				toLoopItem(picture, {
					col: colClass(type, index),
					ratio: ratioClass(type, index),
					before,
					after,
					priority: items.length === 0,
				}),
			);
		});
	});

	if (cursor !== order.length) {
		throw new Error("Unused gallery order items: " + (order.length - cursor));
	}

	mkdirSync(dirname(outFile), { recursive: true });
	const json = `${JSON.stringify(items, null, "\t")}\n`;
	if (!existsSync(outFile) || readFileSync(outFile, "utf8") !== json) {
		writeFileSync(outFile, json);
	}

	return items;
}
