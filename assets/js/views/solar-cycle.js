const palettes = {
  night: ["#091222", "#17253b", "#263149"],
  blue: ["#243957", "#65768f", "#b29f98"],
  dawn: ["#526a86", "#bc9c9a", "#edc29a"],
  gold: ["#627f96", "#c4b798", "#eed09a"],
  day: ["#397b9c", "#89b7bd", "#e1cba0"],
  sunset: ["#4b5c79", "#ba867d", "#e7a36b"],
};
const blend = (a, b, t) =>
  "#" +
  [1, 3, 5]
    .map((i) =>
      Math.round(
        parseInt(a.slice(i, i + 2), 16) * (1 - t) +
          parseInt(b.slice(i, i + 2), 16) * t,
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
export function solarCycle(minute, rise, set) {
  const stops = [
    [0, "night", "Madrugada"],
    [rise - 75, "night", "Primeira claridade"],
    [rise - 40, "blue", "Penumbra do amanhecer"],
    [rise - 10, "dawn", "Amanhecer"],
    [rise + 25, "gold", "Luz dourada da manhã"],
    [rise + 75, "day", "Dia pleno"],
    [set - 75, "day", "Fim de tarde"],
    [set - 30, "gold", "Luz dourada da tarde"],
    [set, "sunset", "Pôr do Sol"],
    [set + 25, "blue", "Crepúsculo"],
    [set + 70, "night", "Noite"],
    [1440, "night", "Madrugada"],
  ];
  const m = Math.max(0, Math.min(1440, minute));
  let i = 0;
  while (i < stops.length - 2 && m >= stops[i + 1][0]) i++;
  const a = stops[i],
    b = stops[i + 1];
  const linear = Math.max(0, Math.min(1, (m - a[0]) / (b[0] - a[0])));
  const t = linear * linear * (3 - 2 * linear);
  const colors = palettes[a[1]].map((c, j) => blend(c, palettes[b[1]][j], t));
  const gray = colors.map((hex) => {
    const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    return (
      "#" +
      rgb
        .map((v) =>
          Math.round((luminance * 0.92 + v * 0.08) * 0.78)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  });
  return {
    overcastBackground:
      "linear-gradient(180deg," +
      gray[0] +
      "," +
      gray[1] +
      " 60%," +
      gray[2] +
      ")",
    label: a[2],
    stars: Math.max(
      0,
      Math.min(1, minute < rise ? (rise - minute) / 75 : (minute - set) / 70),
    ),
    daylight: Math.max(
      0,
      Math.min(1, (minute - rise) / 45, (set - minute) / 45),
    ),
    background:
      "linear-gradient(180deg," +
      colors[0] +
      " 0%," +
      colors[1] +
      " 60%," +
      colors[2] +
      " 100%)",
  };
}
