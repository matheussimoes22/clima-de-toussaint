import { findWeatherEvent } from "../engine/weather-events.js";
import { bloodMoonIcon, uiIcon } from "../views/interface-icons.js";
/**
 * Controlador da interface, navegação, persistência e renderização das telas.
 * Compõe os módulos de dados, idioma, histórico, recordes e motor climático.
 */

import {
  ELVEN_DATA,
  ELVEN_SAVAEDS,
  ELVEN_SEASONS_INFO,
  LOCATIONS,
  SEASONS,
} from "../data/world-data.js";
import {
  getAirQualityLabel,
  getCurrentLanguage,
  getMetricDescription,
  getUvColorClass,
  ICON_MOONRISE,
  ICON_MOONSET,
  ICON_SUNRISE,
  ICON_SUNSET,
  REAL_DATE,
  setCurrentLanguage,
  t,
  tCondName,
  tHoliday,
  tLocale,
  tLocationName,
  tMoonName,
  tSeasonDesc,
  tSeasonName,
} from "../i18n/translations.js";
import {
  isBloodMoonVisible,
  resolveWxSvg,
  WeatherEngine,
} from "../engine/weather-engine.js";
import {
  APP_HISTORY_ID,
  createHistoryState,
  getHistoryDepth,
  getInitialView,
  pushLayer,
  pushView,
  replaceInitialHistory,
} from "../navigation/history-router.js";
import {
  localDateFromKey,
  loadRecords,
  observeTemperature,
  saveRecords,
  updateLocationRecord,
} from "../state/records.js";
import {
  readStoredChoice,
  readStoredInteger,
  readStoredJson,
  writeStoredValue,
} from "../state/preferences.js";

import { EventBulletinView } from "../views/event-bulletins.js";
import { TodayView } from "../views/today-view.js";
import { CalendarView } from "../views/calendar-view.js";
import { MonthlyView } from "../views/monthly-view.js";
import { MoonView } from "../views/moon-view.js";

// --- APP PRINCIPAL ---
export const App = {
  ...EventBulletinView,
  ...TodayView,
  ...CalendarView,
  ...MonthlyView,
  ...MoonView,
  state: {
    currentView: readStoredChoice(
      "toussaintApp_currentView",
      ["today", "calendar", "monthly", "moon"],
      "today",
    ),
    currentDate: REAL_DATE,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 3),
    calendarMonth: readStoredInteger(
      "toussaintApp_calendarMonth",
      REAL_DATE.getMonth(),
      { min: 0, max: 11 },
    ),
    calendarYear: readStoredInteger(
      "toussaintApp_calendarYear",
      REAL_DATE.getFullYear(),
      { min: 1, max: 9999 },
    ),
    isElven:
      readStoredChoice("toussaintApp_isElven", ["true", "false"], "false") ===
      "true",
    currentLocation: readStoredChoice(
      "toussaintApp_location",
      Object.keys(LOCATIONS),
      "beauclair",
    ),
    lastRenderedHour: null,
    records: loadRecords(),
    diary: readStoredJson("toussaintApp_diary", {}),
    lang: readStoredChoice("toussaintApp_lang", ["pt", "en"], "pt"),
  },

  elements: {
    main: document.getElementById("main-content"),
    navButtons: document.querySelectorAll(".nav-button"),
    modal: document.getElementById("modal"),
    modalContent: document.getElementById("modal-content"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close"),
    desktopAlert: document.getElementById("desktop-alert-container"),
    mobileAlert: document.getElementById("mobile-alert-container"),
    elfToggle: document.getElementById("elf-toggle"),
    elfStatus: document.getElementById("elf-status"),
  },

  init() {
    const self = this;
    this.elements.navButtons.forEach((btn) =>
      btn.addEventListener("click", () =>
        self.navigate(btn.dataset.view, { historyMode: "push" }),
      ),
    );
    this.elements.modalClose.addEventListener("click", () => self.closeModal());
    this.elements.modal.addEventListener("click", (e) => {
      if (e.target === self.elements.modal) self.closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (!self.elements.modal.classList.contains("open")) return;
      if (event.key === "Escape") self.closeModal();
      if (event.key === "Tab") self.trapModalFocus(event);
    });

    // Menu de ajustes mobile (engrenagem)
    const settingsBtn = document.getElementById("mobile-settings-btn");
    const settingsPanel = document.getElementById("mobile-settings-panel");
    if (settingsBtn && settingsPanel) {
      this.settingsBtn = settingsBtn;
      this.settingsPanel = settingsPanel;
      settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !settingsPanel.classList.contains("open");
        if (willOpen) {
          self.setSettingsOpen(true);
          pushLayer(self.state.currentView, "settings");
        } else {
          self.closeSettings();
        }
      });
      settingsPanel.addEventListener("click", (e) => e.stopPropagation());
      document.addEventListener("click", (event) => {
        if (
          !settingsPanel.contains(event.target) &&
          !settingsBtn.contains(event.target)
        ) {
          self.closeSettings();
        }
      });
      this.elements.navButtons.forEach((btn) =>
        btn.addEventListener("click", () => self.setSettingsOpen(false)),
      );
    }

    const elfInputs = document.querySelectorAll(".elf-toggle-input");
    elfInputs.forEach((inp) => {
      inp.checked = this.state.isElven;
    });
    this.updateElfStatusLabel();
    elfInputs.forEach((inp) => {
      inp.addEventListener("change", (e) => {
        self.state.isElven = e.target.checked;
        writeStoredValue("toussaintApp_isElven", self.state.isElven);
        elfInputs.forEach((x) => {
          x.checked = self.state.isElven;
        });
        self.updateElfStatusLabel();
        self.render();
      });
    });

    // Language buttons
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        self.state.lang = btn.dataset.lang;
        setCurrentLanguage(self.state.lang);
        writeStoredValue("toussaintApp_lang", self.state.lang);
        self.updateLangButtons();
        self.applyStaticTranslations();
        self.updateElfStatusLabel();
        self.render();
        self.checkAlerts();
      });
    });
    setCurrentLanguage(this.state.lang);
    this.updateLangButtons();
    this.applyStaticTranslations();

    const initialView = getInitialView(this.state.currentView);
    replaceInitialHistory(initialView);
    window.addEventListener("popstate", (event) => {
      self.applyHistoryState(event.state);
    });
    window.addEventListener("toussaint:native-back", () => {
      self.handleNativeBack();
    });
    this.refreshAllLocationRecords(this.state.currentDate);
    this.navigate(initialView, { historyMode: "none" });
    this.checkAlerts();

    setInterval(
      () => {
        this.state.lastUpdate = new Date();
        if (this.state.currentView === "today") this.renderToday();
      },
      1000 * 60 * 3,
    );

    setInterval(() => {
      const previousDay = self.dateKey(self.state.currentDate);
      const previousHour = self.state.currentDate.getHours();
      self.state.currentDate = new Date();
      if (
        self.state.currentDate.getHours() !== previousHour ||
        self.dateKey(self.state.currentDate) !== previousDay
      ) {
        self.checkAlerts();
        if (self.state.currentView === "today") self.renderToday();
        self.applyWeatherFx(
          WeatherEngine.getCurrentWeather(
            self.state.currentDate,
            self.state.currentLocation,
          ),
        );
      }
      if (self.dateKey(self.state.currentDate) !== previousDay) {
        const recordsChanged = self.refreshAllLocationRecords(
          self.state.currentDate,
        );
        if (recordsChanged && self.state.currentView === "monthly") {
          self.renderMonthly();
        }
      }
      if (self.state.currentView === "today") {
        const clockEl = document.getElementById("real-time-clock");
        const dateEl = document.getElementById("real-time-date");
        if (clockEl)
          clockEl.textContent = self.state.currentDate.toLocaleString(
            tLocale(),
            { hour: "2-digit", minute: "2-digit", second: "2-digit" },
          );
        if (
          dateEl &&
          dateEl.dataset.fullDate !== self.state.currentDate.toDateString()
        ) {
          dateEl.textContent = self.formatDate(self.state.currentDate);
          dateEl.dataset.fullDate = self.state.currentDate.toDateString();
        }
      }
      const currentHour = self.state.currentDate.getHours();
      if (
        self.state.lastRenderedHour !== null &&
        self.state.lastRenderedHour !== currentHour &&
        self.state.currentView === "today"
      ) {
        self.renderToday();
      }
    }, 1000);
  },

  updateElfStatusLabel() {
    const txt = this.state.isElven ? t("Aen Seidhe") : t("Desligado");
    this.elements.elfStatus.innerHTML = `<span class="typewriter">${txt}</span>`;
    this.elements.elfStatus.classList.toggle(
      "text-amber-400",
      this.state.isElven,
    );
  },

  updateLangButtons() {
    document.querySelectorAll(".lang-btn").forEach((b) => {
      const isActive = b.dataset.lang === this.state.lang;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-pressed", String(isActive));
    });
    const html = document.getElementById("html-root");
    if (html)
      html.setAttribute("lang", this.state.lang === "en" ? "en" : "pt-br");
  },
  applyStaticTranslations() {
    document.querySelectorAll("[data-key]").forEach((el) => {
      el.textContent = t(el.dataset.key);
    });
    document.querySelectorAll("[data-aria-key]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.ariaKey));
    });
    document.title =
      this.state.lang === "en" ? "Toussaint Weather" : "Clima de Toussaint";
  },

  // Salvar nota do diário do viajante (key = YYYY-MM-DD)
  saveDiaryNote(dateKey, text) {
    if (!text || !text.trim()) {
      delete this.state.diary[dateKey];
    } else {
      this.state.diary[dateKey] = text.trim();
    }
    writeStoredValue("toussaintApp_diary", JSON.stringify(this.state.diary));
  },
  getDiaryNote(dateKey) {
    return this.state.diary[dateKey] || "";
  },
  dateKey(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  },

  /** Troca a tela ativa e, quando solicitado, cria uma entrada no histórico. */
  navigate(view, { historyMode = "push" } = {}) {
    if (!["today", "calendar", "monthly", "moon"].includes(view)) return;
    const previousView = this.state.currentView;
    this.setModalOpen(false, { restoreFocus: false });
    this.setSettingsOpen(false);
    this.state.currentView = view;
    writeStoredValue("toussaintApp_currentView", view);
    if (historyMode === "push") pushView(view, previousView);
    if (view !== "calendar") {
      const now = new Date();
      this.state.calendarMonth = now.getMonth();
      this.state.calendarYear = now.getFullYear();
      writeStoredValue("toussaintApp_calendarMonth", this.state.calendarMonth);
      writeStoredValue("toussaintApp_calendarYear", this.state.calendarYear);
    }
    this.render();
    this.elements.navButtons.forEach((btn) => {
      if (btn.dataset.view === view) {
        btn.classList.add("text-amber-400", "bg-slate-800");
        btn.classList.remove(
          "text-gray-400",
          "hover:bg-slate-800",
          "hover:text-amber-400",
        );
        btn.setAttribute("aria-current", "page");
      } else {
        btn.classList.remove("text-amber-400", "bg-slate-800");
        btn.classList.add(
          "text-gray-400",
          "hover:bg-slate-800",
          "hover:text-amber-400",
        );
        btn.removeAttribute("aria-current");
      }
    });
  },

  /** Aplica uma entrada recuperada pelo botão/gesto Voltar ou Avançar. */
  applyHistoryState(rawState) {
    const previousView = this.state.currentView;
    const wasModalOpen = this.elements.modal.classList.contains("open");
    const state =
      rawState?.appId === APP_HISTORY_ID
        ? rawState
        : createHistoryState(getInitialView("today"));
    if (state.view !== this.state.currentView) {
      this.navigate(state.view, { historyMode: "none" });
    }
    this.setSettingsOpen(state.layer === "settings");
    this.setModalOpen(state.layer === "modal", {
      restoreFocus:
        wasModalOpen && state.layer !== "modal" && state.view === previousView,
    });
    this._historyClosePending = false;
  },

  /** Trata o Voltar nativo sem permitir que a tela raiz encerre o aplicativo. */
  handleNativeBack() {
    if (this.settingsPanel?.classList.contains("open")) {
      this.closeSettings();
      return;
    }
    if (this.elements.modal.classList.contains("open")) {
      this.closeModal();
      return;
    }
    if (getHistoryDepth() > 0) {
      history.back();
      return;
    }
    if (this.state.currentView !== "today") {
      this.navigate("today", { historyMode: "none" });
      replaceInitialHistory("today");
    }
  },

  /** Abre ou fecha visualmente o painel de ajustes sem alterar o histórico. */
  setSettingsOpen(isOpen) {
    if (!this.settingsBtn || !this.settingsPanel) return;
    this.settingsPanel.classList.toggle("open", isOpen);
    this.settingsPanel.setAttribute("aria-hidden", String(!isOpen));
    this.settingsPanel.inert = !isOpen;
    this.settingsBtn.classList.toggle("open", isOpen);
    this.settingsBtn.setAttribute("aria-expanded", String(isOpen));
  },

  /** Fecha ajustes pela entrada anterior quando a camada pertence ao app. */
  closeSettings() {
    if (!this.settingsPanel?.classList.contains("open")) return;
    if (
      history.state?.appId === APP_HISTORY_ID &&
      history.state.layer === "settings"
    ) {
      if (this._historyClosePending) return;
      this._historyClosePending = true;
      this.setSettingsOpen(false);
      history.back();
    } else {
      this.setSettingsOpen(false);
    }
  },

  /** Abre o diálogo e, no calendário, expande visualmente a partir do card. */
  openModal({ variant = "default", sourceElement = null } = {}) {
    clearTimeout(this._modalCloseCleanup);
    this._modalCloseAnimation?.cancel?.();
    this._modalCloseAnimation = null;
    this._historyClosePending = false;
    this._focusBeforeModal = document.activeElement;
    this.setSettingsOpen(false);
    this.elements.modal.classList.toggle("day-detail-modal", variant === "day");
    this._dayModalSource = variant === "day" ? sourceElement : null;
    this.setModalOpen(true);
    if (variant === "day" && sourceElement) {
      // Instala a transformação antes da próxima pintura para não exibir
      // o painel grande por um quadro antes de ele nascer do card.
      this.animateDayModalFrom(sourceElement);
    }
    pushLayer(this.state.currentView, "modal");
  },

  /** Executa um FLIP: o painel nasce do retângulo do dia selecionado. */
  animateDayModalFrom(sourceElement) {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !sourceElement?.isConnected ||
      !this.elements.modalContent?.animate
    )
      return;
    const source = sourceElement.getBoundingClientRect();
    const target = this.elements.modalContent.getBoundingClientRect();
    if (!source.width || !target.width) return;
    const translateX =
      source.left + source.width / 2 - (target.left + target.width / 2);
    const translateY =
      source.top + source.height / 2 - (target.top + target.height / 2);
    const scaleX = Math.max(0.08, source.width / target.width);
    const scaleY = Math.max(0.08, source.height / target.height);
    this._modalAnimation?.cancel?.();
    this._modalAnimation = this.elements.modalContent.animate(
      [
        {
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
          opacity: 0.92,
          offset: 0,
        },
        {
          transform: `translate(${translateX * 0.82}px, ${translateY * 0.82}px) scale(${Math.min(1, scaleX * 1.18)}, ${Math.min(1, scaleY * 1.18)})`,
          opacity: 1,
          offset: 0.2,
        },
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
          offset: 1,
        },
      ],
      {
        duration: 560,
        easing: "cubic-bezier(.18,.82,.2,1)",
      },
    );
    const revealTargets = [
      this.elements.modalContent.firstElementChild,
      this.elements.modalBody,
    ].filter(Boolean);
    revealTargets.forEach((element) =>
      element.animate(
        [
          { opacity: 0, transform: "translateY(12px)", offset: 0 },
          { opacity: 0, transform: "translateY(12px)", offset: 0.24 },
          { opacity: 1, transform: "translateY(0)", offset: 1 },
        ],
        { duration: 560, easing: "cubic-bezier(.18,.8,.2,1)" },
      ),
    );
    sourceElement.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(0.96)", opacity: 0.72 },
      ],
      { duration: 150, easing: "ease-out" },
    );
  },

  /** Recolhe a folha no card de origem quando ele ainda está no calendário. */
  animateDayModalToSource() {
    const sourceElement = this._dayModalSource;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !sourceElement?.isConnected ||
      !this.elements.modalContent?.animate
    )
      return Promise.resolve();
    const source = sourceElement.getBoundingClientRect();
    const target = this.elements.modalContent.getBoundingClientRect();
    const translateX =
      source.left + source.width / 2 - (target.left + target.width / 2);
    const translateY =
      source.top + source.height / 2 - (target.top + target.height / 2);
    const scaleX = Math.max(0.08, source.width / target.width);
    const scaleY = Math.max(0.08, source.height / target.height);
    this._modalCloseAnimation = this.elements.modalContent.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${translateX * 0.84}px, ${translateY * 0.84}px) scale(${Math.max(0.08, scaleX * 1.16)}, ${Math.max(0.08, scaleY * 1.16)})`,
          opacity: 0.9,
          offset: 0.78,
        },
        {
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
          // O painel some antes de permanecer sobre o card de origem. Sem
          // isso, o quadro final parece uma miniatura/artefato no calendário.
          opacity: 0,
        },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(.4,0,.8,.2)",
        fill: "forwards",
      },
    );
    return this._modalCloseAnimation.finished.catch(() => undefined);
  },

  openDetailModal(type) {
    this.elements.modalTitle.textContent = t(type);
    const info = t("Informação não disponível.");
    this.elements.modalBody.innerHTML = `<div class="p-4 rounded-lg bg-slate-700 border border-slate-600"><p class="text-gray-200 text-lg leading-relaxed">${info}</p></div>`;
    this.openModal();
  },

  openDetailModalWithVal(type, val, conditionKey) {
    this.elements.modalTitle.textContent = t(type);
    const desc = getMetricDescription(type, val, conditionKey);
    this.elements.modalBody.innerHTML = `<div class="p-4 rounded-lg bg-slate-700 border border-slate-600"><p class="text-gray-200 text-lg leading-relaxed">${desc}</p></div>`;
    this.openModal();
  },

  /** Retorna o recorde versionado de uma única região. */
  getRecord(locationKey) {
    return this.state.records.byLocation[locationKey];
  },

  /** Registra o dia observado em uma localidade explicitamente informada. */
  updateRecords(weather, locationKey = this.state.currentLocation) {
    const changed = observeTemperature(
      this.state.records,
      locationKey,
      weather.currentTemp,
      this.dateKey(weather.date || this.state.currentDate),
    );
    if (changed) saveRecords(this.state.records);
    return changed;
  },

  /** Avalia o clima do dia para todas as regiões sem misturar seus históricos. */
  refreshAllLocationRecords(date) {
    const today = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
    );
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let changed = false;
    for (const locationKey of Object.keys(LOCATIONS)) {
      const record = this.getRecord(locationKey);
      const lastEvaluated = localDateFromKey(record.lastEvaluatedDate);
      const cursor = lastEvaluated
        ? new Date(lastEvaluated)
        : new Date(yesterday);
      if (lastEvaluated) cursor.setDate(cursor.getDate() + 1);

      // Somente dias encerrados entram com máxima e mínima diárias completas.
      while (cursor <= yesterday) {
        const weather = WeatherEngine.getWeatherForDay(cursor, locationKey);
        changed =
          updateLocationRecord(
            this.state.records,
            locationKey,
            weather,
            this.dateKey(cursor),
          ) || changed;
        cursor.setDate(cursor.getDate() + 1);
      }

      // No dia atual registra apenas a temperatura que já aconteceu.
      const current = WeatherEngine.getCurrentWeather(date, locationKey);
      changed =
        observeTemperature(
          this.state.records,
          locationKey,
          current.currentTemp,
          this.dateKey(today),
        ) || changed;
    }
    if (changed) saveRecords(this.state.records);
    return changed;
  },

  resetCalendar() {
    const now = new Date();
    this.state.calendarMonth = now.getMonth();
    this.state.calendarYear = now.getFullYear();
    writeStoredValue("toussaintApp_calendarMonth", this.state.calendarMonth);
    writeStoredValue("toussaintApp_calendarYear", this.state.calendarYear);
    this.renderCalendar();
  },

  render() {
    switch (this.state.currentView) {
      case "today":
        this.renderToday();
        break;
      case "calendar":
        this.renderCalendar();
        break;
      case "monthly":
        this.renderMonthly();
        break;
      case "moon":
        this.renderMoon();
        break;
    }
    // Animação de entrada
    this.elements.main.classList.remove("view-enter");
    void this.elements.main.offsetWidth; // reflow para reiniciar animação
    this.elements.main.classList.add("view-enter");
    // Aplicar efeito climático ao fundo (usa view 'today' como referência)
    const w = WeatherEngine.getCurrentWeather(
      this.state.currentDate,
      this.state.currentLocation,
    );
    this.applyWeatherFx(w);
  },

  changeLocation(key) {
    this.state.currentLocation = key;
    writeStoredValue("toussaintApp_location", key);
    this.render();
    this.checkAlerts();
  },

  getElvenData(date) {
    const targetYear = date.getFullYear();

    // Construir marcos de início de Savaed para o ano atual e anterior
    // para garantir que pegamos o Savaed correto mesmo na virada do ano
    let checkPoints = [];
    [targetYear - 1, targetYear].forEach((yr) => {
      ELVEN_SAVAEDS.forEach((s) => {
        checkPoints.push({
          name: s.name,
          date: new Date(yr, s.startMonth, s.startDay),
          isNewYearStart: s.name === "Saovine",
        });
      });
    });

    // Ordenar por data
    checkPoints.sort((a, b) => a.date - b.date);

    // Encontrar o último marco que é <= data alvo
    let currentSavaed = checkPoints[0];
    let currentSavaedIndex = 0;

    for (let i = 0; i < checkPoints.length; i++) {
      if (date >= checkPoints[i].date) {
        currentSavaed = checkPoints[i];
        currentSavaedIndex = i;
      } else {
        break;
      }
    }

    // Calcular dia dentro do Savaed (contínuo)
    const diffTime = date - currentSavaed.date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const elvenDay = diffDays + 1; // Dia 1 no início

    // Calcular Ano Élfico
    // Se a data atual for maior ou igual ao Saovine (Nov 1) do ano corrente, é Ano Novo
    // Base: 1276 (2024 humano aprox - 750)
    // Se estamos APÓS Saovine do ano X, o ano élfico é X - 750 + 1.
    // Se estamos ANTES, é X - 750.
    // Mas cuidado com jan/fev. Jan 2024 é depois de Saovine 2023.

    let elvenYear = targetYear - 750;
    // Encontrar o Saovine específico deste ciclo
    const saovineThisYear = new Date(targetYear, 10, 1); // 1 Nov
    if (date >= saovineThisYear) {
      elvenYear += 1;
    }

    return {
      day: elvenDay,
      savaed: currentSavaed.name,
      year: elvenYear,
    };
  },

  getElvenDateString(date) {
    const data = this.getElvenData(date);
    return getCurrentLanguage() === "en"
      ? `Day ${data.day} of the Savaed of ${data.savaed} of ${data.year}`
      : `Dia ${data.day} do Savaed de ${data.savaed} de ${data.year}`;
  },

  formatDate(date, options = {}) {
    const loc = tLocale();
    if (!this.state.isElven) {
      if (
        options.month === "short" &&
        options.day === "numeric" &&
        options.year === "numeric"
      )
        return date.toLocaleString(loc, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      if (options.month === "short" && options.day === "numeric")
        return date.toLocaleString(loc, {
          weekday: options.weekday,
          month: "short",
          day: "numeric",
        });
      if (options.weekday === "long")
        return date.toLocaleString(loc, {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      return date.toLocaleString(loc, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else {
      if (
        options.month === "short" &&
        options.day === "numeric" &&
        options.year === "numeric"
      ) {
        const data = this.getElvenData(date);
        return `${t("Dia")} ${data.day} ${data.savaed} ${getCurrentLanguage() === "en" ? "of" : "de"} ${data.year}`;
      }
      if (options.month === "short" && options.day === "numeric") {
        const data = this.getElvenData(date);
        const weekday = options.weekday
          ? `${date.toLocaleString(loc, { weekday: options.weekday })}, `
          : "";
        return `${weekday}${t("Dia")} ${data.day} ${data.savaed}`;
      }
      return this.getElvenDateString(date);
    }
  },

  // === FUNDO CLIMÁTICO ===
  applyWeatherFx(weather) {
    const cls = [
      "fx-rain",
      "fx-rain-heavy",
      "fx-storm",
      "fx-snow",
      "fx-fog",
      "fx-sun",
      "fx-night",
      "fx-stars",
      "fx-bloodmoon",
    ];
    document.body.classList.remove(...cls);
    const k = weather.conditionKey || "";
    const isNight = k.includes("night");
    const isBloodActive =
      weather.moon &&
      weather.moon.isBloodMoon &&
      this.state.currentDate.getHours() >= 0 &&
      this.state.currentDate.getHours() <= 3;

    if (k.includes("storm"))
      document.body.classList.add("fx-storm", "fx-rain-heavy");
    else if (k.includes("heavy_rain"))
      document.body.classList.add("fx-rain-heavy");
    else if (k.includes("rain")) document.body.classList.add("fx-rain");
    else if (k.includes("snow")) document.body.classList.add("fx-snow");
    else if (k.includes("fog")) document.body.classList.add("fx-fog");
    else if (k === "clear_day") document.body.classList.add("fx-sun");
    else if (isNight) {
      document.body.classList.add("fx-night");
      if (k === "clear_night") document.body.classList.add("fx-stars");
    }

    if (isBloodActive) document.body.classList.add("fx-bloodmoon");
  },

  // === SVG da Lua com iluminação real (renderMoon) ===
  renderMoonSvg(phaseIndex, illumination, isBloodMoon) {
    if (isBloodMoon) return bloodMoonIcon("blood-moon-icon--hero");

    // illumination 0-100; phaseIndex 0-7 (0=nova, 4=cheia)
    const isWaning = phaseIndex > 4;
    const lit = Math.max(0, Math.min(100, illumination)) / 100; // 0..1
    const cls = "moon-svg";
    const moonColor = "#e2e8f0";
    const shadow = "#1f2937";
    // Construir terminador: usar elipse deslocada para criar o crescente
    // r=80, terminator é uma elipse com rx variando
    const r = 80;
    const rx = Math.max(0, (1 - lit) * r);
    // Posição: se waxing (phase 1-3) terminator no lado esquerdo, waning (5-7) à direita
    // phase 0 (nova) = tudo escuro; phase 4 (cheia) = tudo claro
    let body;
    if (phaseIndex === 0) {
      body = `<circle cx="100" cy="100" r="${r}" fill="${shadow}"/>`;
    } else if (phaseIndex === 4) {
      body = `<circle cx="100" cy="100" r="${r}" fill="${moonColor}"/>`;
    } else if (!isWaning) {
      // Crescente: lado direito iluminado
      body = `
                        <circle cx="100" cy="100" r="${r}" fill="${shadow}"/>
                        <path d="M 100 ${100 - r}
                                 A ${r} ${r} 0 0 1 100 ${100 + r}
                                 A ${rx} ${r} 0 0 ${lit > 0.5 ? 1 : 0} 100 ${100 - r} Z" fill="${moonColor}"/>`;
    } else {
      // Minguante: lado esquerdo iluminado
      body = `
                        <circle cx="100" cy="100" r="${r}" fill="${shadow}"/>
                        <path d="M 100 ${100 - r}
                                 A ${r} ${r} 0 0 0 100 ${100 + r}
                                 A ${rx} ${r} 0 0 ${lit > 0.5 ? 0 : 1} 100 ${100 - r} Z" fill="${moonColor}"/>`;
    }
    return `<svg class="${cls}" width="160" height="160" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="60%" stop-color="${moonColor}" stop-opacity="1"/>
                            <stop offset="100%" stop-color="${moonColor}" stop-opacity="0.6"/>
                        </radialGradient>
                    </defs>
                    ${body}
                    <circle cx="100" cy="100" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                </svg>`;
  },

  openDayModal(date, sourceElement = null) {
    const self = this;
    const weather = WeatherEngine.getWeatherForDay(
      date,
      this.state.currentLocation,
    );
    const hourly = WeatherEngine.getHourlyForecast(
      weather,
      this.state.currentLocation,
    );
    const isToday =
      date.toDateString() === this.state.currentDate.toDateString();
    const currentHour = isToday ? this.state.currentDate.getHours() : -1;
    this.elements.modalTitle.textContent = this.formatDate(date, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const displayMoonPhase = this.state.isElven
      ? ELVEN_DATA.moonPhases[weather.moon.name]
      : tMoonName(weather.moon.name);

    // No modal de detalhes, mostra se é Lua de Sangue no geral
    const moonClass = weather.moon.isBloodMoon
      ? "blood-moon-text"
      : "text-white";
    const moonIcon = weather.moon.isBloodMoon
      ? bloodMoonIcon("blood-moon-icon--inline")
      : weather.moon.icon;

    let hourlyHtml = '<div class="flex overflow-x-auto space-x-3 pb-4">';
    hourly.forEach((h) => {
      const hourOfForecast = parseInt(h.hour.split(":")[0]);
      const isCurrentHour = hourOfForecast === currentHour;
      const showBloodMoon = isBloodMoonVisible(
        h.conditionKey,
        hourOfForecast,
        weather.moon.isBloodMoon,
      );
      const displayIcon = showBloodMoon
        ? resolveWxSvg(h.conditionKey, {
            sizeClass: "wx-icon-sm",
            isBloodMoon: true,
          })
        : h.conditionKey === "clear_night"
          ? h.moonIcon
          : resolveWxSvg(h.conditionKey, { sizeClass: "wx-icon-sm" });
      const cardClasses = `${
        isCurrentHour
          ? "flex-shrink-0 w-20 text-center bg-amber-500/20 p-3 rounded-lg border-2 border-amber-400"
          : "flex-shrink-0 w-20 text-center bg-slate-700 p-3 rounded-lg"
      }${showBloodMoon ? " blood-moon-forecast-hour" : ""}`;
      const textClasses = isCurrentHour ? "text-amber-300" : "text-gray-400";
      hourlyHtml += `<div class="${cardClasses}" aria-label="${h.hour}: ${tCondName(h.conditionKey)}, ${h.temp}°, ${Math.round(h.humidity)}% ${t("Umidade")}"><p class="text-sm ${textClasses}">${h.hour}</p><p class="text-2xl my-1" aria-hidden="true">${displayIcon}</p><p class="text-lg font-bold">${h.temp}°</p><p class="text-xs ${textClasses}">${t("Umid.")} ${Math.round(h.humidity)}%</p></div>`;
    });
    hourlyHtml += "</div>";
    let holidayHtml = "";
    if (weather.holiday) {
      const hKey = `${date.getMonth() + 1}-${date.getDate()}`;
      const hLocal = tHoliday(weather.holiday, hKey);
      holidayHtml = `<div class="mt-6 p-4 rounded-lg bg-slate-900 border border-amber-400"><h4 class="font-cinzel text-xl text-amber-400 mb-2">🌟 ${t("Feriado")}: ${hLocal.name}</h4><p class="text-gray-300">${hLocal.desc}</p></div>`;
    }

    // Cards Estáticos no Modal
    let detailsHtml = `<div class="modal-grid-2 grid grid-cols-2 gap-4 mt-6">
                    ${this.renderDetailCard(t("Nascer do Sol"), weather.sunrise, ICON_SUNRISE, "", false)}
                    ${this.renderDetailCard(t("Pôr do Sol"), weather.sunset, ICON_SUNSET, "", false)}
                    ${this.renderDetailCard(t("Nascer da Lua"), weather.moonrise, ICON_MOONRISE, "", false)}
                    ${this.renderDetailCard(t("Ocaso da Lua"), weather.moonset, ICON_MOONSET, "", false)}
                    ${this.renderDetailCard(t("Índice UV"), `<span class="${getUvColorClass(weather.uvIndex)}">${weather.uvIndex}</span> ${t("de 11")}`, uiIcon("sun"), "", false)}
                    ${this.renderDetailCard(t("Qualidade do Ar"), `${weather.airQuality} (${getAirQualityLabel(weather.airQuality)})`, uiIcon("leaf"), "", false)}
                </div>
                <div class="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 col-span-2 mt-4">
                    <div class="flex items-center space-x-3 mb-2"><span class="text-2xl">${moonIcon}</span><span class="text-sm font-semibold text-gray-400 uppercase">${t("Fase Lunar")}</span></div>
                    <p class="text-xl md:text-2xl font-bold ${moonClass}">${displayMoonPhase} (${weather.moon.illumination}%)</p>
                </div>`;

    const overviewIcon = resolveWxSvg(weather.conditionKey, {
      sizeClass: "day-detail-weather-icon",
    });
    const overviewHtml = `<section class="day-detail-hero" aria-label="${tCondName(weather.conditionKey)}, ${t("Max")} ${weather.tempMax}°, ${t("Min")} ${weather.tempMin}°">
      <span class="day-detail-hero-icon" aria-hidden="true">${overviewIcon}</span>
      <div class="day-detail-hero-copy">
        <p class="day-detail-location">${tLocationName(this.state.currentLocation)}</p>
        <p class="day-detail-condition">${tCondName(weather.conditionKey)}</p>
        <p class="day-detail-temperature"><strong>${weather.tempMax}°</strong><span>${weather.tempMin}°</span></p>
      </div>
      <span class="day-detail-rain">${uiIcon("drop")} ${weather.precipChance}%</span>
    </section>`;
    this.elements.modalBody.innerHTML = `${overviewHtml}<h4 class="day-detail-section-title font-cinzel text-lg text-amber-400 mt-6 mb-4">${t("Previsão 24h")}</h4>${hourlyHtml}${detailsHtml}${holidayHtml}`;
    this.openModal({ variant: "day", sourceElement });
    this.elements.modalBody.scrollTop = 0;
  },

  openSeasonModal(currentSeasonKey) {
    this.elements.modalTitle.textContent = t("Estações de Toussaint");
    let modalHtml = '<div class="space-y-4">';
    const seasonsSource = this.state.isElven ? ELVEN_SEASONS_INFO : SEASONS;
    for (const [key, season] of Object.entries(seasonsSource)) {
      const isCurrent = key === currentSeasonKey;
      const bgClass = isCurrent
        ? "bg-slate-900 border border-amber-400"
        : "bg-slate-700 border border-slate-600";
      const titleClass = isCurrent ? "text-amber-400" : "text-white";
      const sName = this.state.isElven ? season.name : tSeasonName(key, season);
      const sDesc = this.state.isElven
        ? season.desc[getCurrentLanguage()] || season.desc.pt
        : tSeasonDesc(key, season);
      modalHtml += `<div class="p-4 rounded-lg ${bgClass}"><h4 class="font-cinzel text-xl ${titleClass} mb-2">${season.icon} ${sName}</h4><p class="text-gray-300">${sDesc}</p></div>`;
    }
    modalHtml += "</div>";
    this.elements.modalBody.innerHTML = modalHtml;
    this.openModal();
    this.elements.modalBody.scrollTop = 0;
  },

  /** Alterna o diálogo visualmente; o histórico é controlado pelos métodos públicos. */
  setModalOpen(isOpen, { restoreFocus = true } = {}) {
    this.elements.modal.classList.toggle("open", isOpen);
    this.elements.modal.setAttribute("aria-hidden", String(!isOpen));
    this.elements.modal.inert = !isOpen;
    Array.from(document.body.children).forEach((child) => {
      if (child !== this.elements.modal) child.inert = isOpen;
    });
    if (isOpen) {
      this.elements.modalClose.focus();
    } else if (restoreFocus && this._focusBeforeModal?.focus) {
      this._focusBeforeModal.focus();
    }
  },

  /** Mantém a navegação por Tab dentro do diálogo enquanto ele estiver aberto. */
  trapModalFocus(event) {
    const focusable = Array.from(
      this.elements.modalContent.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.inert && element.offsetParent !== null);
    if (!focusable.length) {
      event.preventDefault();
      this.elements.modalContent.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  },

  /** Fecha o diálogo pela entrada anterior para que Voltar e o botão X coincidam. */
  closeModal() {
    if (this._modalClosing || this._historyClosePending) return;
    const finish = () => {
      this._modalClosing = false;
      if (
        history.state?.appId === APP_HISTORY_ID &&
        history.state.layer === "modal"
      ) {
        this._historyClosePending = true;
        this.setModalOpen(false);
        history.back();
      } else {
        this.setModalOpen(false);
      }
      // Mantém o último quadro recolhido enquanto o fundo termina de sumir.
      clearTimeout(this._modalCloseCleanup);
      this._modalCloseCleanup = setTimeout(() => {
        this._modalCloseAnimation?.cancel?.();
        this._modalCloseAnimation = null;
      }, 320);
    };
    if (
      this.elements.modal.classList.contains("day-detail-modal") &&
      this.elements.modal.classList.contains("open")
    ) {
      this._modalClosing = true;
      this.animateDayModalToSource().finally(finish);
      return;
    }
    finish();
  },
  renderDetailCard(title, value, icon, type = "", interactive = true) {
    const isInteractive = interactive && type;
    const tag = isInteractive ? "button" : "div";
    const hoverClass = isInteractive
      ? "detail-card-interactive transition-transform transform hover:-translate-y-1 hover:border-amber-400 cursor-pointer w-full text-left"
      : "detail-card-static";
    const plainValue = value.replace ? value.replace(/<[^>]*>/g, "") : value;
    const buttonType = isInteractive ? ' type="button"' : "";
    return `<${tag}${buttonType} class="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 ${hoverClass}" data-type="${type}" data-value="${plainValue}"><div class="flex items-center space-x-3 mb-2"><span class="text-2xl" aria-hidden="true">${icon}</span><span class="text-sm font-semibold text-gray-400 uppercase">${title}</span></div><p class="text-xl md:text-2xl font-bold text-white">${value}</p></${tag}>`;
  },
  renderAlert(message, type = "info") {
    const colors = {
      info: "bg-blue-600",
      warning: "bg-yellow-600",
      danger: "bg-red-700",
    };
    const alertHtml = `<div class="alert-item ${colors[type]} text-white px-4 py-2 rounded-full shadow-md mb-2 flex justify-between items-center text-sm font-medium"><span>${message}</span><button type="button" aria-label="${t("Fechar")}" class="alert-close ml-3 min-w-6 min-h-6 text-lg leading-none opacity-70 hover:opacity-100">&times;</button></div>`;
    this.elements.desktopAlert.insertAdjacentHTML("beforeend", alertHtml);
    const mobileContainer = document.getElementById("mobile-alert-container");
    if (mobileContainer)
      mobileContainer.insertAdjacentHTML("beforeend", alertHtml);
    document.querySelectorAll(".alert-close").forEach((btn) => {
      btn.onclick = (e) => e.target.closest(".alert-item").remove();
    });
  },
  checkAlerts() {
    this.elements.desktopAlert.innerHTML = "";
    const mobileContainer = document.getElementById("mobile-alert-container");
    if (mobileContainer) mobileContainer.innerHTML = "";
    // Os avisos compartilham as horas verificadas dos boletins.
    const occurrence = (key) =>
      findWeatherEvent(
        key,
        this.state.currentDate,
        this.state.currentLocation,
        0,
      );
    if (occurrence("storm"))
      this.renderAlert(t("Alerta: Tempestade prevista para hoje!"), "danger");
    else if (occurrence("snow"))
      this.renderAlert(t("Aviso: Rara neve prevista para hoje!"), "info");
    else if (occurrence("fog")?.isActive)
      this.renderAlert(
        t("Aviso: Neblina intensa. Cuidado nas estradas."),
        "info",
      );
    else if (occurrence("heat")?.isActive)
      this.renderAlert(t("Alerta: Onda de calor no momento"), "warning");
    else if (occurrence("cold")?.isActive)
      this.renderAlert(t("Aviso: Noite fria. Cuidado com a geada."), "info");
    let tomorrow = new Date(this.state.currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowHoliday = WeatherEngine.getHoliday(tomorrow);
    if (tomorrowHoliday) {
      const tKey = `${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`;
      const hLocal = tHoliday(tomorrowHoliday, tKey);
      this.renderAlert(`${t("Amanhã:")} ${hLocal.name}`, "info");
    }
  },
};
