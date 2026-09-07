import {
  findWeatherEvent,
  eventHours,
  affectedAreas,
} from "../engine/weather-events.js";
import { uiIcon } from "./interface-icons.js";
import {
  bulletinCopy,
  extraTemplate,
  formatEventHours,
} from "./bulletin-copy.js";
/** Descoberta de eventos futuros e composição dos boletins ducais. */

import {
  NEWS_REGION,
  NEWS_SOURCES,
  NEWS_TEMPLATES,
} from "../data/world-data.js";
import {
  getCurrentLanguage,
  t,
  tDaysLabel,
  tLocale,
  tLocationName,
} from "../i18n/translations.js";
import { WeatherEngine } from "../engine/weather-engine.js";

export const EventBulletinView = {
  // === PRÓXIMOS EVENTOS CLIMÁTICOS ===
  eventDefs() {
    return [
      {
        key: "cold",
        label: getCurrentLanguage() === "en" ? "Intense cold" : "Frio intenso",
        severity: "yellow",
      },
      {
        key: "front",
        label: getCurrentLanguage() === "en" ? "Cold front" : "Frente fria",
        severity: "yellow",
      },
      {
        key: "rain",
        label:
          getCurrentLanguage() === "en" ? "Heavy rainfall" : "Chuvas intensas",
        severity: "orange",
      },
      {
        key: "wind",
        label: getCurrentLanguage() === "en" ? "Strong winds" : "Ventos fortes",
        severity: "yellow",
      },
      {
        key: "storm",
        label: t("Tempestade"),
        danger: true,
        severity: "red",
      },
      {
        key: "snow",
        label: t("Neve"),
        danger: false,
        severity: "yellow",
      },
      {
        key: "fog",
        label: t("Neblina densa"),
        danger: false,
        severity: "green",
      },
      {
        key: "heat",
        label: t("Onda de calor"),
        danger: true,
        severity: "orange",
      },
      {
        key: "blood",
        label: t("Lua de Sangue"),
        danger: true,
        severity: "red",
      },
    ];
  },

  renderNextEventsPanel() {
    const loc = this.state.currentLocation;
    const now = this.state.currentDate;
    const upcoming = this.eventDefs()
      .map((ev) => {
        const found = findWeatherEvent(ev.key, now, loc, 7);
        return found ? { ...ev, found } : null;
      })
      .filter(Boolean);
    // Ordem cronológica: o evento mais iminente sempre no topo
    const sevRank = {
      blood: 0,
      red: 1,
      orange: 2,
      yellow: 3,
      blue: 4,
      green: 5,
    };
    upcoming.forEach((ev) => {
      const tpl = NEWS_TEMPLATES[ev.key];
      if (tpl && tpl.sevClass)
        ev.severity = tpl.sevClass.replace("news-sev-", "");
    });
    upcoming.sort(
      (a, b) =>
        a.found.daysAhead - b.found.daysAhead ||
        parseInt(a.found.hours[0].hour) - parseInt(b.found.hours[0].hour) ||
        sevRank[a.severity] - sevRank[b.severity],
    );
    // Um episodio principal; apenas fenomenos relacionados justificam um segundo.
    const principal = upcoming[0];
    const related = new Set(["front", "storm", "rain", "wind", "snow", "cold"]);
    const selected = principal ? [principal] : [];
    const companion = upcoming
      .slice(1)
      .find(
        (ev) =>
          related.has(principal.key) &&
          related.has(ev.key) &&
          ev.found.daysAhead - principal.found.daysAhead <= 2 &&
          !(principal.key === "storm" && ev.key === "rain") &&
          !(principal.key === "rain" && ev.key === "storm") &&
          ev.found.weather.pressure <= 1012,
      );
    if (companion) selected.push(companion);
    const pills = selected
      .map((ev) => {
        const found = ev.found;
        const eventLabel = found.isActive
          ? `${t("Alerta")}: ${ev.label}`
          : ev.label;
        const lbl = found.isActive
          ? t("no momento")
          : found.daysAhead === 0
            ? `${t("Hoje")} ${found.hours[0].hour}`
            : tDaysLabel(found.daysAhead);
        const separator = found.isActive ? " " : ": ";
        const cls = `event-pill event-type-${ev.key}`;
        const iso = this.dateKey(found.date);
        const aria =
          getCurrentLanguage() === "en"
            ? "Read the bulletin about"
            : "Ler o boletim sobre";
        return `<button type="button" class="${cls}" aria-label="${aria} ${eventLabel}" data-event-key="${ev.key}" data-event-date="${iso}" data-days-ahead="${found.daysAhead}">${uiIcon(ev.key)}${eventLabel}${separator}<strong>${lbl}</strong><span class="event-chevron">▸</span></button>`;
      })
      .join("");
    if (!pills) return "";
    const hint =
      getCurrentLanguage() === "en"
        ? "Tap an event to read the ducal bulletin."
        : "Toque em um evento para ler o boletim ducal.";
    const heading = selected.some((event) => event.found.isActive)
      ? t("Alertas e próximos eventos")
      : t("Próximos eventos");
    return `<div class="mb-6"><h3 class="font-cinzel text-sm uppercase tracking-wider text-amber-400/80 mb-2">${heading}</h3><div class="flex flex-wrap gap-2">${pills}</div><p class="events-hint">${hint}</p></div>`;
  },

  // Boletim detalhado (estilo notícia / alerta oficial)
  openEventNews(eventKey, isoDate, daysAhead) {
    const tpl =
      NEWS_TEMPLATES[eventKey] ||
      extraTemplate(eventKey, getCurrentLanguage() === "en" ? "en" : "pt");
    if (!tpl) return;
    const lang = getCurrentLanguage() === "en" ? "en" : "pt";
    const [yy, mm, dd] = isoDate.split("-").map(Number);
    const date = new Date(yy, mm - 1, dd);
    const locKey = this.state.currentLocation;
    const locName = tLocationName(locKey);
    const w = WeatherEngine.getWeatherForDay(date, locKey);

    const when = tDaysLabel(daysAhead);
    const dateStr = date.toLocaleDateString(tLocale(), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const regionTxt =
      NEWS_REGION[locKey] && NEWS_REGION[locKey][eventKey]
        ? NEWS_REGION[locKey][eventKey][lang]
        : "";

    const occurrence = eventHours(eventKey, date, locKey);
    if (!occurrence.hours.length) return;
    const areas = affectedAreas(eventKey, date, occurrence.hours)
      .map((k) => tLocationName(k))
      .join(" · ");
    const copy = bulletinCopy(eventKey, w, occurrence.hours, locName, lang);
    const validity = formatEventHours(occurrence.hours);

    const L = {
      valid: lang === "en" ? "Validity" : "Vigência",
      areas: lang === "en" ? "Affected areas" : "Áreas afetadas",
      forecast: lang === "en" ? "Expected conditions" : "Condições previstas",
      impact: lang === "en" ? "Local impact" : "Impacto local",
      advice: lang === "en" ? "Recommendations" : "Recomendações",
      max: lang === "en" ? "Max" : "Máx",
      min: lang === "en" ? "Min" : "Mín",
      wind: lang === "en" ? "Wind" : "Vento",
      rain: lang === "en" ? "Rain" : "Chuva",
      issued: lang === "en" ? "Issued by" : "Emitido por",
    };

    // Coerência de apresentação: dias chuvosos não podem exibir 0% de chuva
    const rainPct = w.precipChance;

    const metrics = `
                    <div class="news-grid">
                        <div class="news-metric"><span>${L.max}</span><strong>${w.tempMax}°</strong></div>
                        <div class="news-metric"><span>${L.min}</span><strong>${w.tempMin}°</strong></div>
                        <div class="news-metric"><span>${L.wind}</span><strong>${w.windSpeed} km/h</strong></div>
                        <div class="news-metric"><span>${L.rain}</span><strong>${rainPct}%</strong></div>
                    </div>`;

    const bodyParas =
      `<p>${copy.impact}</p><p>${copy.context}</p>` +
      (eventKey === "blood"
        ? tpl.body[lang].map((text) => `<p>${text}</p>`).join("")
        : "");
    const adviceList = tpl.advice[lang]
      .map((txt) => `<li>${txt}</li>`)
      .join("");

    this.elements.modalTitle.innerHTML = `${uiIcon(eventKey)} ${tpl.kicker[lang]}`;
    this.elements.modalBody.innerHTML = `
                    <article class="news-card">
                        <header class="news-head">
                            <div class="flex items-center justify-between gap-3 flex-wrap">
                                <span class="news-badge ${tpl.sevClass}">${tpl.sev[lang]}</span>
                                <span class="news-kicker">${L.valid}: ${when} — ${dateStr} · ${validity}</span>
                            </div>
                            <h4 class="news-title font-cinzel">${copy.title}</h4>
                        </header>

                        <p class="news-lead">${copy.lead}</p>

                        <div class="news-section-title">${L.forecast}</div>
                        ${metrics}

                        <div class="news-section-title">${L.areas}</div>
                        <p>${areas}</p>

                        ${bodyParas ? `<div class="news-section-title">${lang === "en" ? "Bulletin" : "Boletim"}</div>${bodyParas}` : ""}

                        ${regionTxt ? `<div class="news-section-title">${L.impact} — ${locName}</div><div class="news-region"><p style="margin:0">${regionTxt}</p></div>` : ""}

                        <div class="news-section-title">${L.advice}</div>
                        <ul class="news-advice">${adviceList}</ul>

                        <footer class="news-footer">${L.issued} ${NEWS_SOURCES[lang]}</footer>
                    </article>`;
    this.openModal();
  },
};
