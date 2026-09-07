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
import { uiIcon } from "./interface-icons.js";
import { bindCalendarSwipe } from "../navigation/calendar-swipe.js";

export const CalendarView = {
  renderCalendar() {
    const self = this;
    const { calendarMonth, calendarYear } = this.state;
    let displayMonth, displayYear, weekDaysHTML;

    if (this.state.isElven) {
      // No modo Élfico com Savaed contínuo, o calendário grid ainda precisa de uma referência
      // Usamos o nome Humano do mês para navegação, mas mostramos o Ano Élfico
      const humanMonthName = new Date(
        calendarYear,
        calendarMonth,
      ).toLocaleString(tLocale(), { month: "long" });

      // Calcular ano élfico para exibição (baseado no dia 1 do mês visualizado)
      const elvenData = this.getElvenData(
        new Date(calendarYear, calendarMonth, 1),
      );
      displayMonth = humanMonthName; // Mantém nome humano para navegação
      displayYear = `(${getCurrentLanguage() === "en" ? "Year" : "Ano"} ${elvenData.year})`; // Mostra ano élfico
      weekDaysHTML = ``;
    } else {
      displayMonth = new Date(calendarYear, calendarMonth).toLocaleString(
        tLocale(),
        { month: "long" },
      );
      displayYear = calendarYear;
      weekDaysHTML = `<div class="grid grid-cols-7 gap-px bg-slate-700 text-center text-xs font-bold text-gray-400 p-2"><div>${t("Dom")}</div><div>${t("Seg")}</div><div>${t("Ter")}</div><div>${t("Qua")}</div><div>${t("Qui")}</div><div>${t("Sex")}</div><div>${t("Sáb")}</div></div>`;
    }
    let html = `
                    <div class="bg-slate-800 rounded-lg shadow-xl border border-slate-700">
                        <div class="calendar-toolbar border-b border-slate-700">
                            <div class="calendar-toolbar-actions flex items-center gap-2"><button type="button" id="prev-month" aria-label="${getCurrentLanguage() === "en" ? "Previous month" : "Mês anterior"}" class="p-2 rounded-full hover:bg-slate-700"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg></button><button type="button" id="reset-calendar" aria-label="${t("Voltar para Hoje")}" class="p-2 rounded-full hover:bg-slate-700 text-amber-400" title="${t("Voltar para Hoje")}"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button></div>
                            <h1 class="calendar-toolbar-title font-cinzel text-xl md:text-2xl text-amber-400 capitalize text-center">${displayMonth} ${displayYear}</h1>
                            <button type="button" id="next-month" aria-label="${getCurrentLanguage() === "en" ? "Next month" : "Próximo mês"}" class="calendar-toolbar-next p-2 rounded-full hover:bg-slate-700"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg></button>
                        </div>
                        ${weekDaysHTML}
                        <div id="calendar-grid" class="grid grid-cols-7 gap-px bg-slate-700">
                `;
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++)
      html += `<div class="bg-slate-800/50 h-24 md:h-32"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const weather = WeatherEngine.getWeatherForDay(
        date,
        this.state.currentLocation,
      );
      const isToday =
        date.toDateString() === this.state.currentDate.toDateString();
      const isPast = date < this.state.currentDate && !isToday;
      let classes =
        "calendar-day p-2 h-24 md:h-32 bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors";
      if (isToday) classes += " today";
      if (isPast) classes += " past";
      const moonName = this.state.isElven
        ? ELVEN_DATA.moonPhases[weather.moon.name]
        : tMoonName(weather.moon.name);

      // No calendário, Lua de Sangue sempre aparece vermelha para indicar o dia do evento
      const moonClass = weather.moon.isBloodMoon
        ? "blood-moon-text"
        : "text-gray-400";
      const moonIconCal = weather.moon.isBloodMoon ? "🔴" : weather.moon.icon;

      const dailyIcon = resolveWxSvg(weather.conditionKey, {
        sizeClass: "calendar-weather-icon",
      });

      // Variáveis de design para controle do modo Élfico
      let elvenDayInfo = "";
      let iconSizeClass = "text-lg md:text-2xl"; // Tamanho padrão ícone
      let tempSizeClass = "text-[11px] md:text-sm font-bold leading-tight mt-1"; // Tamanho padrão temp
      let precipSizeClass = "hidden md:block text-xs text-blue-300 mt-px"; // Tamanho padrão precipitação
      let containerClass =
        "flex flex-col items-center justify-center mt-0 md:mt-1 text-center";
      let dayNumClass = "text-sm md:text-base font-bold";

      if (this.state.isElven) {
        const eData = this.getElvenData(date);
        // O nome recebe uma classe própria para caber inclusive em telas estreitas.
        const longNameClass =
          eData.savaed.length > 9 ? " calendar-savaed--long" : "";
        elvenDayInfo = `<div class="calendar-elven-date"><span>${t("Dia")} ${eData.day}</span><span class="calendar-savaed${longNameClass}">${eData.savaed}</span></div>`;
        iconSizeClass = "text-sm md:text-lg"; // Ícone reduzido (14px)
        tempSizeClass =
          "text-[9px] md:text-xs font-bold leading-none mt-px md:mt-0.5"; // Fonte minúscula para temp
        precipSizeClass =
          "hidden md:block text-[10px] text-blue-300 leading-none mt-0.5";
        containerClass =
          "flex flex-col items-center justify-start mt-0 text-center";
        dayNumClass = "text-xs md:text-base font-bold"; // Dia menor no mobile
      }

      const dayAria = `${this.formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}: ${tCondName(weather.conditionKey)}, ${t("Max")} ${weather.tempMax}°, ${t("Min")} ${weather.tempMin}°, ${t("Chuva")} ${weather.precipChance}%`;
      const holidayMarker = weather.holiday
        ? `<span class="calendar-holiday" title="${tHoliday(weather.holiday, `${date.getMonth() + 1}-${date.getDate()}`).name}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.75l2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 16.95l-5.56 2.92 1.06-6.2L3 9.28l6.22-.9L12 2.75z"/></svg></span>`
        : "";
      html += `
                        <button type="button" class="${classes}" data-date="${date.toISOString()}" aria-label="${dayAria}">
                            <span class="calendar-day-number ${dayNumClass}">${day}</span>
                            ${holidayMarker}
                            <span class="calendar-day-badges"><span class="calendar-moon ${moonClass}" title="${moonName}">${moonIconCal}</span></span>
                            <div class="calendar-day-content ${containerClass}"><span class="${iconSizeClass}">${dailyIcon}</span>${elvenDayInfo}<p class="${tempSizeClass}">${weather.tempMax}° / ${weather.tempMin}°</p><p class="${precipSizeClass}">${weather.precipChance}% ${uiIcon("drop")}</p></div>
                        </button>
                    `;
    }
    html += `</div></div>`;
    this.elements.main.innerHTML = html;
    bindCalendarSwipe(document.getElementById("calendar-grid"), (delta) =>
      self.changeMonth(delta),
    );
    document
      .getElementById("prev-month")
      .addEventListener("click", () => self.changeMonth(-1));
    document
      .getElementById("next-month")
      .addEventListener("click", () => self.changeMonth(1));
    document
      .getElementById("reset-calendar")
      .addEventListener("click", () => self.resetCalendar());
    document.querySelectorAll(".calendar-day").forEach((day) => {
      if (day.dataset.date)
        day.addEventListener("click", () =>
          self.openDayModal(new Date(day.dataset.date)),
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
