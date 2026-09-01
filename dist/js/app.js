"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // webp
    function testWebP(callback) {
        const webP = new Image();
        webP.onload = webP.onerror = function () {
            callback(webP.height === 2);
        };
        webP.src =
            "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
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
            spaceBetween: 24,
            watchOverflow: true,
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

    function closeCustomSelect(root) {
        const trigger = root.querySelector(".custom-select__trigger");
        const list = root.querySelector(".custom-select__list");

        root.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
        if (list) list.hidden = true;
    }

    function openCustomSelect(root) {
        document.querySelectorAll(".custom-select").forEach((item) => {
            if (item !== root) closeCustomSelect(item);
        });

        const trigger = root.querySelector(".custom-select__trigger");
        const list = root.querySelector(".custom-select__list");

        root.classList.add("is-open");
        trigger?.setAttribute("aria-expanded", "true");
        if (list) {
            list.hidden = false;
            const focusTarget =
                list.querySelector(".custom-select__option.is-selected") ||
                list.querySelector(".custom-select__option");
            focusTarget?.focus();
        }
    }

    function syncCustomSelectValue(root, value) {
        const native = root.querySelector(".custom-select__native");
        const list = root.querySelector(".custom-select__list");
        const valueEl = root.querySelector(".custom-select__value");
        const placeholder = customSelectPlaceholders.get(root) || "";

        if (!native || !list) return;

        native.value = value;

        list.querySelectorAll(".custom-select__option").forEach((option) => {
            const isSelected = option.getAttribute("value") === value;
            option.classList.toggle("is-selected", isSelected);
            option.setAttribute("aria-selected", isSelected ? "true" : "false");
        });

        const selectedOption = list.querySelector(`.custom-select__option[value="${value}"]`);
        if (valueEl) {
            valueEl.textContent = selectedOption?.textContent?.trim() || placeholder;
        }

        root.classList.toggle("has-value", Boolean(value));
        native.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function setupCustomSelect(root) {
        const native = root.querySelector(".custom-select__native");
        const valueEl = root.querySelector(".custom-select__value");
        if (!native || !valueEl) return;

        if (!customSelectPlaceholders.has(root)) {
            customSelectPlaceholders.set(root, valueEl.textContent.trim());
        }

        const selectedNativeOption = native.options[native.selectedIndex];
        const value = selectedNativeOption?.value || "";

        if (value) {
            syncCustomSelectValue(root, value);
        } else {
            valueEl.textContent = customSelectPlaceholders.get(root) || "";
            root.classList.remove("has-value");
        }
    }

    if (document.querySelectorAll(".custom-select").length > 0) {
        document.querySelectorAll(".custom-select").forEach(setupCustomSelect);
    }

    // gallery filters
    const galleryRoot = document.querySelector("[data-gallery]");
    const galleryGenre = document.querySelector("#gallery-genre");
    const galleryTechnique = document.querySelector("#gallery-technique");

    function applyGalleryFilters() {
        if (!galleryRoot) return;

        const genre = galleryGenre?.value || "";
        const technique = galleryTechnique?.value || "";
        const cells = galleryRoot.querySelectorAll("[data-gallery-cell]");

        cells.forEach((cell) => {
            const matchGenre = !genre || cell.getAttribute("data-genre") === genre;
            const matchTechnique = !technique || cell.getAttribute("data-technique") === technique;
            cell.classList.toggle("is-hidden", !(matchGenre && matchTechnique));
        });
    }

    if (galleryRoot && (galleryGenre || galleryTechnique)) {
        galleryGenre?.addEventListener("change", applyGalleryFilters);
        galleryTechnique?.addEventListener("change", applyGalleryFilters);
    }

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
                const value = option.getAttribute("value");
                if (value !== null) {
                    syncCustomSelectValue(root, value);
                    closeCustomSelect(root);
                    trigger.focus();
                }
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

        const selectOption = target.closest(".custom-select__option");
        if (selectOption) {
            const root = selectOption.closest(".custom-select");
            const trigger = root?.querySelector(".custom-select__trigger");
            const value = selectOption.getAttribute("value");
            if (root && value !== null) {
                syncCustomSelectValue(root, value);
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
        closeButtonTpl:
            '<button class="f-button icon-cross" title="Закрыть" data-fancybox-close></button>',
    });
}
