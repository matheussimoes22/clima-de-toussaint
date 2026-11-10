export function solarPosition(minute, sunrise, sunset) {
  const progress = Math.max(
    0,
    Math.min(1, (minute - sunrise) / (sunset - sunrise)),
  );
  return {
    x: 5 + 90 * progress,
    y: 100 - 85 * Math.sin(Math.PI * progress),
    horizon: 1 - Math.sin(Math.PI * progress),
    visible: minute >= sunrise && minute <= sunset,
  };
}
export function updateBackdropSun(root, weather, date) {
  let sun = root.querySelector(".sky-sun");
  if (!sun) {
    sun = document.createElement("div");
    sun.className = "sky-sun";
    sun.setAttribute("aria-hidden", "true");
    sun.innerHTML =
      '<div class="sky-sun-aura"></div><div class="sky-sun-ring"></div><div class="sky-sun-disc"></div>';
    root.prepend(sun);
  }
  const minute =
    date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const position = solarPosition(
    minute,
    weather.sunriseMinutes,
    weather.sunsetMinutes,
  );
  sun.style.left = position.x + "%";
  sun.style.top =
    "calc(" +
    position.y +
    "% + " +
    position.horizon +
    " * var(--sun-size) / 2)";
  const covered = /overcast|rain|storm|snow|fog/.test(weather.conditionKey);
  sun.style.opacity =
    position.visible && !covered
      ? weather.cloudCover > 28
        ? ".4"
        : ".9"
      : "0";
  sun.classList.toggle("sky-sun--low", position.horizon > 0.65);
}
