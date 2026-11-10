import { solarCycle } from "./views/solar-cycle.js";
import { flashLightning } from "./views/sky-atmosphere.js";
import { App } from "./app/app-controller.js";
import { WeatherEngine as W } from "./engine/weather-engine.js";
import { LOCATIONS } from "./data/world-data.js";
const el = (id) => document.getElementById(id);
for (const [key, loc] of Object.entries(LOCATIONS)) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = loc.name;
  el("location").append(option);
}
let weather, playing;
function render() {
  const [y, m, d] = el("date").value.split("-").map(Number);
  if (!y) return;
  const minute = Number(el("time").value);
  const date = new Date(y, m - 1, d, 0, minute);
  weather = W.getCurrentWeather(date, el("location").value);
  const night =
    minute < weather.sunriseMinutes || minute >= weather.sunsetMinutes;
  const scenario = el("condition").value;
  if (scenario !== "forecast") {
    weather.conditionKey =
      scenario.includes("_") && /_(day|night)$/.test(scenario)
        ? scenario
        : scenario + (night ? "_night" : "_day");
    weather.cloudCover = ["clear", "hot_day", "cold_night"].includes(scenario)
      ? 0
      : scenario === "cloudy"
        ? 45
        : 100;
  }
  const phase = el("phase").value;
  if (phase !== "forecast") {
    const index = phase === "blood" ? 4 : Number(phase);
    weather.moon = {
      ...weather.moon,
      illumination: index <= 4 ? index * 25 : (8 - index) * 25,
      ageDays: (index * 29.530588) / 8,
      isBloodMoon: phase === "blood",
    };
  }
  if (el("custom-orbit").checked) {
    weather.moonrise = el("moonrise").value;
    weather.moonset = el("moonset").value;
  }
  App.state.currentDate = date;
  App.applyWeatherFx(weather);
  el("clock").textContent =
    String(Math.floor(minute / 60)).padStart(2, "0") +
    ":" +
    String(minute % 60).padStart(2, "0");
  el("summary").textContent = solarCycle(
    minute,
    weather.sunriseMinutes,
    weather.sunsetMinutes,
  ).label;
  el("lunar").textContent =
    "Lua: " +
    weather.moon.illumination +
    "% iluminada · Nascer: " +
    weather.moonrise +
    " · Ocaso: " +
    weather.moonset;
  el("notice").textContent =
    phase === "blood" && date.getHours() > 3
      ? "A Lua de Sangue fica ativa entre 00h e 03h. Ajuste o horário para testar."
      : "A Lua aparece à noite, acima do horizonte e com céu favorável. Fases forçadas são apenas para esta prévia.";
  el("solar").textContent =
    "Nascer do Sol: " + weather.sunrise + " · Pôr do Sol: " + weather.sunset;
}
for (const id of [
  "date",
  "location",
  "condition",
  "time",
  "phase",
  "custom-orbit",
  "moonrise",
  "moonset",
])
  el(id).addEventListener("input", render);
el("dawn").onclick = () => {
  el("time").value = weather.sunriseMinutes - 15;
  render();
};
el("dusk").onclick = () => {
  el("time").value = weather.sunsetMinutes - 15;
  render();
};
el("night").onclick = () => {
  el("time").value = 1320;
  el("condition").value = "clear";
  render();
};
el("play").onclick = () => {
  if (playing) {
    clearInterval(playing);
    playing = null;
    el("play").textContent = "Reproduzir";
  } else {
    playing = setInterval(() => {
      el("time").value =
        (Number(el("time").value) + Number(el("speed").value)) % 1440;
      render();
    }, 500);
    el("play").textContent = "Pausar";
  }
};
el("meteor").onclick = () => {
  if (
    !document.body.classList.contains("fx-stars") ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const meteor = document.createElement("i");
  meteor.className = "shooting-star";
  meteor.style.left = "45%";
  meteor.style.top = "12%";
  document.getElementById("weather-bg").append(meteor);
  setTimeout(() => meteor.remove(), 1800);
};
el("fullmoon").onclick = () => {
  el("phase").value = "forecast";
  el("custom-orbit").checked = false;
  const [y, m, d] = el("date").value.split("-").map(Number);
  for (let i = 0; i < 31; i++) {
    const date = new Date(y, m - 1, d + i, 22);
    if (
      W.getWeatherForDay(date, el("location").value).moon.illumination === 100
    ) {
      el("date").value =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");
      break;
    }
  }
  el("time").value = 1320;
  el("condition").value = "clear";
  render();
};
render();

const clockMinutes = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};
function jumpMoon(part) {
  const start = clockMinutes(weather.moonrise);
  const duration = (clockMinutes(weather.moonset) - start + 1440) % 1440;
  el("time").value = Math.round((start + duration * part) % 1440);
  render();
}
el("moon-start").onclick = () => jumpMoon(0.03);
el("moon-top").onclick = () => jumpMoon(0.5);
el("moon-end").onclick = () => jumpMoon(0.97);
el("noon").onclick = () => {
  el("time").value = 720;
  render();
};
el("hide-panel").onclick = () => {
  document.querySelector("main").hidden = true;
  el("show-panel").hidden = false;
};
el("show-panel").onclick = () => {
  document.querySelector("main").hidden = false;
  el("show-panel").hidden = true;
};

el("condition").addEventListener("change", () => {
  if (el("condition").value === "hot_day") el("time").value = 840;
  if (el("condition").value === "cold_night") el("time").value = 60;
  render();
});

el("lightning").onclick = () =>
  flashLightning(document.getElementById("weather-bg"));

el("solar-stage").onchange = () => {
  const value = el("solar-stage").value;
  const [anchor, offset] = value.split(":");
  el("time").value =
    anchor === "noon"
      ? Math.round((weather.sunriseMinutes + weather.sunsetMinutes) / 2)
      : (anchor === "rise" ? weather.sunriseMinutes : weather.sunsetMinutes) +
        Number(offset);
  render();
};
