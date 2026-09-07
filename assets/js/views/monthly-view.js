/** Panorama de trinta dias, faixas de confiança e recordes. */

import { LOCATIONS } from "../data/world-data.js";
import { t, tCondName, tLocationName } from "../i18n/translations.js";
import { resolveWxSvg, WeatherEngine } from "../engine/weather-engine.js";

export const MonthlyView = {
  /** Formata a data real de um recorde ou identifica referências herdadas. */
  getRecordDateLabel(entry) {
    if (!entry.date) return t("Data histórica desconhecida");
    const [year, month, day] = entry.date.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);
    return `${t("Registrado em")} ${this.formatDate(date, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  },

  getForecastMeta(daysAhead) {
    if (daysAhead <= 6)
      return {
        label: t("Previsão confiável"),
        confidence: t("Confiança alta"),
        uncertainty: 0,
        className: "text-green-300 border-green-500/40",
      };
    if (daysAhead <= 13)
      return {
        label: t("Tendência"),
        confidence: t("Confiança moderada"),
        uncertainty: 2,
        className: "text-amber-300 border-amber-500/40",
      };
    return {
      label: t("Cenário climático"),
      confidence: t("Confiança baixa"),
      uncertainty: 4,
      className: "text-slate-300 border-slate-500/40",
    };
  },

  renderMonthly() {
    const startDate = new Date(this.state.currentDate);
    const locData = LOCATIONS[this.state.currentLocation];
    const record = this.getRecord(this.state.currentLocation);
    const histMax = record.max.value;
    const histMin = record.min.value;
    const histMaxDate = this.getRecordDateLabel(record.max);
    const histMinDate = this.getRecordDateLabel(record.min);
    let forecastHtml = `<h1 class="font-cinzel text-2xl text-amber-400 mb-2">${t("Previsão 30 Dias")} (${tLocationName(this.state.currentLocation)})</h1><p class="text-sm text-gray-400 mb-4">${t("A precisão diminui com a distância da data.")}</p><div class="space-y-2">`;
    let totalMax = 0,
      totalMin = 0,
      rainDays = 0,
      fogDays = 0,
      snowDays = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const weather = WeatherEngine.getWeatherForDay(
        date,
        this.state.currentLocation,
      );
      totalMax += weather.tempMax;
      totalMin += weather.tempMin;
      if (/rain|storm/.test(weather.conditionKey)) rainDays++;
      if (weather.conditionKey.includes("fog")) fogDays++;
      if (weather.conditionKey.includes("snow")) snowDays++;
      const dateString = this.formatDate(date, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const meta = this.getForecastMeta(i);
      if (i === 0 || i === 7 || i === 14) {
        const sectionSpacing = i === 0 ? "" : "pt-4";
        forecastHtml += `<div class="flex items-center gap-3 ${sectionSpacing}"><h2 class="font-cinzel text-sm uppercase tracking-wider text-amber-400/90">${meta.label}</h2><span class="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${meta.className}">${meta.confidence}</span></div>`;
      }
      const uncertainty = meta.uncertainty
        ? `<span class="text-[10px] text-gray-500"> ±${meta.uncertainty}°</span>`
        : "";
      forecastHtml += `<div class="grid grid-cols-[4.6rem_2.2rem_minmax(0,1fr)_auto] md:grid-cols-[7rem_2.5rem_minmax(0,1fr)_auto] items-center gap-2 md:gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700/60">
                        <span class="text-xs md:text-sm font-bold text-amber-200/90 leading-tight">${dateString}</span>
                        <span class="flex justify-center shrink-0">${resolveWxSvg(weather.conditionKey, { isBloodMoon: false, sizeClass: "wx-icon-sm" })}</span>
                        <span class="min-w-0 truncate text-xs md:text-sm text-gray-300">${tCondName(weather.conditionKey)}</span>
                        <span class="shrink-0 text-right leading-tight">
                            <span class="block text-sm md:text-base font-semibold">${weather.tempMax}° <span class="text-gray-500">/ ${weather.tempMin}°</span>${uncertainty}</span>
                            <span class="block text-[11px] text-blue-300">${weather.precipChance}%</span>
                        </span>
                    </div>`;
    }
    forecastHtml += `</div>`;
    const avgMax = (totalMax / 30).toFixed(1);
    const avgMin = (totalMin / 30).toFixed(1);
    let historicalHtml = `<div class="mt-8"><h2 class="font-cinzel text-2xl text-amber-400 mb-4">${t("Histórico e Tendências")}</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-4">${this.renderDetailCard(t("Média Máx (30d)"), `${avgMax}°C`, "📈", "", false)} ${this.renderDetailCard(t("Média Mín (30d)"), `${avgMin}°C`, "📉", "", false)} ${this.renderDetailCard(t("Dias de Chuva (30d)"), `${rainDays} ${t("dias")}`, "🌧️", "", false)} ${this.renderDetailCard(t("Dias de Neve (30d)"), `${snowDays} ${t("dias")}`, "❄️", "", false)}</div><div class="grid grid-cols-2 gap-4 mt-4">${this.renderDetailCard(t("Máximo Histórico"), `${histMax}°C <span class="record-date">${histMaxDate}</span>`, "🌡️", "", false)} ${this.renderDetailCard(t("Mínimo Histórico"), `${histMin}°C <span class="record-date">${histMinDate}</span>`, "❄️", "", false)}</div></div>`;
    this.elements.main.innerHTML = forecastHtml + historicalHtml;
  },
};
