const sections = [...document.querySelectorAll("[data-section]")];
const links = [...document.querySelectorAll("[data-nav]")];
const page = document.querySelector("[data-page]");
const rail = document.querySelector(".rail");
const total = String(sections.length).padStart(2, "0");
let current = 0;
let snapLock = false;

function setPage(index) {
  if (page) page.textContent = `${String(index + 1).padStart(2, "0")} / ${total}`;
}

function activateNav(sectionIndex) {
  links.forEach((link) => {
    const target = document.querySelector(link.hash);
    const targetIndex = target ? sections.indexOf(target) : -1;
    link.classList.toggle("active", targetIndex === sectionIndex);
  });
}

function goTo(index, behavior = "smooth") {
  const next = Math.max(0, Math.min(sections.length - 1, index));
  current = next;
  sections[next]?.scrollIntoView({ behavior, block: "start" });
  setPage(next);
  activateNav(next);
}

function nearestIndex() {
  const mid = window.scrollY + window.innerHeight * 0.35;
  let best = 0;
  let bestDist = Infinity;
  sections.forEach((section, i) => {
    const top = section.offsetTop;
    const dist = Math.abs(top - mid + section.offsetHeight * 0.2);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = sections.indexOf(visible.target);
    if (index < 0) return;
    current = index;
    setPage(index);
    activateNav(index);
  },
  { threshold: [0.35, 0.55, 0.7] },
);

sections.forEach((section) => observer.observe(section));
setPage(0);
activateNav(0);

document.querySelector("[data-menu]")?.addEventListener("click", () =>
  rail?.classList.toggle("open"),
);
links.forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    rail?.classList.remove("open");
    const target = document.querySelector(link.hash);
    const index = target ? sections.indexOf(target) : -1;
    if (index !== -1) goTo(index);
  }),
);

window.addEventListener(
  "wheel",
  (event) => {
    // Ctrl/Cmd+wheel → browser (Chrome) zoom; do not intercept
    if (event.ctrlKey || event.metaKey) return;
    if (event.target.closest(".compare, [data-slider], input, textarea, select"))
      return;
    if (Math.abs(event.deltaY) < 18) return;
    event.preventDefault();
    if (snapLock) return;
    snapLock = true;
    current = nearestIndex();
    goTo(current + (event.deltaY > 0 ? 1 : -1));
    window.setTimeout(() => {
      snapLock = false;
    }, 780);
  },
  { passive: false },
);

window.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea, select")) return;
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goTo(nearestIndex() + 1);
  }
  if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goTo(nearestIndex() - 1);
  }
  if (event.key === "Home") goTo(0);
  if (event.key === "End") goTo(sections.length - 1);
});

let touchY = 0;
window.addEventListener(
  "touchstart",
  (event) => {
    touchY = event.touches[0]?.clientY ?? 0;
  },
  { passive: true },
);
window.addEventListener(
  "touchend",
  (event) => {
    const y = event.changedTouches[0]?.clientY ?? touchY;
    const delta = touchY - y;
    if (Math.abs(delta) < 56) return;
    goTo(nearestIndex() + (delta > 0 ? 1 : -1));
  },
  { passive: true },
);

document.querySelectorAll("[data-compare], .compare").forEach((compare) => {
  const slider = compare.querySelector("[data-slider]");
  const before = compare.querySelector("[data-before]");
  const line = compare.querySelector("[data-line]");
  if (!slider) return;

  function applySlider(value) {
    if (before) before.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    if (line) line.style.left = `${value}%`;
  }

  applySlider(Number(slider.value) || 50);
  slider.addEventListener("input", (event) =>
    applySlider(Number(event.target.value)),
  );
});
