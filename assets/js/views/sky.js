import { solarCycle } from "./solar-cycle.js";
import { updateBackdropSun } from "./sky-sun.js";
import { updateAtmosphere } from "./sky-atmosphere.js";
import { updateBackdropMoon } from "./sky-moon.js";
let timer;
let lastCondition;
export function updateSky(weather, date) {
  const root = document.getElementById("weather-bg");
  if (!root) return;
  if (
    lastCondition &&
    lastCondition !== weather.conditionKey &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const fade = document.createElement("div");
    fade.className = "sky-crossfade";
    fade.style.background = getComputedStyle(root).background;
    root.append(fade);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        fade.style.opacity = "0";
      }),
    );
    setTimeout(() => fade.remove(), 2200);
  }
  lastCondition = weather.conditionKey;
  let glow = document.getElementById("solar-glow");
  if (!glow) {
    glow = document.createElement("div");
    glow.id = "solar-glow";
    glow.setAttribute("aria-hidden", "true");
    root.append(glow);
  }
  updateBackdropSun(root, weather, date);
  updateBackdropMoon(root, weather, date);
  updateAtmosphere(root, weather);
  const minute =
    date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const cycle = solarCycle(
    minute,
    weather.sunriseMinutes,
    weather.sunsetMinutes,
  );
  root.style.setProperty("--solar-base", cycle.background);
  root.dataset.solarPhase = cycle.label;
  root.style.setProperty("--overcast-base", cycle.overcastBackground);
  root.style.setProperty("--star-visibility", String(cycle.stars));
  root.style.setProperty("--day-warmth", String(cycle.daylight));
  const distance = Math.min(
    Math.abs(minute - weather.sunriseMinutes),
    Math.abs(minute - weather.sunsetMinutes),
  );
  glow.style.opacity = String(
    Math.max(0, 1 - distance / 45) * (weather.cloudCover > 70 ? 0.2 : 0.7),
  );
  if (!timer) {
    const schedule = () => {
      timer = setTimeout(
        () => {
          if (
            !document.hidden &&
            document.body.classList.contains("fx-stars") &&
            !matchMedia("(prefers-reduced-motion: reduce)").matches
          ) {
            const meteor = document.createElement("i");
            meteor.className = "shooting-star";
            meteor.setAttribute("aria-hidden", "true");
            meteor.style.left = 15 + Math.random() * 60 + "%";
            meteor.style.top = 5 + Math.random() * 25 + "%";
            root.append(meteor);
            setTimeout(() => meteor.remove(), 1800);
          }
          schedule();
        },
        20000 + Math.random() * 55000,
      );
    };
    schedule();
  }
}
