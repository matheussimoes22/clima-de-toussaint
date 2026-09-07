import { uiIcon } from "./interface-icons.js";
/** Renderização da tela Hoje e de suas interações meteorológicas. */

import { ELVEN_DATA, LOCATIONS } from "../data/world-data.js";
import {
  getAirQualityLabel,
  getUvColorClass,
  ICON_MOONRISE,
  ICON_MOONSET,
  ICON_SUNRISE,
  ICON_SUNSET,
  t,
  tCondName,
  tLocale,
  tLocationName,
  tMoonName,
  tSeasonName,
  tWindDir,
} from "../i18n/translations.js";
import {
  resolveWeatherIcon,
  resolveWxSvg,
  WeatherEngine,
} from "../engine/weather-engine.js";

export const TodayView = {
  renderToday() {
    const self = this;
    const weather = WeatherEngine.getCurrentWeather(
      this.state.currentDate,
      this.state.currentLocation,
    );
    this.updateRecords(weather);
    const condition = weather.currentCondition;
    const timeSinceUpdate = Math.round(
      (new Date() - this.state.lastUpdate) / (1000 * 60),
    );
    const hourly = weather.hourly;
    const currentHour = this.state.currentDate.getHours();
    const sunriseHour = parseInt(weather.sunrise.split(":")[0]);
    const sunsetHour = parseInt(weather.sunset.split(":")[0]);

    const displayDate = this.formatDate(this.state.currentDate);
    const displaySeason = this.state.isElven
      ? ELVEN_DATA.seasonNames[weather.seasonKey]
      : tSeasonName(weather.seasonKey, { name: weather.seasonName });

    // Lógica Visual Lua de Sangue (Apenas 00-03h)
    const isBloodMoonActive =
      weather.moon.isBloodMoon && currentHour >= 0 && currentHour <= 3;

    // Definir ícone principal com base na atividade
    let mainMoonIcon = weather.moon.icon;
    if (weather.moon.isBloodMoon) {
      mainMoonIcon = isBloodMoonActive ? "🔴" : "🌕";
    }
    const displayMoonPhase = this.state.isElven
      ? ELVEN_DATA.moonPhases[weather.moon.name]
      : tMoonName(weather.moon.name);
    const moonClass = isBloodMoonActive ? "blood-moon-text" : "text-gray-300";

    // Se for noite e céu limpo, usa o ícone da lua (modificado ou não)
    let mainIcon = weather.hourlyMoonIcon; // Pega do hourly que já trata isso
    if (weather.conditionKey !== "clear_night") {
      // Se não for noite limpa, usa o ícone do clima, exceto se for a Lua de Sangue ativa dominando o céu
      mainIcon = resolveWeatherIcon(weather.conditionKey, {
        icon: mainMoonIcon,
      });
    }

    const uvColorClass = getUvColorClass(weather.uvIndex);

    let locationOptions = "";
    for (const [key, val] of Object.entries(LOCATIONS))
      locationOptions += `<option value="${key}" ${this.state.currentLocation === key ? "selected" : ""}>${tLocationName(key)}</option>`;

    let hourlyHtml = `<div class="mt-6"><h3 class="font-cinzel text-xl text-amber-400 mb-4">${t("Previsão 24h")}</h3><div id="hourly-forecast-container" class="flex overflow-x-auto space-x-3 pb-4">`;
    hourly.forEach((h) => {
      const hourOfForecast = parseInt(h.hour.split(":")[0]);
      const isCurrentHour = hourOfForecast === currentHour;
      const displayIcon =
        h.conditionKey === "clear_night"
          ? h.moonIcon
          : resolveWxSvg(h.conditionKey, {
              sizeClass: "wx-icon-sm",
              isBloodMoon: weather.moon.isBloodMoon,
            });
      const cardClasses = isCurrentHour
        ? "flex-shrink-0 w-20 text-center bg-amber-500/20 p-3 rounded-lg border-2 border-amber-400"
        : "flex-shrink-0 w-20 text-center bg-slate-800 p-3 rounded-lg border border-slate-700";
      const textClasses = isCurrentHour ? "text-amber-300" : "text-gray-400";
      const cardId = isCurrentHour ? 'id="current-hour-forecast"' : "";
      hourlyHtml += `<div ${cardId} class="${cardClasses}" aria-label="${h.hour}: ${tCondName(h.conditionKey)}, ${h.temp}°, ${Math.round(h.humidity)}% ${t("Umidade")}"><p class="text-sm ${textClasses}">${h.hour}</p><p class="text-2xl my-1" aria-hidden="true">${displayIcon}</p><p class="text-lg font-bold">${h.temp}°</p><p class="text-xs ${textClasses}">${t("Umid.")} ${Math.round(h.humidity)}%</p></div>`;
    });
    hourlyHtml += "</div></div>";

    // CARD LUA DE SANGUE (Só mostra se estiver ativa no momento)
    let bloodMoonCard = "";
    if (isBloodMoonActive) {
      bloodMoonCard = `
                    <div class="bg-red-900/30 border border-red-500/30 p-4 rounded-lg mb-6 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="text-2xl animate-pulse">🔴</span>
                            <h3 class="font-cinzel text-xl text-red-400 uppercase tracking-wide">${t("Eclipse Lunar: Lua de Sangue")}</h3>
                        </div>
                        <p class="text-sm text-red-200/80 leading-relaxed italic">
                            ${t("blood_quote")}
                        </p>
                    </div>`;
    }

    this.elements.main.innerHTML = `
                    <div class="max-w-4xl mx-auto">
                        <div class="toussaint-header-container">
                            <h1 class="toussaint-title">TOUSSAINT</h1>
                            <p class="toussaint-subtitle" data-key="Clima Ducal">Clima Ducal</p>
                        </div>
                        <div class="text-center mb-6">
                            <div class="inline-block mb-2"><label for="location-selector" class="sr-only">${t("Localidade")}</label><select id="location-selector" class="font-cinzel text-2xl md:text-3xl font-bold text-amber-400 bg-transparent border-none text-center focus:ring-0 cursor-pointer appearance-none">${locationOptions}</select></div>
                            <p id="real-time-date" class="text-lg text-gray-300" data-full-date="${this.state.currentDate.toDateString()}">${displayDate}</p>
                            <p id="real-time-clock" class="text-3xl font-bold text-white mt-1">${this.state.currentDate.toLocaleString(tLocale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                            <button id="open-season-modal" class="mt-2 font-cinzel text-xl text-amber-400 hover:text-amber-300 transition-colors">${weather.seasonIcon} ${displaySeason}</button>
                            <p class="text-sm text-gray-500 mt-2">${t("Atualizado há")} ${timeSinceUpdate} ${t("minutos")}</p>
                        </div>

                        ${bloodMoonCard}

                        <div class="bg-slate-800 p-6 rounded-lg shadow-xl flex flex-col md:flex-row items-center justify-between mb-6 border border-slate-700">
                            <div class="flex items-center space-x-4 mb-4 md:mb-0">${resolveWxSvg(weather.conditionKey, { isBloodMoon: weather.moon.isBloodMoon, sizeClass: "wx-icon-lg" })}<div><p class="text-5xl md:text-6xl font-bold">${weather.currentTemp}°</p><p class="text-xl text-gray-300">${tCondName(weather.conditionKey)}</p></div></div>
                            <div class="text-center md:text-right space-y-1 w-full md:w-auto">
                                <p class="text-lg">${t("Sensação")}: <strong>${weather.currentFeelsLike}°</strong></p>
                                <p class="text-lg font-semibold text-blue-300">${t("Chuva")}: ${weather.precipChance}%</p>
                                <p class="text-sm text-gray-400">${t("Min")} ${weather.tempMin}° / ${t("Max")} ${weather.tempMax}°</p>
                                <div class="flex items-center justify-center md:justify-end space-x-4 mt-3 pt-3 border-t border-slate-600/50">
                                    <div class="flex flex-col items-center text-xs text-amber-200/80"><span title="${t("Nascer do Sol")}">${ICON_SUNRISE} ${weather.sunrise}</span><span title="${t("Pôr do Sol")}" class="mt-1">${ICON_SUNSET} ${weather.sunset}</span></div>
                                    <div class="h-8 w-px bg-slate-600/50"></div>
                                    <div class="flex flex-col items-center text-xs text-slate-300"><span title="${t("Nascer da Lua")}">${ICON_MOONRISE} ${weather.moonrise}</span><span title="${t("Ocaso da Lua")}" class="mt-1">${ICON_MOONSET} ${weather.moonset}</span></div>
                                    <div class="h-8 w-px bg-slate-600/50"></div>
                                    <div class="flex flex-col items-center text-xs ${moonClass}"><span class="text-lg">${mainMoonIcon}</span><span>${displayMoonPhase}</span></div>
                                </div>
                            </div>
                        </div>

                        ${this.renderNextEventsPanel()}

                        ${hourlyHtml}
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                            ${this.renderDetailCard(t("Vento"), `${weather.windSpeed} km/h (${tWindDir(weather.windDir)})`, uiIcon("wind"), "Vento", true, weather.windSpeed)}
                            ${this.renderDetailCard(t("Umidade"), `${weather.humidity}%`, uiIcon("drop"), "Umidade", true, weather.humidity)}
                            ${this.renderDetailCard(t("Pressão"), `${weather.pressure} hPa`, uiIcon("pressure"), "Pressão", true, weather.pressure)}
                            ${this.renderDetailCard(t("Visibilidade"), `${weather.visibility} km`, uiIcon("eye"), "Visibilidade", true, weather.visibility)}
                            <button type="button" class="w-full text-left bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 detail-card-interactive transition-transform transform hover:-translate-y-1 hover:border-amber-400 cursor-pointer" data-type="Índice UV" data-value="${weather.uvIndex}">
                                <div class="flex items-center space-x-3 mb-2"><span class="text-2xl">${uiIcon("sun")}</span><span class="text-sm font-semibold text-gray-400 uppercase">${t("Índice UV")}</span></div><p class="text-xl md:text-2xl font-bold text-white"><span class="${uvColorClass}">${weather.uvIndex}</span> ${t("de 11")}</p>
                            </button>
                            ${this.renderDetailCard(t("Qualidade do Ar"), `${weather.airQuality} (${getAirQualityLabel(weather.airQuality)})`, uiIcon("leaf"), "Qualidade do Ar", true, weather.airQuality)}
                            ${this.renderDetailCard(t("Ponto de Orvalho"), `${weather.dewPoint}°C`, uiIcon("drop"), "Ponto de Orvalho", true, weather.dewPoint)}
                        </div>
                    </div>
                `;
    document
      .getElementById("open-season-modal")
      .addEventListener("click", () => self.openSeasonModal(weather.seasonKey));
    document
      .getElementById("location-selector")
      .addEventListener("change", (e) => self.changeLocation(e.target.value));
    document.querySelectorAll("[data-event-key]").forEach((button) => {
      button.addEventListener("click", () =>
        self.openEventNews(
          button.dataset.eventKey,
          button.dataset.eventDate,
          Number(button.dataset.daysAhead),
        ),
      );
    });
    document.querySelectorAll(".detail-card-interactive").forEach((card) => {
      card.addEventListener("click", (e) => {
        const type = e.currentTarget.dataset.type;
        const val = e.currentTarget.dataset.value;
        self.openDetailModalWithVal(type, val, weather.conditionKey);
      });
    });
    setTimeout(() => {
      // Centraliza a hora atual APENAS na faixa horizontal (sem mover a página)
      const strip = document.getElementById("hourly-forecast-container");
      const currentHourCard = document.getElementById("current-hour-forecast");
      if (strip && currentHourCard) {
        strip.scrollTo({
          left:
            currentHourCard.offsetLeft -
            strip.clientWidth / 2 +
            currentHourCard.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }, 100);
    this.applyStaticTranslations();
  },
};
