/** Episódios horários contínuos: a mesma evolução alimenta previsão e observação. */
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (x) => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Produz formação de nuvens, precipitação e dissipação com defasagem regional. */
export function buildHourlyWeather(day, loc, noise, feelsLike, previous = day) {
  const wet = day.precipitationOccurs;
  const summer = day.seasonKey === "summer";
  const convective =
    summer &&
    day.tempMax >= 22 &&
    (day.humidity >= 45 || day.moistureReserve >= 50);
  const center =
    (convective ? 16 + noise(71) * 2 : 6 + noise(71) * 10) +
    (loc.delayHours || 0);
  const width = convective ? 3.5 : 5;
  const coldFront = previous.tempMax - day.tempMax >= 5 && day.windSpeed >= 20;
  const rows = [];
  for (let h = 0; h < 24; h++) {
    const distance = Math.abs(h - center);
    const envelope = wet ? smooth((width + 3 - distance) / 3) : 0;
    const rainWeight = wet ? Math.max(0, 1 - distance / width) : 0;
    const daylight = h * 60 >= day.sunriseMinutes && h * 60 < day.sunsetMinutes;
    // Aquecimento diurno e resfriamento progressivo pela passagem do episódio.
    const phase = ((h - 5 - (loc.delayHours || 0)) / 24) * 2 * Math.PI;
    let thermal = (1 - Math.cos(phase)) / 2;
    const frontPassage = coldFront ? smooth((h - center + 3) / 6) : 0;
    thermal = clamp(
      thermal -
        envelope * 0.18 -
        (wet ? smooth((h - center) / 4) * 0.12 : 0) -
        frontPassage * 0.15,
      0,
      1,
    );
    rows.push({ h, thermal, envelope, rainWeight, daylight, frontPassage });
  }
  // Preserva as extremas previstas; o pico pode anteceder uma frente/chuvada.
  const low = Math.min(...rows.map((r) => r.thermal));
  const high = Math.max(...rows.map((r) => r.thermal));
  const weights = rows.reduce((sum, r) => sum + r.rainWeight, 0);
  let assigned = 0;
  const lastWet = rows.findLastIndex((r) => r.rainWeight > 0);
  return rows.map((r) => {
    const temp = Math.round(
      day.tempMin +
        ((day.tempMax - day.tempMin) * (r.thermal - low)) / (high - low || 1),
    );
    let cloudCover = wet
      ? Math.round(15 + 85 * r.envelope)
      : Math.round(
          clamp(
            (day.conditionKey.includes("overcast")
              ? 75
              : day.conditionKey.includes("cloudy")
                ? 45
                : 12) +
              16 * Math.cos(((r.h - 6) / 24) * Math.PI * 2),
            0,
            100,
          ),
        );
    if (coldFront)
      cloudCover = Math.max(
        cloudCover,
        Math.round(20 + 65 * Math.sin(r.frontPassage * Math.PI)),
      );
    let humidity = Math.round(
      clamp(
        day.humidity + 15 * (1 - r.thermal) - 10 * r.thermal + 25 * r.envelope,
        15,
        100,
      ),
    );
    let key =
      cloudCover > 70 ? "overcast" : cloudCover > 28 ? "cloudy" : "clear";
    let precipAmountMm = 0;
    if (r.rainWeight > 0) {
      precipAmountMm =
        r.h === lastWet
          ? Math.round((day.precipAmountMm - assigned) * 100) / 100
          : Math.round(((day.precipAmountMm * r.rainWeight) / weights) * 100) /
            100;
      assigned += precipAmountMm;
      if (precipAmountMm > 0) {
        key = "light_rain";
        if (day.conditionKey.includes("snow") && temp <= 2) key = "snow";
        else if (day.conditionKey.includes("storm") && r.rainWeight >= 0.65)
          key = "storm";
        else if (
          precipAmountMm >= 2.5 ||
          (day.conditionKey.includes("heavy") && r.rainWeight >= 0.6)
        )
          key = "heavy_rain";
        cloudCover = Math.max(cloudCover, 90);
        humidity = Math.max(humidity, 82);
      }
    } else if (day.conditionKey.includes("fog") && (r.h < 9 || r.h >= 21)) {
      key = "fog";
      humidity = Math.max(humidity, 95);
      cloudCover = Math.max(cloudCover, 75);
    }
    const windSpeed = Math.round(
      day.windSpeed *
        (0.65 +
          0.35 * r.thermal +
          0.3 * r.envelope +
          (coldFront ? 0.18 * Math.sin(r.frontPassage * Math.PI) : 0)),
    );
    const pressure = Math.round(
      day.pressure +
        (wet ? 5 - 7 * r.envelope : 2 * Math.cos((r.h / 24) * Math.PI * 2)),
    );
    const conditionKey = `${key}_${r.daylight ? "day" : "night"}`;
    return {
      hour: `${String(r.h).padStart(2, "0")}:00`,
      temp,
      feelsLike: feelsLike(temp, humidity, windSpeed),
      conditionKey,
      humidity,
      windSpeed,
      windDir: coldFront && r.frontPassage >= 0.5 ? "NO" : day.windDir,
      pressure,
      cloudCover,
      precipitationOccurs: precipAmountMm > 0,
      precipAmountMm,
      precipChance:
        precipAmountMm > 0
          ? Math.max(65, day.precipChance)
          : Math.round(
              Math.min(55, day.precipChance * (0.15 + r.envelope * 0.6)),
            ),
      visibility:
        key === "fog"
          ? Math.min(3, day.visibility)
          : key === "storm"
            ? 3
            : precipAmountMm > 0
              ? 6
              : Math.max(10, day.visibility),
      moonIcon: day.moon.isBloodMoon && r.h > 3 ? "🌕" : day.moon.icon,
      isNight: !r.daylight,
    };
  });
}
