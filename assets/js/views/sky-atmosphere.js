export function skyMood(weather) {
  const key = weather.conditionKey || "";
  const night = key.endsWith("_night");
  const wet = /rain|storm|snow|fog|overcast/.test(key);
  const hot =
    !night &&
    !wet &&
    (key === "hot_day" ||
      ((weather.currentTemp ?? 0) >= 32 && weather.heatWaveBonus > 0));
  return hot ? "heat" : night ? "night" : wet ? "muted" : "day";
}
let stormTimer;
let activeRoot;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function flashLightning(root = activeRoot) {
  if (!root || root.dataset.sky !== "storm" || document.hidden || reduced())
    return;
  const strike = document.createElement("div");
  strike.className = "sky-lightning";
  strike.style.setProperty("--strike-x", 15 + Math.random() * 70 + "%");
  strike.style.setProperty("--strike-flip", Math.random() > 0.5 ? "-1" : "1");
  strike.innerHTML =
    '<svg viewBox="0 0 120 260" aria-hidden="true"><path d="M72 0 L48 64 L69 58 L35 125 L59 115 L22 209 L43 158 L32 171 L71 88 L51 98 L89 18"/><path class="lightning-branch" d="M47 105 L91 141 L79 157 L110 188 M40 151 L9 176"/></svg>';
  root.append(strike);
  setTimeout(() => strike.remove(), 1300);
}
export function updateAtmosphere(root, weather) {
  activeRoot = root;
  const key = weather.conditionKey || "";
  const kind = key.replace(/_(day|night)$/, "");
  root.dataset.sky = kind;
  root.dataset.dark = String(key.endsWith("_night"));
  root.dataset.mood = skyMood(weather);
  document.body.dataset.skyMood = root.dataset.mood;
  let layer = root.querySelector(".sky-atmosphere");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "sky-atmosphere";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="sky-clouds">' +
      Array.from(
        { length: 6 },
        (_, i) =>
          '<i class="sky-cloud" style="--i:' +
          i +
          '"><svg viewBox="0 0 520 210" preserveAspectRatio="none"><defs><linearGradient id="cloud-tone-' +
          i +
          '" x2="0" y2="1"><stop stop-color="#fff9ec"/><stop offset=".5" stop-color="#e2e8ef"/><stop offset="1" stop-color="#8195ac"/></linearGradient></defs><path fill="url(#cloud-tone-' +
          i +
          ')" d="M55 176 C13 176 8 139 28 121 C32 100 55 88 77 97 C78 68 105 52 133 60 C146 13 208 6 235 48 C266 20 316 39 326 75 C361 55 399 73 405 101 C436 89 464 105 464 126 C502 121 519 157 492 174 C461 195 94 197 55 176Z"/><path fill="#fff" opacity=".2" d="M88 105 C90 72 122 64 145 80 C160 36 204 27 230 61 C195 53 181 73 169 99 C139 87 118 94 88 105Z"/></svg></i>',
      ).join("") +
      '</div><div class="sky-mist"></div><div class="sky-rain-depth"></div><div class="sky-snowflakes"></div><div class="sky-sunbeams"></div>';
    const snow = layer.querySelector(".sky-snowflakes");
    for (let i = 0; i < 24; i++) {
      const flake = document.createElement("span");
      flake.className = "sky-snowflake";
      flake.style.cssText =
        "left:" +
        ((i * 37) % 100) +
        "%;--size:" +
        (9 + ((i * 7) % 15)) +
        "px;--duration:" +
        (12 + ((i * 3) % 17)) +
        "s;--delay:-" +
        ((i * 13) % 29) +
        "s;--drift:" +
        (-45 + ((i * 17) % 90)) +
        "px";
      flake.innerHTML =
        '<svg viewBox="0 0 32 32"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">' +
        [0, 60, 120, 180, 240, 300]
          .map(
            (angle) =>
              '<path transform="rotate(' +
              angle +
              ' 16 16)" d="M16 16 V3 M16 8 L12 5 M16 8 L20 5 M16 12 L12 9 M16 12 L20 9"/>',
          )
          .join("") +
        "</g></svg>";
      snow.append(flake);
    }
    const heat = document.createElement("div");
    heat.className = "sky-heat-waves";
    heat.innerHTML = "<i></i><i></i><i></i>";
    layer.append(heat);
    const warmth = document.createElement("div");
    warmth.className = "sky-warmth";
    layer.prepend(warmth);
    root.append(layer);
  }
  const cover =
    kind === "clear" || kind === "hot"
      ? 0
      : Math.min(100, weather.cloudCover ?? (kind === "cloudy" ? 45 : 95));
  layer.style.setProperty("--cloud-opacity", String(cover / 100));
  layer.style.setProperty(
    "--cloud-speed",
    Math.max(25, 85 - (weather.windSpeed || 0)) + "s",
  );
  if (kind === "storm" && !stormTimer) {
    const schedule = (first = false) => {
      stormTimer = setTimeout(
        () => {
          stormTimer = null;
          if (activeRoot?.dataset.sky === "storm") {
            flashLightning();
            schedule();
          }
        },
        first ? 1200 : 4500 + Math.random() * 5500,
      );
    };
    schedule(true);
  } else if (kind !== "storm" && stormTimer) {
    clearTimeout(stormTimer);
    stormTimer = null;
  }
}
