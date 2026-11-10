/** Progresso entre nascer e ocaso, incluindo passagens pela meia-noite. */
export function moonOrbit(minute, rise, set) {
  const parse = (value) => {
    const [h, m] = String(value).split(":").map(Number);
    return h * 60 + m;
  };
  const start = parse(rise),
    end = parse(set);
  const duration = (end - start + 1440) % 1440;
  const elapsed = (minute - start + 1440) % 1440;
  if (
    !Number.isFinite(duration) ||
    !Number.isFinite(elapsed) ||
    duration === 0 ||
    elapsed >= duration
  )
    return { visible: false, x: 95, y: 100, horizon: 1, fade: 1 };
  const progress = elapsed / duration;
  return {
    visible: true,
    x: 5 + 90 * progress,
    y: 100 - 85 * Math.sin(Math.PI * progress),
    horizon: 1 - Math.sin(Math.PI * progress),
    fade: 1,
  };
}
/** Lua cenográfica: tamanho aparente estável, área iluminada conforme a previsão. */
export function moonShape(illumination, waning) {
  const lit = Math.max(0, Math.min(100, illumination)) / 100;
  const points = [];
  const side = waning ? -1 : 1;
  for (let i = 0; i <= 64; i++) {
    const y = -1 + i / 32;
    points.push([
      100 + side * 80 * Math.sqrt(Math.max(0, 1 - y * y)),
      100 + 80 * y,
    ]);
  }
  for (let i = 64; i >= 0; i--) {
    const y = -1 + i / 32;
    points.push([
      100 + side * (1 - 2 * lit) * 80 * Math.sqrt(Math.max(0, 1 - y * y)),
      100 + 80 * y,
    ]);
  }
  return (
    points
      .map((p, i) => (i ? "L" : "M") + p.map((n) => n.toFixed(3)).join(" "))
      .join(" ") + " Z"
  );
}
export function updateBackdropMoon(root, weather, date) {
  let host = root.querySelector(".sky-moon");
  if (!host) {
    host = document.createElement("div");
    host.className = "sky-moon";
    host.setAttribute("aria-hidden", "true");
    root.append(host);
  }
  const moon = weather.moon;
  if (!moon) {
    host.style.opacity = "0";
    return;
  }
  const minute =
    date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const night =
    minute < weather.sunriseMinutes || minute >= weather.sunsetMinutes;
  const orbit = moonOrbit(minute, weather.moonrise, weather.moonset);
  host.style.left = orbit.x + "%";
  host.style.top = `calc(${orbit.y}% + ${orbit.horizon} * var(--moon-size) / 2)`;
  const cloud = weather.cloudCover ?? 0;
  const obscured = /rain|storm|snow|fog|overcast/.test(weather.conditionKey);
  const light = Math.max(0, Math.min(100, moon.illumination));
  const blood = moon.isBloodMoon && date.getHours() <= 3;
  const waning = moon.ageDays > 29.530588 / 2;
  const key = [light, waning, blood].join(":");
  if (host.dataset.phase !== key) {
    host.dataset.phase = key;
    const path = moonShape(light, waning);
    host.innerHTML =
      '<div class="sky-moon-halo"></div><svg viewBox="0 0 200 200" focusable="false"><defs><radialGradient id="sky-moon-light" cx="36%" cy="29%"><stop stop-color="' +
      (blood ? "#ffd39b" : "#f4f3ec") +
      '"/><stop offset=".65" stop-color="' +
      (blood ? "#d66b42" : "#d5dce0") +
      '"/><stop offset="1" stop-color="' +
      (blood ? "#823c32" : "#9ca9ad") +
      '"/></radialGradient><clipPath id="sky-moon-lit"><path d="' +
      path +
      '"/></clipPath></defs><circle cx="100" cy="100" r="80" fill="#1c2738" opacity=".65"/><g clip-path="url(#sky-moon-lit)"><circle cx="100" cy="100" r="80" fill="url(#sky-moon-light)"/><g fill="#665f66" opacity=".17"><ellipse cx="75" cy="70" rx="22" ry="30"/><ellipse cx="118" cy="97" rx="28" ry="21"/><circle cx="61" cy="114" r="17"/><circle cx="107" cy="143" r="12"/><circle cx="143" cy="62" r="9"/></g><g fill="none" stroke="#fff3d6" stroke-opacity=".22"><circle cx="62" cy="115" r="12"/><circle cx="111" cy="144" r="8"/><circle cx="135" cy="119" r="6"/></g></g><circle cx="100" cy="100" r="80" fill="none" stroke="#fff4df" stroke-opacity=".12"/></svg>';
  }
  host.classList.toggle("sky-moon--blood", blood);
  const edge = night
    ? Math.min(
        1,
        (minute < weather.sunriseMinutes
          ? weather.sunriseMinutes - minute
          : minute - weather.sunsetMinutes) / 25,
      )
    : 0;
  host.style.opacity = String(obscured ? 0 : edge * (cloud > 28 ? 0.35 : 0.85));
  host.style.setProperty("--moon-glow", String((light / 100) * 0.65));
}
