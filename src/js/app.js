"use strict";

document.addEventListener("DOMContentLoaded", () => {
	// webp
	function testWebP(callback) {
		const webP = new Image();
		webP.onload = webP.onerror = function () {
			callback(webP.height === 2);
		};
		webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}

	testWebP(function (support) {
		document.querySelector("body").classList.add(support ? "webp" : "no-webp");
	});

	// header
	const header = document.querySelector(".header");
	const burger = header?.querySelector(".header__burger");
	const mobileMenu = header?.querySelector(".header__mobile");
	let scrollY = 0;

	function lockBody() {
		scrollY = window.scrollY;
		document.body.classList.add("is-locked");
		document.body.style.top = `-${scrollY}px`;
		document.body.style.position = "fixed";
		document.body.style.width = "100%";
	}

	function unlockBody() {
		document.body.classList.remove("is-locked");
		document.body.style.position = "";
		document.body.style.top = "";
		document.body.style.width = "";
		window.scrollTo(0, scrollY);
	}

	function closeMobileMenu() {
		if (!header || !burger || !mobileMenu) return;
		header.classList.remove("is-menu-open");
		burger.classList.remove("is-open");
		burger.setAttribute("aria-expanded", "false");
		burger.setAttribute("aria-label", "Открыть меню");
		mobileMenu.hidden = true;
		unlockBody();
	}

	function openMobileMenu() {
		if (!header || !burger || !mobileMenu) return;
		header.classList.add("is-menu-open");
		burger.classList.add("is-open");
		burger.setAttribute("aria-expanded", "true");
		burger.setAttribute("aria-label", "Закрыть меню");
		mobileMenu.hidden = false;
		lockBody();
	}

	function toggleMobileMenu() {
		if (!burger) return;
		if (burger.classList.contains("is-open")) closeMobileMenu();
		else openMobileMenu();
	}

	// sliders
	if (document.querySelector(".works__slider") && typeof Swiper !== "undefined") {
		const slider = document.querySelector(".works__slider");
		const wrap = slider.closest(".works__slider-wrap");
		const pagination = wrap?.querySelector(".works__pagination");
		const prevEl = wrap?.querySelector(".works__prev");
		const nextEl = wrap?.querySelector(".works__next");

		new Swiper(slider, {
			slidesPerView: 1,
			slidesPerGroup: 1,
			spaceBetween: 24,
			watchOverflow: true,
			breakpoints: {
				767.98: {
					slidesPerView: 3,
					slidesPerGroup: 3,
					spaceBetween: 64,
				},
			},
			navigation: {
				prevEl,
				nextEl,
			},
			pagination: pagination
				? {
						el: pagination,
						clickable: true,
						renderBullet(index, className) {
							return `<button type="button" class="${className}" data-index="${index + 1}" aria-label="Слайд ${index + 1}"></button>`;
						},
					}
				: undefined,
		});
	}

	let exhibitionsSwiper = null;

	if (document.querySelector("[data-exhibitions-slider]") && typeof Swiper !== "undefined") {
		const slider = document.querySelector("[data-exhibitions-slider]");
		const wrap = slider.closest(".exhibitions-slider__wrap");
		const pagination = wrap?.querySelector(".exhibitions-slider__pagination");
		const prevEl = wrap?.querySelector(".exhibitions-slider__prev");
		const nextEl = wrap?.querySelector(".exhibitions-slider__next");

		exhibitionsSwiper = new Swiper(slider, {
			slidesPerView: 1,
			spaceBetween: 16,
			centeredSlides: true,
			watchOverflow: true,
			breakpoints: {
				768: {
					slidesPerView: "auto",
					spaceBetween: 24,
					centeredSlides: true,
				},
			},
			navigation: {
				prevEl,
				nextEl,
			},
			pagination: pagination
				? {
						el: pagination,
						clickable: true,
						renderBullet(index, className) {
							return `<button type="button" class="${className}" data-index="${index + 1}" aria-label="Слайд ${index + 1}"></button>`;
						},
					}
				: undefined,
		});
	}

	function applyExhibitionsCityFilter(city) {
		const slider = document.querySelector("[data-exhibitions-slider]");
		if (!slider) return;

		slider.querySelectorAll(".exhibitions-slide").forEach((slide) => {
			const match = !city || slide.getAttribute("data-city") === city;
			slide.classList.toggle("is-hidden", !match);
		});

		if (exhibitionsSwiper) {
			exhibitionsSwiper.update();
			exhibitionsSwiper.slideTo(0, 0);
		}
	}

	// custom select
	const customSelectPlaceholders = new WeakMap();

	function isMultiCustomSelect(root) {
		return root?.classList.contains("custom-select--multiple");
	}

	function getCustomSelectDropdown(root) {
		return root.querySelector(".custom-select__panel") || root.querySelector(".custom-select__list");
	}

	function parseCustomSelectValues(raw) {
		if (!raw) return [];
		return raw
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}

	function serializeCustomSelectValues(values) {
		return values.join(",");
	}

	function getCustomSelectOptionLabel(root, value) {
		const list = root.querySelector(".custom-select__list");
		const option = [...list.querySelectorAll(".custom-select__option")].find((item) => (item.dataset.value ?? "") === value);
		return option?.querySelector(".custom-select__option-label")?.textContent?.trim() || "";
	}

	function getAppliedCustomSelectValues(root) {
		const hidden = root.querySelector('input[type="hidden"]');
		return parseCustomSelectValues(hidden?.value || "");
	}

	function getDraftCustomSelectValues(root) {
		const list = root.querySelector(".custom-select__list");
		return [...list.querySelectorAll(".custom-select__option.is-selected")].map((option) => option.dataset.value ?? "").filter(Boolean);
	}

	function renderCustomSelectOptions(root, values) {
		const list = root.querySelector(".custom-select__list");
		if (!list) return;

		list.querySelectorAll(".custom-select__option").forEach((option) => {
			const optionValue = option.dataset.value ?? "";
			if (!optionValue) return;

			const isSelected = values.includes(optionValue);
			option.classList.toggle("is-selected", isSelected);
			option.setAttribute("aria-selected", isSelected ? "true" : "false");
		});
	}

	function updateCustomSelectTrigger(root, values) {
		const valueEl = root.querySelector(".custom-select__value");
		const placeholder = customSelectPlaceholders.get(root) || "";
		if (!valueEl) return;

		if (!values.length) {
			valueEl.textContent = placeholder;
		} else if (isMultiCustomSelect(root)) {
			const labels = values.map((value) => getCustomSelectOptionLabel(root, value)).filter(Boolean);
			valueEl.textContent = labels.join(", ");
		} else {
			valueEl.textContent = getCustomSelectOptionLabel(root, values[0]) || placeholder;
		}

		root.classList.toggle("has-value", values.length > 0);
	}

	function isCustomSelectDirty(root) {
		const applied = getAppliedCustomSelectValues(root);
		const draft = getDraftCustomSelectValues(root);

		if (applied.length !== draft.length) return true;
		return applied.some((value) => !draft.includes(value));
	}

	function setCustomSelectDirty(root, isDirty) {
		root.classList.toggle("is-dirty", isDirty);
	}

	function commitCustomSelectDraft(root) {
		const draft = getDraftCustomSelectValues(root);
		const hidden = root.querySelector('input[type="hidden"]');
		if (!hidden) return;

		hidden.value = serializeCustomSelectValues(draft);
		updateCustomSelectTrigger(root, draft);
		setCustomSelectDirty(root, false);
		root.dispatchEvent(
			new CustomEvent("change", {
				bubbles: true,
				detail: { value: hidden.value, values: draft },
			}),
		);
	}

	function toggleCustomSelectOption(root, optionValue) {
		if (!optionValue) return;

		let draft = getDraftCustomSelectValues(root);
		draft = draft.includes(optionValue) ? draft.filter((value) => value !== optionValue) : [...draft, optionValue];

		renderCustomSelectOptions(root, draft);
		setCustomSelectDirty(root, isCustomSelectDirty(root));
	}

	function closeCustomSelect(root) {
		const trigger = root.querySelector(".custom-select__trigger");
		const dropdown = getCustomSelectDropdown(root);

		root.classList.remove("is-open");
		trigger?.setAttribute("aria-expanded", "false");
		if (dropdown) dropdown.hidden = true;
	}

	function openCustomSelect(root) {
		document.querySelectorAll(".custom-select").forEach((item) => {
			if (item !== root) closeCustomSelect(item);
		});

		const trigger = root.querySelector(".custom-select__trigger");
		const list = root.querySelector(".custom-select__list");
		const dropdown = getCustomSelectDropdown(root);

		root.classList.add("is-open");
		trigger?.setAttribute("aria-expanded", "true");
		if (dropdown) {
			dropdown.hidden = false;
			const focusTarget = list.querySelector(".custom-select__option.is-selected") || list.querySelector(".custom-select__option");
			focusTarget?.focus();
		}
	}

	function syncCustomSelectValue(root, value) {
		const hidden = root.querySelector('input[type="hidden"]');
		const list = root.querySelector(".custom-select__list");
		if (!hidden || !list) return;

		if (isMultiCustomSelect(root)) {
			const values = Array.isArray(value) ? value : parseCustomSelectValues(value);
			hidden.value = serializeCustomSelectValues(values);
			renderCustomSelectOptions(root, values);
			updateCustomSelectTrigger(root, values);
			setCustomSelectDirty(root, false);
			root.dispatchEvent(
				new CustomEvent("change", {
					bubbles: true,
					detail: { value: hidden.value, values },
				}),
			);
			return;
		}

		const valueEl = root.querySelector(".custom-select__value");
		const placeholder = customSelectPlaceholders.get(root) || "";

		hidden.value = value;

		list.querySelectorAll(".custom-select__option").forEach((option) => {
			const optionValue = option.dataset.value ?? "";
			const isSelected = optionValue === value;
			option.classList.toggle("is-selected", isSelected);
			option.setAttribute("aria-selected", isSelected ? "true" : "false");
		});

		const selectedOption = [...list.querySelectorAll(".custom-select__option")].find((option) => (option.dataset.value ?? "") === value);
		if (valueEl) {
			const labelEl = selectedOption?.querySelector(".custom-select__option-label");
			valueEl.textContent = labelEl?.textContent?.trim() || placeholder;
		}

		root.classList.toggle("has-value", Boolean(value));
		root.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value } }));
	}

	function setupCustomSelect(root) {
		const hidden = root.querySelector('input[type="hidden"]');
		const valueEl = root.querySelector(".custom-select__value");
		if (!hidden || !valueEl) return;

		if (!customSelectPlaceholders.has(root)) {
			customSelectPlaceholders.set(root, valueEl.textContent.trim());
		}

		const values = isMultiCustomSelect(root) ? getAppliedCustomSelectValues(root) : parseCustomSelectValues(hidden.value || "");

		if (values.length) {
			syncCustomSelectValue(root, isMultiCustomSelect(root) ? values : values[0]);
		} else {
			valueEl.textContent = customSelectPlaceholders.get(root) || "";
			root.classList.remove("has-value");
			if (isMultiCustomSelect(root)) {
				renderCustomSelectOptions(root, []);
				setCustomSelectDirty(root, false);
			}
		}
	}

	if (document.querySelectorAll(".custom-select").length > 0) {
		document.querySelectorAll(".custom-select").forEach(setupCustomSelect);
	}

	// gallery filters
	const galleryRoot = document.querySelector("[data-gallery]");
	const galleryFilters = document.querySelector("[data-gallery-filters]");

	function getCustomSelectValues(root) {
		return getAppliedCustomSelectValues(root);
	}

	function applyGalleryFilters() {
		if (!galleryRoot || !galleryFilters) return;

		const genres = getCustomSelectValues(galleryFilters.querySelector("#gallery-genre"));
		const techniques = getCustomSelectValues(galleryFilters.querySelector("#gallery-technique"));
		const cells = galleryRoot.querySelectorAll("[data-gallery-cell]");

		cells.forEach((cell) => {
			const cellGenre = cell.getAttribute("data-genre") || "";
			const cellTechniqueParts = (cell.getAttribute("data-technique") || "").split(",").map((part) => part.trim());
			const matchGenre = !genres.length || genres.includes(cellGenre);
			const matchTechnique = !techniques.length || techniques.some((technique) => cellTechniqueParts.includes(technique));
			cell.classList.toggle("is-hidden", !(matchGenre && matchTechnique));
		});

		const hasVisible = [...cells].some((cell) => !cell.classList.contains("is-hidden"));
		const empty = galleryRoot.querySelector(".gallery__empty");
		galleryRoot.classList.toggle("is-empty", !hasVisible);
		if (empty) empty.hidden = hasVisible;
	}

	function syncGalleryFiltersClear() {
		if (!galleryFilters) return;

		const hasFilters = [...galleryFilters.querySelectorAll(".custom-select")].some((root) => getCustomSelectValues(root).length > 0);
		galleryFilters.classList.toggle("has-filters", hasFilters);
	}

	function resetGalleryFilters() {
		if (!galleryFilters) return;

		galleryFilters.querySelectorAll(".custom-select").forEach((root) => {
			syncCustomSelectValue(root, isMultiCustomSelect(root) ? [] : "");
			closeCustomSelect(root);
		});
		syncGalleryFiltersClear();
		applyGalleryFilters();
	}

	if (galleryRoot && galleryFilters) {
		galleryFilters.addEventListener("change", (e) => {
			if (!e.target.closest(".custom-select")) return;
			applyGalleryFilters();
			syncGalleryFiltersClear();
		});
		syncGalleryFiltersClear();
		applyGalleryFilters();
	}

	function initGalleryReveal() {
		if (!galleryRoot) return;

		const items = [...galleryRoot.querySelectorAll(".gallery-item")];
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const queuedItems = new Set();
		let flushScheduled = false;

		function revealGalleryImage(img) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => img.classList.add("is-loaded"));
			});
		}

		function flushRevealQueue() {
			const batch = [...queuedItems].sort((a, b) => {
				const aRect = a.getBoundingClientRect();
				const bRect = b.getBoundingClientRect();
				const rowDelta = aRect.top - bRect.top;
				if (Math.abs(rowDelta) > 12) return rowDelta;
				return aRect.left - bRect.left;
			});

			queuedItems.clear();
			flushScheduled = false;

			batch.forEach((item, index) => {
				item.style.setProperty("--gallery-reveal-delay", `${index * 80}ms`);
			});

			requestAnimationFrame(() => {
				batch.forEach((item) => item.classList.add("is-visible"));
			});
		}

		function queueGalleryReveal(item) {
			if (item.classList.contains("is-visible") || queuedItems.has(item)) return;
			queuedItems.add(item);
			if (flushScheduled) return;
			flushScheduled = true;
			requestAnimationFrame(flushRevealQueue);
		}

		galleryRoot.querySelectorAll(".gallery-item__img").forEach((img) => {
			if (img.classList.contains("is-loaded")) return;

			if (img.complete && img.naturalWidth > 0) {
				revealGalleryImage(img);
				return;
			}

			img.addEventListener("load", () => revealGalleryImage(img), { once: true });
			img.addEventListener("error", () => revealGalleryImage(img), { once: true });
		});

		if (reducedMotion) {
			items.forEach((item) => {
				item.classList.add("is-visible");
				item.querySelector(".gallery-item__img")?.classList.add("is-loaded");
			});
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					queueGalleryReveal(entry.target);
					observer.unobserve(entry.target);
				});
			},
			{
				rootMargin: "0px 0px -10% 0px",
				threshold: 0.12,
			},
		);

		items.forEach((item) => observer.observe(item));
	}

	initGalleryReveal();

	function handleCustomSelectKeyboard(event) {
		const list = event.target.closest(".custom-select__list");
		if (!list) return;

		const root = list.closest(".custom-select");
		const trigger = root?.querySelector(".custom-select__trigger");
		if (!root || !trigger) return;

		const options = [...list.querySelectorAll(".custom-select__option")];
		const currentIndex = options.indexOf(document.activeElement);

		if (event.key === "ArrowDown") {
			event.preventDefault();
			const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
			options[nextIndex]?.focus();
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
			options[prevIndex]?.focus();
		}

		if (event.key === "Home") {
			event.preventDefault();
			options[0]?.focus();
		}

		if (event.key === "End") {
			event.preventDefault();
			options[options.length - 1]?.focus();
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			const option = document.activeElement;
			if (option?.classList.contains("custom-select__option")) {
				const optionValue = option.dataset.value ?? "";
				if (isMultiCustomSelect(root)) {
					toggleCustomSelectOption(root, optionValue);
					return;
				}

				syncCustomSelectValue(root, optionValue);
				closeCustomSelect(root);
				trigger.focus();
			}
		}

		if (event.key === "Escape") {
			event.preventDefault();
			closeCustomSelect(root);
			trigger.focus();
		}
	}

	// click handlers
	document.addEventListener("click", (e) => {
		const target = e.target;
		if (!(target instanceof Element)) return;

		if (target.closest(".header__burger")) {
			toggleMobileMenu();
		}

		if (target.closest(".header__mobile-link")) {
			closeMobileMenu();
		}

		const exhibitionsChip = target.closest("[data-exhibitions-filters] .exhibitions-hero__chip");
		if (exhibitionsChip) {
			const filters = exhibitionsChip.closest("[data-exhibitions-filters]");
			const city = exhibitionsChip.getAttribute("data-city") || "";
			const isActive = exhibitionsChip.classList.contains("is-active");

			filters?.querySelectorAll(".exhibitions-hero__chip").forEach((chip) => {
				chip.classList.remove("is-active");
			});

			if (!isActive && city) {
				exhibitionsChip.classList.add("is-active");
				applyExhibitionsCityFilter(city);
			} else {
				applyExhibitionsCityFilter("");
			}
		}

		const selectApply = target.closest(".custom-select__apply");
		if (selectApply) {
			const root = selectApply.closest(".custom-select");
			const trigger = root?.querySelector(".custom-select__trigger");
			if (root) {
				commitCustomSelectDraft(root);
				closeCustomSelect(root);
				trigger?.focus();
			}
			return;
		}

		const galleryFiltersClear = target.closest(".gallery-hero__filters-clear, .gallery__empty-reset");
		if (galleryFiltersClear) {
			resetGalleryFilters();
			return;
		}

		const selectClear = target.closest(".custom-select__clear");
		if (selectClear) {
			const root = selectClear.closest(".custom-select");
			const trigger = root?.querySelector(".custom-select__trigger");
			if (root) {
				syncCustomSelectValue(root, isMultiCustomSelect(root) ? [] : "");
				closeCustomSelect(root);
				trigger?.focus();
			}
			return;
		}

		const selectOption = target.closest(".custom-select__option");
		if (selectOption) {
			const root = selectOption.closest(".custom-select");
			const trigger = root?.querySelector(".custom-select__trigger");
			if (root) {
				const optionValue = selectOption.dataset.value ?? "";
				if (isMultiCustomSelect(root)) {
					toggleCustomSelectOption(root, optionValue);
					return;
				}

				syncCustomSelectValue(root, optionValue);
				closeCustomSelect(root);
				trigger?.focus();
			}
		}

		const selectTrigger = target.closest(".custom-select__trigger");
		if (selectTrigger) {
			const root = selectTrigger.closest(".custom-select");
			if (root) {
				if (root.classList.contains("is-open")) closeCustomSelect(root);
				else openCustomSelect(root);
			}
		}

		document.querySelectorAll(".custom-select.is-open").forEach((root) => {
			if (!root.contains(target)) closeCustomSelect(root);
		});
	});

	// keydown
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeMobileMenu();
			document.querySelectorAll(".custom-select.is-open").forEach((root) => {
				closeCustomSelect(root);
			});
		}

		handleCustomSelectKeyboard(e);
	});

	window.addEventListener("resize", () => {
		if (window.matchMedia(`(min-width: 992px)`).matches) {
			closeMobileMenu();
		}
	});
});

if (typeof Fancybox !== "undefined") {
	Fancybox.bind("[data-fancybox]", {
		autoFocus: true,
		dragToClose: (fancybox) => fancybox.getSlide()?.type !== "inline",
		closeButtonTpl: '<button class="f-button icon-cross" title="Закрыть" data-fancybox-close></button>',
	});
}
