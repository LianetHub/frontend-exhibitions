"use strict";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

if ("scrollRestoration" in history) {
	history.scrollRestoration = "manual";
}

function isPageReload() {
	const nav = performance.getEntriesByType("navigation")[0];
	return !nav || nav.type === "reload";
}

function scrollToPageTop() {
	window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

if (isPageReload()) {
	scrollToPageTop();
	window.addEventListener("load", scrollToPageTop);
}

window.addEventListener("pageshow", (event) => {
	if (event.persisted && isPageReload()) scrollToPageTop();
});

document.addEventListener("DOMContentLoaded", () => {
	// header
	const header = document.querySelector(".header");
	const burger = header?.querySelector(".header__burger");
	const mobileMenu = header?.querySelector(".header__mobile");
	let scrollY = 0;
	let onMenuTransitionEnd = null;
	let menuHideTimer = 0;

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

	function detachMenuTransition() {
		if (menuHideTimer) {
			window.clearTimeout(menuHideTimer);
			menuHideTimer = 0;
		}

		if (!mobileMenu || !onMenuTransitionEnd) return;
		mobileMenu.removeEventListener("transitionend", onMenuTransitionEnd);
		onMenuTransitionEnd = null;
	}

	function closeMobileMenu(immediate = false) {
		if (!header || !burger || !mobileMenu) return;
		if (!header.classList.contains("is-menu-open") && mobileMenu.hidden) return;

		const wasOpen = header.classList.contains("is-menu-open");
		header.classList.remove("is-menu-open");
		burger.classList.remove("is-open");
		burger.setAttribute("aria-expanded", "false");
		burger.setAttribute("aria-label", "Открыть меню");
		unlockBody();
		detachMenuTransition();

		if (!wasOpen || immediate) {
			mobileMenu.hidden = true;
			return;
		}

		onMenuTransitionEnd = (event) => {
			if (event.target !== mobileMenu || event.propertyName !== "transform") return;
			detachMenuTransition();
			if (!header.classList.contains("is-menu-open")) mobileMenu.hidden = true;
		};
		mobileMenu.addEventListener("transitionend", onMenuTransitionEnd);
		menuHideTimer = window.setTimeout(() => {
			detachMenuTransition();
			if (!header.classList.contains("is-menu-open")) mobileMenu.hidden = true;
		}, 400);
	}

	function openMobileMenu() {
		if (!header || !burger || !mobileMenu) return;
		detachMenuTransition();
		mobileMenu.hidden = false;
		void mobileMenu.offsetWidth;
		header.classList.add("is-menu-open");
		burger.classList.add("is-open");
		burger.setAttribute("aria-expanded", "true");
		burger.setAttribute("aria-label", "Закрыть меню");
		lockBody();
	}

	function toggleMobileMenu() {
		if (!burger) return;
		if (burger.classList.contains("is-open")) closeMobileMenu();
		else openMobileMenu();
	}

	// stats + works reveal
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const heroEl = document.querySelector(".hero");
	const statsEl = document.querySelector(".stats");
	const worksEl = document.querySelector(".works");
	let statsRevealDone = !statsEl || reducedMotion;
	let worksRevealTl = null;
	let worksRevealArmed = false;

	function splitTextLines(el, lineClass, innerClass) {
		const text = el.textContent.replace(/\s+/g, " ").trim();
		if (!text) return [];

		el.textContent = "";
		const words = text.split(" ");
		const wordSpans = words.map((word, index) => {
			const span = document.createElement("span");
			span.textContent = word + (index < words.length - 1 ? " " : "");
			el.appendChild(span);
			return span;
		});

		const lineGroups = [];
		let currentTop = null;
		let currentLine = [];

		wordSpans.forEach((span) => {
			const top = span.offsetTop;
			if (currentTop === null || Math.abs(top - currentTop) > 2) {
				if (currentLine.length) lineGroups.push(currentLine);
				currentLine = [span];
				currentTop = top;
			} else {
				currentLine.push(span);
			}
		});
		if (currentLine.length) lineGroups.push(currentLine);

		return lineGroups.map((lineWords) => {
			const lineEl = document.createElement("span");
			lineEl.className = lineClass;
			const inner = document.createElement("span");
			inner.className = innerClass;
			lineWords.forEach((word) => inner.appendChild(word));
			lineEl.appendChild(inner);
			el.appendChild(lineEl);
			return inner;
		});
	}

	function armWorksReveal() {
		if (!worksRevealTl || !statsRevealDone || worksRevealArmed) return;
		worksRevealArmed = true;

		ScrollTrigger.create({
			trigger: worksEl,
			start: "top 75%",
			once: true,
			onEnter() {
				worksRevealTl.play();
			},
		});
	}

	// hero intro
	if (heroEl && !reducedMotion) {
		const heroBoiserie = heroEl.querySelector(".hero__boiserie");
		const heroPhotoWrap = heroEl.querySelector(".hero__photo-wrap");
		const heroTitleMobile = heroEl.querySelector(".hero__title-img--mobile");
		const heroTitleName = heroEl.querySelector(".hero__title-img--name");
		const heroTitleSurname = heroEl.querySelector(".hero__title-img--surname");
		const heroLead = heroEl.querySelector(".hero__lead");
		const heroLeadLines = heroLead ? splitTextLines(heroLead, "hero__lead-line", "hero__lead-line-inner") : [];
		const isDesktopTitle = window.matchMedia("(min-width: 991.98px)").matches;

		if (heroBoiserie) gsap.set(heroBoiserie, { yPercent: 100 });
		if (heroPhotoWrap) gsap.set(heroPhotoWrap, { yPercent: 100 });
		if (heroTitleMobile) gsap.set(heroTitleMobile, { yPercent: 40, opacity: 0 });
		if (heroTitleName) gsap.set(heroTitleName, { xPercent: -120, opacity: 0 });
		if (heroTitleSurname) gsap.set(heroTitleSurname, { xPercent: 120, opacity: 0 });
		if (heroLeadLines.length) gsap.set(heroLeadLines, { yPercent: 100, opacity: 0 });

		const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });

		if (heroBoiserie) {
			heroTl.to(heroBoiserie, {
				yPercent: 0,
				duration: 1.25,
				delay: 0.5,
				ease: "power3.out",
			});
		}

		if (heroPhotoWrap) {
			heroTl.to(
				heroPhotoWrap,
				{
					yPercent: 0,
					duration: 1,
					ease: "power2.out",
					onComplete() {
						heroEl.classList.add("is-ready");
					},
				},
				">-=0.15",
			);
		} else {
			heroEl.classList.add("is-ready");
		}

		if (isDesktopTitle) {
			if (heroTitleName) {
				heroTl.to(
					heroTitleName,
					{
						xPercent: 0,
						opacity: 1,
						duration: 1,
						ease: "back.out(1.6)",
					},
					">-=0.1",
				);
			}
			if (heroTitleSurname) {
				heroTl.to(
					heroTitleSurname,
					{
						xPercent: 0,
						opacity: 1,
						duration: 1,
						ease: "back.out(1.6)",
					},
					"<",
				);
			}
		} else if (heroTitleMobile) {
			heroTl.to(
				heroTitleMobile,
				{
					yPercent: 0,
					opacity: 1,
					duration: 0.85,
					ease: "back.out(1.4)",
				},
				">-=0.1",
			);
		}

		if (heroLeadLines.length) {
			heroTl.to(heroLeadLines, {
				yPercent: 0,
				opacity: 1,
				duration: 0.75,
				stagger: 0.12,
				ease: "power2.out",
			});
		}
	} else if (heroEl) {
		heroEl.classList.add("is-ready");
	}

	if (statsEl && !reducedMotion) {
		const statsCards = statsEl.querySelectorAll(".stats__card");
		const statsValues = statsEl.querySelectorAll(".stats__value");
		const statsLabels = statsEl.querySelectorAll(".stats__label");

		gsap.set(statsEl, { height: 0, overflow: "hidden" });
		gsap.set(statsCards, { scaleY: 0, transformOrigin: "top center" });
		gsap.set(statsValues, { opacity: 0, y: 40 });
		gsap.set(statsLabels, { opacity: 0, y: 10 });

		gsap.timeline({
			scrollTrigger: {
				trigger: statsEl,
				start: "top 80%",
				once: true,
			},
			onComplete() {
				statsRevealDone = true;
				ScrollTrigger.refresh();
				armWorksReveal();
			},
		})
			.to(statsEl, {
				height: "auto",
				duration: 0.8,
				ease: "power2.out",
				onComplete() {
					gsap.set(statsEl, { clearProps: "height,overflow" });
					ScrollTrigger.refresh();
				},
			})
			.to(statsCards, {
				scaleY: 1,
				duration: 0.6,
				ease: "power2.out",
			})
			.to(statsValues, {
				opacity: 1,
				y: 0,
				duration: 0.5,
				ease: "power2.out",
			})
			.to(statsLabels, {
				opacity: 1,
				y: 0,
				duration: 0.4,
				ease: "power2.out",
			});
	}

	// sliders
	if (document.querySelector(".works__slider") && typeof Swiper !== "undefined") {
		const slider = document.querySelector(".works__slider");
		const wrap = slider.closest(".works__slider-wrap");
		const pagination = wrap?.querySelector(".works__pagination");
		const prevEl = wrap?.querySelector(".works__prev");
		const nextEl = wrap?.querySelector(".works__next");

		new Swiper(slider, {
			slidesPerView: 1.25,
			slidesPerGroup: 1,
			spaceBetween: 13,
			watchOverflow: true,
			breakpoints: {
				767.98: {
					slidesPerView: 2,
					slidesPerGroup: 2,
					spaceBetween: 32,
				},
				1439.98: {
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

	// works reveal
	if (worksEl && !reducedMotion) {
		const worksTitle = worksEl.querySelector(".works__head-title");
		const worksSlides = [...worksEl.querySelectorAll(".works__slider .swiper-slide")].slice(0, 3);
		const worksNav = worksEl.querySelector(".works__nav");
		const worksTextMain = worksEl.querySelector(".works__head-main > .works__text");
		const worksTextAside = worksEl.querySelector(".works__text--aside");
		const worksBtn = worksEl.querySelector(".works__btn");
		const worksBtnLabel = worksBtn?.querySelector(".works__btn-label");
		const mainLines = worksTextMain ? splitTextLines(worksTextMain, "works__text-line", "works__text-line-inner") : [];
		const asideLines = worksTextAside ? splitTextLines(worksTextAside, "works__text-line", "works__text-line-inner") : [];
		const textLines = [...mainLines, ...asideLines];
		const btnRect = worksBtn?.getBoundingClientRect();
		const btnWidth = btnRect?.width || 0;
		const btnHeight = btnRect?.height || 0;
		const btnStyles = worksBtn ? getComputedStyle(worksBtn) : null;
		const btnPaddingTop = btnStyles ? parseFloat(btnStyles.paddingTop) || 0 : 0;
		const btnPaddingBottom = btnStyles ? parseFloat(btnStyles.paddingBottom) || 0 : 0;

		if (worksTitle) gsap.set(worksTitle, { xPercent: -100, opacity: 0 });
		if (worksSlides.length) gsap.set(worksSlides, { yPercent: 100, opacity: 0 });
		if (worksNav) gsap.set(worksNav, { y: 24, opacity: 0 });
		if (textLines.length) gsap.set(textLines, { yPercent: 100, opacity: 0 });
		if (worksBtn) {
			gsap.set(worksBtn, {
				width: 20,
				height: 0,
				minWidth: 0,
				minHeight: 0,
				paddingTop: 0,
				paddingBottom: 0,
				overflow: "hidden",
				justifySelf: "center",
				alignSelf: "center",
			});
		}
		if (worksBtnLabel) gsap.set(worksBtnLabel, { yPercent: 100, opacity: 0 });

		worksRevealTl = gsap.timeline({ paused: true });

		if (worksTitle) {
			worksRevealTl.to(
				worksTitle,
				{
					xPercent: 0,
					opacity: 1,
					duration: 0.9,
					ease: "power3.out",
				},
				0,
			);
		}

		const worksMediaTl = gsap.timeline();
		worksSlides.forEach((slide, index) => {
			const isMiddle = index === 1;
			worksMediaTl.to(
				slide,
				{
					yPercent: 0,
					opacity: 1,
					duration: isMiddle ? 1.75 : 1.25,
					ease: "back.out(1.4)",
				},
				0,
			);
		});
		if (worksNav) {
			worksMediaTl.to(
				worksNav,
				{
					y: 0,
					opacity: 1,
					duration: 0.7,
					ease: "power2.out",
				},
				0.35,
			);
		}

		const worksCopyTl = gsap.timeline();
		if (mainLines.length) {
			worksCopyTl.to(
				mainLines,
				{
					yPercent: 0,
					opacity: 1,
					duration: 0.75,
					stagger: 0.12,
					ease: "power2.out",
				},
				0,
			);
		}
		if (asideLines.length) {
			worksCopyTl.to(
				asideLines,
				{
					yPercent: 0,
					opacity: 1,
					duration: 0.75,
					stagger: 0.12,
					ease: "power2.out",
				},
				0,
			);
		}
		if (worksBtn && btnWidth > 0 && btnHeight > 0) {
			worksCopyTl
				.to(worksBtn, {
					height: btnHeight,
					paddingTop: btnPaddingTop,
					paddingBottom: btnPaddingBottom,
					duration: 0.45,
					ease: "power2.out",
				})
				.to(worksBtn, {
					width: btnWidth,
					duration: 0.7,
					ease: "back.out(1.4)",
				});
		}
		if (worksBtnLabel) {
			worksCopyTl.to(worksBtnLabel, {
				yPercent: 0,
				opacity: 1,
				duration: 1,
				ease: "power2.out",
				onComplete() {
					if (worksBtn) {
						gsap.set(worksBtn, {
							clearProps: "width,height,minWidth,minHeight,paddingTop,paddingBottom,overflow,justifySelf,alignSelf,marginLeft,marginRight",
						});
					}
				},
			});
		}

		worksRevealTl.add(worksMediaTl, 0).add(worksCopyTl, 0);

		armWorksReveal();
	}

	function readStripeToken(name) {
		const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
		if (!raw) return NaN;
		if (raw.endsWith("rem")) {
			const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
			return parseFloat(raw) * rootFont;
		}
		return parseFloat(raw);
	}

	function getPageStripeMetrics() {
		const isDesktopStripe = window.matchMedia("(min-width: 767.98px)").matches;

		return {
			period: readStripeToken(isDesktopStripe ? "--page-stripe-period" : "--page-stripe-sm-period"),
			darkEnd: readStripeToken(isDesktopStripe ? "--page-stripe-dark-end" : "--page-stripe-sm-dark-end"),
			gap: readStripeToken(isDesktopStripe ? "--page-stripe-gap" : "--page-stripe-sm-gap"),
		};
	}

	function isPageGreenStripeArea(viewportX, origin, period, darkEnd, gap) {
		const pos = (((viewportX - origin) % period) + period) % period;
		return pos >= gap && pos < darkEnd;
	}

	function updateContactsStripeFill() {
		const body = document.querySelector(".contacts__body");
		if (!body) return;

		if (!window.matchMedia("(min-width: 1199.98px)").matches) {
			body.classList.remove("contacts__body--stripe-before", "contacts__body--stripe-after");
			return;
		}

		const { period, darkEnd, gap } = getPageStripeMetrics();
		const pageLeft = document.querySelector(".page")?.getBoundingClientRect().left ?? 0;
		const rect = body.getBoundingClientRect();

		body.classList.toggle("contacts__body--stripe-before", isPageGreenStripeArea(rect.left, pageLeft, period, darkEnd, gap));
		body.classList.toggle("contacts__body--stripe-after", isPageGreenStripeArea(rect.right, pageLeft, period, darkEnd, gap));
	}

	function initContactsStripeFill() {
		const body = document.querySelector(".contacts__body");
		if (!body) return;

		let resizeTimer = 0;

		const scheduleUpdate = () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				if (typeof ScrollTrigger !== "undefined") {
					ScrollTrigger.refresh(false);
				}

				updateContactsStripeFill();
			}, 50);
		};

		updateContactsStripeFill();
		window.addEventListener("resize", scheduleUpdate);

		window.matchMedia("(min-width: 1199.98px)").addEventListener("change", scheduleUpdate);

		if (typeof ResizeObserver !== "undefined") {
			const row = body.closest(".contacts__row");
			const observer = new ResizeObserver(scheduleUpdate);
			observer.observe(body);
			if (row) observer.observe(row);
		}
	}

	// contacts reveal
	const contactsEl = document.querySelector(".contacts");

	if (contactsEl && !reducedMotion) {
		const contactsDesktopLayout = window.matchMedia("(min-width: 1199.98px)").matches;
		const contactsTitle = contactsEl.querySelector(".contacts__head-title");
		const contactsBody = contactsEl.querySelector(".contacts__body");
		const contactsTexts = [...contactsEl.querySelectorAll(".contacts__text .text")].filter((el) => !el.classList.contains("contacts__farewell"));
		const contactsFarewell = contactsEl.querySelector(".contacts__farewell");
		const contactsItems = contactsEl.querySelectorAll(".contacts__list > li");

		if (contactsTitle) {
			gsap.set(contactsTitle, contactsDesktopLayout ? { opacity: 0 } : { xPercent: -40, opacity: 0 });
		}

		if (contactsBody) gsap.set(contactsBody, { clipPath: "inset(0 100% 0 0)" });
		if (contactsTexts.length) gsap.set(contactsTexts, { y: 28, opacity: 0 });
		if (contactsFarewell) gsap.set(contactsFarewell, { y: 20, opacity: 0 });
		if (contactsItems.length) gsap.set(contactsItems, { x: 36, opacity: 0 });

		const finishContactsReveal = () => {
			if (contactsTitle) gsap.set(contactsTitle, { clearProps: "transform,opacity" });
			if (contactsBody) gsap.set(contactsBody, { clearProps: "clipPath" });
			updateContactsStripeFill();
		};

		const contactsTl = gsap.timeline({
			onComplete: finishContactsReveal,
			scrollTrigger: {
				trigger: contactsEl,
				start: "top 75%",
				once: true,
			},
		});

		if (contactsTitle) {
			contactsTl.to(
				contactsTitle,
				{
					...(contactsDesktopLayout ? {} : { xPercent: 0 }),
					opacity: 1,
					duration: 0.9,
					ease: "power3.out",
				},
				0,
			);
		}

		if (contactsBody) {
			contactsTl.to(
				contactsBody,
				{
					clipPath: "inset(0 0% 0 0)",
					duration: 0.95,
					ease: "power2.inOut",
				},
				0.12,
			);
		}

		if (contactsItems.length) {
			contactsTl.to(
				contactsItems,
				{
					x: 0,
					opacity: 1,
					duration: 0.55,
					stagger: 0.09,
					ease: "power2.out",
				},
				0.4,
			);
		}

		if (contactsTexts.length) {
			contactsTl.to(
				contactsTexts,
				{
					y: 0,
					opacity: 1,
					duration: 0.55,
					stagger: 0.12,
					ease: "power2.out",
				},
				0.4,
			);
		}

		if (contactsFarewell) {
			contactsTl.to(
				contactsFarewell,
				{
					y: 0,
					opacity: 1,
					duration: 0.65,
					ease: "back.out(1.2)",
				},
				"-=0.15",
			);
		}

		const runContactsInViewCheck = () => {
			ScrollTrigger.refresh();

			if (contactsEl.getBoundingClientRect().top < window.innerHeight * 0.75) {
				contactsTl.progress(1);
				finishContactsReveal();
			}
		};

		if (location.hash === "#contacts") {
			contactsEl.scrollIntoView();
		}

		runContactsInViewCheck();
		requestAnimationFrame(runContactsInViewCheck);
	}

	let exhibitionsSwiper = null;
	let interiorSwiper = null;
	const exhibitionsPanels = document.querySelector("[data-exhibitions-panels]");
	const exhibitionsFilters = document.querySelector("[data-exhibitions-filters]");
	const exhibitionsInteriorCta = exhibitionsFilters?.querySelector('[data-exhibitions-view="interior"]');
	const exhibitionsSlider = document.querySelector("[data-exhibitions-slider]");
	const interiorSlider = document.querySelector("[data-interior-slider]");
	const exhibitionsSlides = exhibitionsSlider ? [...exhibitionsSlider.querySelectorAll(".exhibitions-slide")] : [];

	function getExhibitionsPaginationItems(current, total) {
		if (total <= 0) return [];

		if (total <= 5) {
			return Array.from({ length: total }, (_, index) => index + 1);
		}

		if (current <= 3) {
			return [1, 2, 3, "ellipsis", total];
		}

		if (current >= total - 2) {
			return [1, "ellipsis", total - 2, total - 1, total];
		}

		return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
	}

	function renderExhibitionsPagination(current, total) {
		return getExhibitionsPaginationItems(current, total)
			.map((item) => {
				if (item === "ellipsis") {
					return '<span class="swiper-pagination-ellipsis" aria-hidden="true">…</span>';
				}

				const isActive = item === current;
				const activeClass = isActive ? " swiper-pagination-bullet-active" : "";
				const currentAttr = isActive ? ' aria-current="true"' : "";

				return `<button type="button" class="swiper-pagination-bullet${activeClass}" data-index="${item}" aria-label="Слайд ${item}"${currentAttr}></button>`;
			})
			.join("");
	}

	function getExhibitionsCoverflowOptions(wrap) {
		const pagination = wrap?.querySelector(".exhibitions-slider__pagination");
		const prevEl = wrap?.querySelector(".exhibitions-slider__prev");
		const nextEl = wrap?.querySelector(".exhibitions-slider__next");

		return {
			effect: "coverflow",
			grabCursor: true,
			centeredSlides: true,
			initialSlide: 1,
			spaceBetween: 24,
			slidesPerView: "auto",
			watchOverflow: true,
			coverflowEffect: {
				rotate: 0,
				stretch: 0,
				depth: 300,
				modifier: 1,
				slideShadows: false,
			},
			breakpoints: {
				767.98: {
					spaceBetween: 40,
				},
				1199.98: {
					spaceBetween: 160,
				},
			},
			navigation: {
				prevEl,
				nextEl,
			},
			pagination: pagination
				? {
						el: pagination,
						type: "custom",
						renderCustom(_swiper, current, total) {
							return renderExhibitionsPagination(current, total);
						},
					}
				: undefined,
		};
	}

	if (exhibitionsSlider && typeof Swiper !== "undefined") {
		const wrap = exhibitionsSlider.closest(".exhibitions-slider__wrap");
		exhibitionsSwiper = new Swiper(exhibitionsSlider, getExhibitionsCoverflowOptions(wrap));
		exhibitionsSwiper.on("slideChange", closeExhibitionsSlideInfo);
	}

	if (interiorSlider && typeof Swiper !== "undefined") {
		const wrap = interiorSlider.closest(".exhibitions-slider__wrap");
		interiorSwiper = new Swiper(interiorSlider, getExhibitionsCoverflowOptions(wrap));
	}

	function closeExhibitionsSlideInfo() {
		exhibitionsSlider?.querySelectorAll(".exhibitions-slide.is-open").forEach((item) => {
			item.classList.remove("is-open");
			item.querySelector(".exhibitions-slide__flag")?.setAttribute("aria-expanded", "false");
		});
	}

	function applyExhibitionsCityFilter(city) {
		if (!exhibitionsSlider || !exhibitionsSwiper) return;

		const nextSlides = city ? exhibitionsSlides.filter((slide) => slide.getAttribute("data-city") === city) : exhibitionsSlides.slice();

		exhibitionsSwiper.removeAllSlides();
		if (nextSlides.length) exhibitionsSwiper.appendSlide(nextSlides);
		exhibitionsSwiper.slideTo(0, 0);
		closeExhibitionsSlideInfo();
	}

	function setExhibitionsView(view) {
		if (!exhibitionsPanels) return;

		const isInterior = view === "interior";
		const exhibitionsPanel = exhibitionsPanels.querySelector('[data-panel="exhibitions"]');
		const interiorPanel = exhibitionsPanels.querySelector('[data-panel="interior"]');

		exhibitionsPanels.classList.toggle("is-interior", isInterior);

		if (exhibitionsPanel) {
			exhibitionsPanel.classList.toggle("is-active", !isInterior);
			exhibitionsPanel.hidden = isInterior;
		}

		if (interiorPanel) {
			interiorPanel.classList.toggle("is-active", isInterior);
			interiorPanel.hidden = !isInterior;
		}

		if (exhibitionsInteriorCta) {
			exhibitionsInteriorCta.classList.toggle("is-active", isInterior);
			exhibitionsInteriorCta.setAttribute("aria-pressed", isInterior ? "true" : "false");
		}

		if (isInterior) {
			exhibitionsFilters?.querySelectorAll(".exhibitions-hero__chip").forEach((chip) => {
				chip.classList.remove("is-active");
				chip.setAttribute("aria-pressed", "false");
			});
			applyExhibitionsCityFilter("");
			requestAnimationFrame(() => {
				interiorSwiper?.update();
				interiorSwiper?.slideTo(0, 0);
			});
			return;
		}

		requestAnimationFrame(() => {
			exhibitionsSwiper?.update();
		});
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

	function formatCustomSelectTooltipText(labels) {
		if (!labels.length) return "";

		const parts = labels
			.map((label, index) => {
				const text = label.trim();
				if (!text) return "";

				if (index === 0) {
					return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
				}

				return text.toLowerCase();
			})
			.filter(Boolean);

		return `${parts.join(", ")}.`;
	}

	function hideCustomSelectTooltip(root) {
		root?.classList.remove("is-tooltip-visible");
	}

	function showCustomSelectTooltip(root) {
		if (!root) return;

		if (root.classList.contains("is-value-overflow") && root.classList.contains("has-value") && !root.classList.contains("is-open")) {
			root.classList.add("is-tooltip-visible");
		}
	}

	function updateCustomSelectValueOverflow(root) {
		if (!isMultiCustomSelect(root)) return;

		const valueEl = root.querySelector(".custom-select__value");
		const tooltipEl = root.querySelector(".custom-select__tooltip");
		const trigger = root.querySelector(".custom-select__trigger");
		if (!valueEl || !tooltipEl || !trigger) return;

		const values = getAppliedCustomSelectValues(root);
		const labels = values.map((value) => getCustomSelectOptionLabel(root, value)).filter(Boolean);

		requestAnimationFrame(() => {
			const isOverflowing = values.length > 0 && valueEl.scrollWidth > valueEl.clientWidth;
			root.classList.toggle("is-value-overflow", isOverflowing);

			if (isOverflowing) {
				tooltipEl.textContent = formatCustomSelectTooltipText(labels);
				tooltipEl.hidden = false;
				trigger.setAttribute("aria-describedby", tooltipEl.id);
				return;
			}

			tooltipEl.textContent = "";
			tooltipEl.hidden = true;
			trigger.removeAttribute("aria-describedby");
			hideCustomSelectTooltip(root);
		});
	}

	function setupCustomSelectTooltip(root) {
		if (!isMultiCustomSelect(root)) return;

		const trigger = root.querySelector(".custom-select__trigger");
		const hoverTarget = root.querySelector(".custom-select__trigger-wrap") || trigger;
		const valueEl = root.querySelector(".custom-select__value");
		if (!trigger || !hoverTarget || hoverTarget.dataset.tooltipBound === "true") return;

		hoverTarget.dataset.tooltipBound = "true";
		hoverTarget.addEventListener("mouseenter", () => showCustomSelectTooltip(root));
		hoverTarget.addEventListener("mouseleave", () => hideCustomSelectTooltip(root));
		trigger.addEventListener("focus", () => showCustomSelectTooltip(root));
		trigger.addEventListener("blur", () => hideCustomSelectTooltip(root));

		if (valueEl && typeof ResizeObserver !== "undefined") {
			const observer = new ResizeObserver(() => updateCustomSelectValueOverflow(root));
			observer.observe(valueEl);
			observer.observe(trigger);
			if (hoverTarget !== trigger) observer.observe(hoverTarget);
		}

		updateCustomSelectValueOverflow(root);
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
		updateCustomSelectValueOverflow(root);
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
		hideCustomSelectTooltip(root);
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

		hideCustomSelectTooltip(root);
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
				updateCustomSelectValueOverflow(root);
			}
		}

		setupCustomSelectTooltip(root);
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
		ScrollTrigger.refresh();
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
		const imgs = [...galleryRoot.querySelectorAll(".gallery-item__img")];
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		function revealGalleryImage(img) {
			if (img.classList.contains("is-loaded")) return;
			img.classList.add("is-loaded");

			if (reducedMotion) {
				gsap.set(img, { opacity: 1, y: 0 });
				return;
			}

			gsap.fromTo(
				img,
				{ opacity: 0, y: 40 },
				{
					opacity: 1,
					y: 0,
					duration: 1.5,
					ease: "power3.out",
				},
			);
		}

		imgs.forEach((img) => {
			if (img.classList.contains("is-loaded")) return;

			if (img.complete && img.naturalWidth > 0) {
				revealGalleryImage(img);
				return;
			}

			img.addEventListener("load", () => revealGalleryImage(img), { once: true });
			img.addEventListener("error", () => revealGalleryImage(img), { once: true });
		});

		if (reducedMotion) {
			gsap.set(items, { opacity: 1, clearProps: "transform" });
			imgs.forEach((img) => {
				img.classList.add("is-loaded");
				gsap.set(img, { opacity: 1, y: 0 });
			});
			return;
		}

		gsap.set(items, { y: 16 });
		gsap.set(
			imgs.filter((img) => !img.classList.contains("is-loaded")),
			{ y: 40 },
		);

		ScrollTrigger.batch(items, {
			start: "top 88%",
			once: true,
			onEnter(batch) {
				const sorted = [...batch].sort((a, b) => {
					const aRect = a.getBoundingClientRect();
					const bRect = b.getBoundingClientRect();
					const rowDelta = aRect.top - bRect.top;
					if (Math.abs(rowDelta) > 12) return rowDelta;
					return aRect.left - bRect.left;
				});

				gsap.to(sorted, {
					opacity: 1,
					y: 0,
					duration: 0.85,
					stagger: 0.08,
					ease: "power3.out",
					overwrite: true,
				});
			},
		});
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

		if (header?.classList.contains("is-menu-open") && !target.closest(".header__mobile") && !target.closest(".header__burger")) {
			closeMobileMenu();
		}

		const exhibitionsPaginationBullet = target.closest(".exhibitions-slider__pagination .swiper-pagination-bullet[data-index]");
		if (exhibitionsPaginationBullet) {
			const wrap = exhibitionsPaginationBullet.closest(".exhibitions-slider__wrap");
			const swiperInstance = wrap?.querySelector(".swiper")?.swiper;
			const index = Number(exhibitionsPaginationBullet.getAttribute("data-index")) - 1;

			if (swiperInstance && Number.isFinite(index)) {
				swiperInstance.slideTo(index);
			}
			return;
		}

		const exhibitionsChip = target.closest("[data-exhibitions-filters] .exhibitions-hero__chip");
		if (exhibitionsChip) {
			const filters = exhibitionsChip.closest("[data-exhibitions-filters]");
			const city = exhibitionsChip.getAttribute("data-city") || "";
			const isActive = exhibitionsChip.classList.contains("is-active");

			setExhibitionsView("exhibitions");

			filters?.querySelectorAll(".exhibitions-hero__chip").forEach((chip) => {
				chip.classList.remove("is-active");
				chip.setAttribute("aria-pressed", "false");
			});

			if (!isActive && city) {
				exhibitionsChip.classList.add("is-active");
				exhibitionsChip.setAttribute("aria-pressed", "true");
				applyExhibitionsCityFilter(city);
			} else {
				applyExhibitionsCityFilter("");
			}
		}

		const exhibitionsViewCta = target.closest('[data-exhibitions-view="interior"]');
		if (exhibitionsViewCta) {
			const isActive = exhibitionsViewCta.classList.contains("is-active");
			setExhibitionsView(isActive ? "exhibitions" : "interior");
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

		const infoFlag = target.closest(".gallery-item__flag, .exhibitions-slide__flag");
		if (infoFlag) {
			e.preventDefault();
			const item = infoFlag.closest(".gallery-item, .exhibitions-slide");
			if (!item) return;

			const isOpen = item.classList.contains("is-open");
			const flagSelector = item.classList.contains("exhibitions-slide") ? ".exhibitions-slide__flag" : ".gallery-item__flag";
			const openSelector = item.classList.contains("exhibitions-slide") ? ".exhibitions-slide.is-open" : ".gallery-item.is-open";

			document.querySelectorAll(openSelector).forEach((openItem) => {
				openItem.classList.remove("is-open");
				openItem.querySelector(flagSelector)?.setAttribute("aria-expanded", "false");
			});

			if (!isOpen) {
				item.classList.add("is-open");
				infoFlag.setAttribute("aria-expanded", "true");
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
		if (window.matchMedia("(min-width: 767.98px)").matches) {
			closeMobileMenu(true);
		}

		document.querySelectorAll(".custom-select--multiple").forEach((root) => {
			updateCustomSelectValueOverflow(root);
		});
	});

	initContactsStripeFill();
});

if (typeof Fancybox !== "undefined") {
	Fancybox.bind("[data-fancybox]", {
		autoFocus: true,
		dragToClose: (fancybox) => fancybox.getSlide()?.type !== "inline",
		closeButton: false,
		zoomEffect: (fancybox) => {
			const slide = fancybox.getSlide();
			if (!slide || slide.zoomEffect === false) return false;
			const src = slide.src || "";
			const thumb = slide.thumbSrc || slide.thumbEl?.getAttribute?.("src") || "";
			return !thumb || !src || thumb === src;
		},
	});
}
