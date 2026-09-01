const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const pictures = require(path.join(root, "src/html/json/pictures.json")).pictures;
const byId = Object.fromEntries(pictures.map((p) => [p.id, p]));
const byTitle = new Map(
	pictures.map((p) => [
		p.title
			.toLowerCase()
			.replace(/ё/g, "е")
			.replace(/[.«»"']/g, "")
			.trim(),
		p,
	])
);

function findByTitleHint(hint) {
	if (!hint) return null;
	const n = hint
		.toLowerCase()
		.replace(/ё/g, "е")
		.replace(/[.«»"']/g, "")
		.trim();
	if (byTitle.has(n)) return byTitle.get(n);
	for (const [t, p] of byTitle) {
		if (t.includes(n) || n.includes(t)) return p;
	}
	return null;
}

const layers = [
	{ y: 624.64, x: 51, name: "image 29", hint: "Поселок в горах" },
	{ y: 625, x: 995, name: "image 27", hint: null },
	{ y: 1370, x: 51, name: "12 1", hint: null },
	{ y: 1370, x: 680, name: "13 1", hint: null },
	{ y: 1371, x: 1311, name: "8 1", hint: null },
	{ y: 2238, x: 51, name: "image 28", hint: null },
	{ y: 2238, x: 995, name: "Торговые ряды", hint: "Торговые ряды" },
	{ y: 2974, x: 51, name: "10 1", hint: null },
	{ y: 2975, x: 680, name: "20 1", hint: null },
	{ y: 2975, x: 1313, name: "21 1", hint: null },
	{ y: 3842, x: 51, name: "15 1", hint: null },
	{ y: 3843, x: 995, name: "9 1", hint: null },
	{ y: 4577, x: 50, name: "27 1", hint: null },
	{ y: 4577, x: 680, name: "IMG_1677", hint: null },
	{ y: 4577, x: 1309, name: "28 1", hint: null },
	{ y: 5445, x: 51, name: "7 2 1", hint: null },
	{ y: 5445, x: 995, name: "IMG_1336", hint: null },
	{ y: 6178, x: 50, name: "IMG_5582", hint: null },
	{ y: 6178, x: 681, name: "IMG_7417", hint: null },
	{ y: 6178, x: 1310, name: "IMG_5026", hint: null },
	{ y: 7046, x: 50, name: "IMG_3808", hint: null },
	{ y: 7046, x: 995, name: "IMG_4501", hint: null },
	{ y: 7779, x: 51, name: "IMG_5014", hint: null },
	{ y: 7779, x: 679, name: "IMG_4388", hint: null },
	{ y: 7779, x: 1308, name: "IMG_8505", hint: null },
	{ y: 8647, x: 50, name: "IMG_7729", hint: null },
	{ y: 8647, x: 995, name: "IMG_3985", hint: null },
	{ y: 9380, x: 50, name: "IMG_6756", hint: null },
	{ y: 9380, x: 677, name: "IMG_3860", hint: null },
	{ y: 9380, x: 1308, name: "IMG_8678", hint: null },
	{ y: 10248, x: 50, name: "IMG_9061", hint: null },
	{ y: 10248, x: 995, name: "IMG_8283", hint: null },
	{ y: 11053, x: 50, name: "IMG_8230", hint: null },
	{ y: 11055, x: 678, name: "Натюрморт с фиалкой", hint: "Натюрморт с фиалкой" },
	{ y: 11053, x: 1308, name: "IMG-WA0010", hint: null },
	{ y: 11925, x: 50, name: "PICT0198", hint: null },
	{ y: 11925, x: 995, name: "IMG_4622", hint: null },
	{ y: 12730, x: 50, name: "Перед дождем", hint: "Перед дождем" },
	{ y: 12730, x: 697, name: "21 2", hint: null, skip: true },
	{ y: 12730, x: 1308, name: "У зеркала", hint: "У зеркала" },
	{ y: 13598, x: 51, name: "IMG_0915", hint: null },
	{ y: 13598, x: 995, name: "23 1", hint: null },
	{ y: 14360, x: 50, name: "Старый стул", hint: "Старый стул" },
	{ y: 14360, x: 679, name: "Гладиолусы", hint: "Инжир и гладиолусы" },
	{ y: 14360, x: 1308, name: "На зимней веранде", hint: "Орхидеи на зимней веранде" },
	{ y: 15228, x: 51, name: "screenshot-2024", hint: null },
	{ y: 15228, x: 995, name: "IMG_3069", hint: null },
	{ y: 16033, x: 51, name: "Зимний день", hint: "Зимний день в переулке" },
	{ y: 16033, x: 679, name: "22 1", hint: null },
	{ y: 16033, x: 1308, name: "Юкка", hint: "Юкка краснодарская" },
	{ y: 16901, x: 50, name: "IMG_5061", hint: null },
	{ y: 16901, x: 995, name: "IMG_3238", hint: null },
	{ y: 17634, x: 50, name: "IMG_2097", hint: null },
	{ y: 17634, x: 677, name: "IMG_0197", hint: null },
	{ y: 17634, x: 1304, name: "IMG_3068", hint: null },
	{ y: 18502, x: 51, name: "IMG_2272", hint: null },
	{ y: 18502, x: 995, name: "IMG_9287", hint: null },
	{ y: 19307, x: 50, name: "Возвращение из отпуска", hint: "В отпуск" },
	{ y: 19307, x: 679, name: "Праздничный натюрморт", hint: "Праздничный натюрморт" },
	{ y: 19307, x: 1308, name: "IMG_7672", hint: null },
	{ y: 20175, x: 50, name: "IMG_4663", hint: null },
	{ y: 20175, x: 995, name: "IMG_7019", hint: null },
	{ y: 20951, x: 50, name: "Сиреневый букет", hint: "Сиреневый букет" },
	{ y: 20951, x: 682, name: "Портрет Аси", hint: "Портрет Аси" },
	{ y: 20951, x: 1314, name: "IMG-WA0009", hint: null },
	{ y: 21898, x: 50, name: "Вечереет", hint: "Вечереет" },
	{ y: 21898, x: 995, name: "Весна приходит", hint: "Весна приходит в горы" },
	{ y: 22674, x: 50, name: "IMG_7716", hint: null },
	{ y: 22674, x: 522, name: "Первый снег", hint: "Последние листья, первый снег" },
	{ y: 22675, x: 1467, name: "IMG_8235", hint: null },
	{ y: 23450, x: 50, name: "Вечер. Окраина", hint: "Вечер. Окраина." },
	{ y: 23450, x: 995, name: "PICT0200", hint: null },
	{ y: 24226, x: 50, name: "IMG_3453", hint: null },
	{ y: 24226, x: 518, name: "IMG_4589", hint: null },
	{ y: 24226, x: 995, name: "Лимоны", hint: "Лимоны на синей тарелке" },
	{ y: 24226, x: 1462, name: "IMG_0877", hint: null },
	{ y: 25173, x: 50, name: "Букет из подсолнухов", hint: "Букет из подсолнухов" },
	{ y: 25173, x: 995, name: "IMG_3155", hint: null },
	{ y: 25949, x: 50, name: "В Архангельском", hint: "Зима в Архангельском" },
	{ y: 25949, x: 995, name: "24 1", hint: null },
	{ y: 26317, x: 995, name: "IMG_1064", hint: null },
	{ y: 26785, x: 50, name: "Осень за окном", hint: "Осень за окном" },
	{ y: 26785, x: 995, name: "Пейзаж 2", hint: null },
];

const used = new Set();
const ordered = layers
	.filter((layer) => !layer.skip)
	.map((layer) => ({ id: null, layer: layer.name, hint: layer.hint, how: "pending" }));

function claimSlot(slot, p, how) {
	if (!p || used.has(p.id)) return false;
	used.add(p.id);
	slot.id = p.id;
	slot.how = how;
	return true;
}

// Pass 1: title hints
for (const slot of ordered) {
	const layer = layers.find((l) => l.name === slot.layer && !l.skip);
	const byHint = findByTitleHint(slot.hint);
	if (byHint) claimSlot(slot, byHint, "hint");
}

// Pass 2: numeric names for remaining slots
for (const slot of ordered) {
	if (slot.id) continue;
	const m = slot.layer.match(/^(\d+)/);
	if (!m) continue;
	const num = String(parseInt(m[1], 10)).padStart(3, "0");
	const id = `work-${num}`;
	if (byId[id]) claimSlot(slot, byId[id], "num");
}

// Pass 3: fill remaining with unused pictures (JSON order)
const remaining = pictures.filter((p) => !used.has(p.id));
let ri = 0;
for (const slot of ordered) {
	if (slot.id) continue;
	const p = remaining[ri++];
	if (!p) throw new Error("Ran out of pictures for " + slot.layer);
	claimSlot(slot, p, "fill");
}

const leftover = pictures.filter((p) => !used.has(p.id));
console.log(
	"mapped",
	ordered.length,
	"leftover",
	leftover.map((p) => p.id),
	"fills",
	ordered.filter((o) => o.how === "fill").length,
	"hints",
	ordered.filter((o) => o.how === "hint").length,
	"nums",
	ordered.filter((o) => o.how === "num").length
);

const rows = [
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"duo",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"trio",
	"duo",
	"asymmetric",
	"duo",
	"quad",
	"duo",
	"stack",
	"duo",
];

const typeCount = { duo: 2, trio: 3, asymmetric: 3, quad: 4, stack: 3 };
const sum = rows.reduce((a, t) => a + typeCount[t], 0);
console.log("row sum", sum, "ordered", ordered.length);
if (sum !== ordered.length) {
	throw new Error("row sum mismatch");
}

fs.writeFileSync(
	path.join(root, "scripts/gallery-order.json"),
	JSON.stringify(
		{
			order: ordered.map((o) => o.id),
			meta: ordered,
			rows,
		},
		null,
		2
	)
);
console.log("wrote gallery-order.json");
