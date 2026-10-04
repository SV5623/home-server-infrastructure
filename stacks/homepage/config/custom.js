(() => {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  const STORAGE_KEYS = {
    dark: "homepage-dark-background-index",
    light: "homepage-light-background-index",
  };

  const CHANGE_INTERVAL = 60 * 60 * 1000; // 60 хвилин

  let currentTheme = null;
  let backgrounds = [];
  let currentIndex = 0;

  function isDarkMode() {
    return document.documentElement.classList.contains("dark");
  }

  function getThemeName() {
    return isDarkMode() ? "dark" : "light";
  }

  function getBackgroundElement() {
    return document.querySelector("#background");
  }

  function imageExists(url) {
    return new Promise((resolve) => {
      const image = new Image();

      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);

      image.src = url;
    });
  }

  async function discoverBackgrounds(theme) {
  const found = [];

  const checks = [];

  // Перевіряємо back-0 ... back-30 паралельно
  for (let index = 0; index < 30; index++) {
    for (const extension of imageExtensions) {
      const url = `/images/${theme}/back-${index}${extension}`;

      checks.push(
        imageExists(url).then((exists) => ({
          index,
          url,
          exists,
        }))
      );
    }
  }

  const results = await Promise.all(checks);

  // Залишаємо тільки знайдені файли
  const foundByIndex = new Map();

  for (const result of results) {
    if (result.exists && !foundByIndex.has(result.index)) {
      foundByIndex.set(result.index, result.url);
    }
  }

  // Сортуємо за номером back-0, back-1, back-2...
  return [...foundByIndex.entries()]
    .sort(([indexA], [indexB]) => indexA - indexB)
    .map(([, url]) => url);
}

  function loadSavedIndex(theme, total) {
    const savedIndex = Number(
      localStorage.getItem(STORAGE_KEYS[theme]) || 0
    );

    if (
      !Number.isInteger(savedIndex) ||
      savedIndex < 0 ||
      savedIndex >= total
    ) {
      return 0;
    }

    return savedIndex;
  }

  function saveCurrentIndex() {
    if (!currentTheme) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS[currentTheme],
      String(currentIndex)
    );
  }

  function applyBackground() {
    const element = getBackgroundElement();

    if (!element || !backgrounds.length) {
      return;
    }

    const image = backgrounds[currentIndex];

    element.style.setProperty(
      "background-image",
      `linear-gradient(
        rgb(var(--bg-color) / 0.45),
        rgb(var(--bg-color) / 0.45)
      ), url("${image}")`,
      "important"
    );

    element.style.setProperty(
      "background-size",
      "cover",
      "important"
    );

    element.style.setProperty(
      "background-position",
      "center",
      "important"
    );

    element.style.setProperty(
      "background-repeat",
      "no-repeat",
      "important"
    );

    saveCurrentIndex();
    updateButtonTitle();
  }

  function updateButtonTitle() {
    const button = document.querySelector(
      "#custom-background-button"
    );

    if (!button || !backgrounds.length) {
      return;
    }

    button.title =
      `Змінити фон (${currentTheme}: ${currentIndex + 1}/${backgrounds.length})`;
  }

  async function switchThemeBackground() {
    const newTheme = getThemeName();

    if (newTheme === currentTheme) {
      return;
    }

    currentTheme = newTheme;
    backgrounds = await discoverBackgrounds(currentTheme);

    console.log(
      `[Homepage] ${currentTheme} backgrounds:`,
      backgrounds
    );

    if (!backgrounds.length) {
      console.warn(
        `[Homepage] Не знайдено фони для теми: ${currentTheme}`
      );
      return;
    }

    currentIndex = loadSavedIndex(
      currentTheme,
      backgrounds.length
    );

    applyBackground();
  }

  function nextBackground() {
    if (!backgrounds.length) {
      return;
    }

    currentIndex =
      (currentIndex + 1) % backgrounds.length;

    applyBackground();
  }

  function createButton() {
    if (
      document.querySelector("#custom-background-button")
    ) {
      return;
    }

    const button = document.createElement("button");

    button.id = "custom-background-button";
    button.type = "button";
    button.textContent = "🖼️";
    button.title = "Змінити фон";

    Object.assign(button.style, {
      position: "fixed",
      right: "80px",
      bottom: "24px",
      zIndex: "9999",
      width: "42px",
      height: "42px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "12px",
      background: "rgba(30, 41, 59, 0.85)",
      color: "#ffffff",
      fontSize: "20px",
      cursor: "pointer",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
      transition:
        "transform 0.2s ease, background 0.2s ease",
    });

    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.08)";
      button.style.background =
        "rgba(51, 65, 85, 0.95)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
      button.style.background =
        "rgba(30, 41, 59, 0.85)";
    });

    button.addEventListener("click", nextBackground);

    document.body.appendChild(button);
  }

  async function init() {
    createButton();

    await switchThemeBackground();

    // Автоматична зміна кожні 60 хвилин
    setInterval(nextBackground, CHANGE_INTERVAL);

    // Homepage додає/прибирає class="dark" на <html>
    const observer = new MutationObserver(() => {
      switchThemeBackground();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
