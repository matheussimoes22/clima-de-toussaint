/** Renderização e navegação do calendário humano e élfico. */

import { ELVEN_DATA } from "../data/world-data.js";
import {
  getCurrentLanguage,
  t,
  tCondName,
  tHoliday,
  tLocale,
  tMoonName,
} from "../i18n/translations.js";
import { resolveWxSvg, WeatherEngine } from "../engine/weather-engine.js";
import { writeStoredValue } from "../state/preferences.js";
import { bloodMoonIcon, uiIcon } from "./interface-icons.js";
import { bindCalendarSwipe } from "../navigation/calendar-swipe.js";

export const CalendarView = {
  /** Monta uma página mensal completa para que os meses vizinhos já existam no gesto. */
  renderCalendarPage(calendarYear, calendarMonth, isCurrent = false) {
    const weekDaysHTML = this.state.isElven
      ? ""
      : `<div class="calendar-weekdays grid grid-cols-7 gap-px bg-slate-700 text-center text-xs font-bold text-gray-400 p-2"><div>${t("Dom")}</div><div>${t("Seg")}</div><div>${t("Ter")}</div><div>${t("Qua")}</div><div>${t("Qui")}</div><div>${t("Sex")}</div><div>${t("Sáb")}</div></div>`;
    const gridId = isCurrent ? ' id="calendar-grid"' : "";
    const cacheKey = [
      calendarYear,
      calendarMonth,
      this.state.currentLocation,
      this.state.isElven ? "elven" : "human",
      getCurrentLanguage(),
      this.state.currentDate.toDateString(),
    ].join(":");
    this._calendarPageCache ??= new Map();
    let cellsHtml = this._calendarPageCache.get(cacheKey);

    if (cellsHtml === undefined) {
      cellsHtml = "";
      const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
      const gridStart = new Date(calendarYear, calendarMonth, 1 - firstDay);

      // Seis semanas contínuas reproduzem a leitura do Google Calendário:
      // o começo e o fim do grid antecipam os meses vizinhos em tom discreto.
      for (let cell = 0; cell < 42; cell++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + cell);
        const day = date.getDate();
        const isAdjacentMonth =
          date.getMonth() !== calendarMonth ||
          date.getFullYear() !== calendarYear;
        const weather = WeatherEngine.getWeatherForDay(
          date,
          this.state.currentLocation,
        );
        const isToday =
          date.toDateString() === this.state.currentDate.toDateString();
        const isPast = date < this.state.currentDate && !isToday;
        let classes =
          "calendar-day p-2 h-24 md:h-32 bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors";
        if (isAdjacentMonth) classes += " calendar-day--adjacent";
        if (isToday) classes += " today";
        if (isPast) classes += " past";
        if (weather.moon.isBloodMoon) classes += " blood-moon-day";
        const moonName = this.state.isElven
          ? ELVEN_DATA.moonPhases[weather.moon.name]
          : tMoonName(weather.moon.name);
        const moonClass = weather.moon.isBloodMoon
          ? "blood-moon-text calendar-moon--blood"
          : "text-gray-400";
        const moonIconCal = weather.moon.isBloodMoon
          ? bloodMoonIcon("blood-moon-icon--calendar")
          : weather.moon.icon;
        const dailyIcon = resolveWxSvg(weather.conditionKey, {
          sizeClass: "calendar-weather-icon",
        });
        let elvenDayInfo = "";
        let iconSizeClass = "text-lg md:text-2xl";
        let tempSizeClass =
          "text-[11px] md:text-sm font-bold leading-tight mt-1";
        let precipSizeClass = "hidden md:block text-xs text-blue-300 mt-px";
        let containerClass =
          "flex flex-col items-center justify-center mt-0 md:mt-1 text-center";
        let dayNumClass = "text-sm md:text-base font-bold";

        if (this.state.isElven) {
          const eData = this.getElvenData(date);
          const longNameClass =
            eData.savaed.length > 9 ? " calendar-savaed--long" : "";
          elvenDayInfo = `<div class="calendar-elven-date"><span>${t("Dia")} ${eData.day}</span><span class="calendar-savaed${longNameClass}">${eData.savaed}</span></div>`;
          iconSizeClass = "text-sm md:text-lg";
          tempSizeClass =
            "text-[9px] md:text-xs font-bold leading-none mt-px md:mt-0.5";
          precipSizeClass =
            "hidden md:block text-[10px] text-blue-300 leading-none mt-0.5";
          containerClass =
            "flex flex-col items-center justify-start mt-0 text-center";
          dayNumClass = "text-xs md:text-base font-bold";
        }

        const dayAria = `${this.formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}: ${tCondName(weather.conditionKey)}, ${t("Max")} ${weather.tempMax}°, ${t("Min")} ${weather.tempMin}°, ${t("Chuva")} ${weather.precipChance}%`;
        const holidayMarker = weather.holiday
          ? `<span class="calendar-holiday" title="${tHoliday(weather.holiday, `${date.getMonth() + 1}-${date.getDate()}`).name}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.75l2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 16.95l-5.56 2.92 1.06-6.2L3 9.28l6.22-.9L12 2.75z"/></svg></span>`
          : "";
        cellsHtml += `
        <button type="button" class="${classes}" data-date="${date.toISOString()}" aria-label="${dayAria}">
          <span class="calendar-day-number ${dayNumClass}">${day}</span>
          ${holidayMarker}
          <span class="calendar-day-badges"><span class="calendar-moon ${moonClass}" title="${moonName}">${moonIconCal}</span></span>
          <div class="calendar-day-content ${containerClass}"><span class="${iconSizeClass}">${dailyIcon}</span>${elvenDayInfo}<p class="${tempSizeClass}">${weather.tempMax}° / ${weather.tempMin}°</p><p class="${precipSizeClass}">${weather.precipChance}% ${uiIcon("drop")}</p></div>
        </button>`;
      }
      this._calendarPageCache.set(cacheKey, cellsHtml);
      if (this._calendarPageCache.size > 8) {
        const oldestKey = this._calendarPageCache.keys().next().value;
        this._calendarPageCache.delete(oldestKey);
      }
    }

    return `<section class="calendar-page${isCurrent ? " is-current" : ""}"${isCurrent ? "" : ' aria-hidden="true" inert'}>${weekDaysHTML}<div${gridId} class="calendar-grid grid grid-cols-7 gap-px bg-slate-700">${cellsHtml}</div></section>`;
  },

  renderCalendar() {
    const self = this;
    const { calendarMonth, calendarYear } = this.state;
    const monthDate = new Date(calendarYear, calendarMonth, 1);
    const prevDate = new Date(calendarYear, calendarMonth - 1, 1);
    const nextDate = new Date(calendarYear, calendarMonth + 1, 1);
    const displayMonth = monthDate.toLocaleString(tLocale(), { month: "long" });
    const displayYear = this.state.isElven
      ? `(${getCurrentLanguage() === "en" ? "Year" : "Ano"} ${this.getElvenData(monthDate).year})`
      : calendarYear;

    this.elements.main.innerHTML = `
      <div class="calendar-shell bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <div class="calendar-toolbar border-b border-slate-700">
          <div class="calendar-toolbar-actions flex items-center gap-2">
            <button type="button" id="prev-month" aria-label="${getCurrentLanguage() === "en" ? "Previous month" : "Mês anterior"}" class="p-2 rounded-full hover:bg-slate-700">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button type="button" id="reset-calendar" aria-label="${t("Voltar para Hoje")}" class="p-2 rounded-full hover:bg-slate-700 text-amber-400" title="${t("Voltar para Hoje")}">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
          <h1 class="calendar-toolbar-title font-cinzel text-xl md:text-2xl text-amber-400 capitalize text-center">${displayMonth} ${displayYear}</h1>
          <button type="button" id="next-month" aria-label="${getCurrentLanguage() === "en" ? "Next month" : "Próximo mês"}" class="calendar-toolbar-next p-2 rounded-full hover:bg-slate-700">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div id="calendar-swipe-viewport" class="calendar-swipe-viewport">
          <div id="calendar-track" class="calendar-track">
            ${this.renderCalendarPage(prevDate.getFullYear(), prevDate.getMonth())}
            ${this.renderCalendarPage(calendarYear, calendarMonth, true)}
            ${this.renderCalendarPage(nextDate.getFullYear(), nextDate.getMonth())}
          </div>
        </div>
      </div>`;

    const swipe = bindCalendarSwipe(
      document.getElementById("calendar-swipe-viewport"),
      document.getElementById("calendar-track"),
      (delta) => self.changeMonth(delta),
    );
    document
      .getElementById("prev-month")
      .addEventListener("click", () => swipe.moveTo(-1));
    document
      .getElementById("next-month")
      .addEventListener("click", () => swipe.moveTo(1));
    document
      .getElementById("reset-calendar")
      .addEventListener("click", () => self.resetCalendar());
    document
      .querySelectorAll(".calendar-page.is-current .calendar-day")
      .forEach((day) => {
        if (day.dataset.date)
          day.addEventListener("click", () =>
            self.openDayModal(new Date(day.dataset.date), day),
          );
      });
  },

  changeMonth(delta) {
    this.state.calendarMonth += delta;
    if (this.state.calendarMonth > 11) {
      this.state.calendarMonth = 0;
      this.state.calendarYear++;
    }
    if (this.state.calendarMonth < 0) {
      this.state.calendarMonth = 11;
      this.state.calendarYear--;
    }
    writeStoredValue("toussaintApp_calendarMonth", this.state.calendarMonth);
    writeStoredValue("toussaintApp_calendarYear", this.state.calendarYear);
    this.renderCalendar();
  },

  /** Explica a incerteza crescente sem remover o panorama de 30 dias. */
};
