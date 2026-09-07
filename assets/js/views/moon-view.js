/** Renderização dos ciclos, horários e calendário lunar. */

import { ELVEN_DATA } from "../data/world-data.js";
import { t, tDaysLabel, tMoonDesc, tMoonName } from "../i18n/translations.js";
import { WeatherEngine } from "../engine/weather-engine.js";

export const MoonView = {
  renderMoon() {
    const today = this.state.currentDate;
    const phase = WeatherEngine.getLunarPhase(today);
    const displayPhaseName = this.state.isElven
      ? ELVEN_DATA.moonPhases[phase.name]
      : tMoonName(phase.name);
    const phaseDesc = tMoonDesc(phase.name, phase.desc || "");

    const moonClass = phase.isBloodMoon ? "blood-moon-text" : "text-white";
    const moonSvg = this.renderMoonSvg(
      phase.index,
      phase.illumination,
      phase.isBloodMoon,
    );

    let date = new Date(today);
    const findNextPhase = (targetIndex) => {
      let testDate = new Date(date);
      while (true) {
        testDate.setDate(testDate.getDate() + 1);
        const phaseIndex = WeatherEngine.getLunarPhase(testDate).index;
        if (phaseIndex === targetIndex) return testDate;
      }
    };
    const nextNewMoonDate = findNextPhase(0);
    const nextFullMoonDate = findNextPhase(4);
    let nextBloodMoonDate = new Date(today);
    let foundBlood = false;
    for (let i = 0; i < 4000; i++) {
      nextBloodMoonDate.setDate(nextBloodMoonDate.getDate() + 1);
      const checkPhase = WeatherEngine.getLunarPhase(nextBloodMoonDate);
      if (checkPhase.isBloodMoon) {
        foundBlood = true;
        break;
      }
    }

    // Mostrar ano sempre, para clareza ("é esse ano ou no outro?")
    const newMoonStr = this.formatDate(nextNewMoonDate, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const fullMoonStr = this.formatDate(nextFullMoonDate, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const bloodMoonStr = foundBlood
      ? this.formatDate(nextBloodMoonDate, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : t("Desconhecido");

    // Dias até cada evento (badge auxiliar)
    const daysTo = (d) =>
      Math.max(0, Math.round((d - today) / (1000 * 60 * 60 * 24)));
    const newMoonDays = daysTo(nextNewMoonDate);
    const fullMoonDays = daysTo(nextFullMoonDate);
    const bloodDays = foundBlood ? daysTo(nextBloodMoonDate) : null;
    const daysLabel = (n) => tDaysLabel(n);

    let nextPhasesHtml = `<div class="space-y-3">
                    <div class="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                        <span>${t("Próxima Lua Nova")}</span>
                        <span class="text-right"><span class="font-bold block">${newMoonStr}</span><span class="text-xs text-gray-400">${daysLabel(newMoonDays)}</span></span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                        <span>${t("Próxima Lua Cheia")}</span>
                        <span class="text-right"><span class="font-bold block">${fullMoonStr}</span><span class="text-xs text-gray-400">${daysLabel(fullMoonDays)}</span></span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-900 border border-red-900/50 p-3 rounded-lg mt-2">
                        <span class="text-red-400 font-semibold">${t("Próxima Lua de Sangue")}</span>
                        <span class="text-right">
                            <span class="font-bold block text-red-200">${bloodMoonStr}</span>
                            <span class="text-xs text-red-400/70">${foundBlood ? daysLabel(bloodDays) : "—"}</span>
                        </span>
                    </div>
                </div>`;

    this.elements.main.innerHTML = `
                    <div class="max-w-2xl mx-auto text-center">
                        <h1 class="font-cinzel text-3xl text-amber-400 mb-6">${t("Ciclos Lunares")}</h1>
                        <div class="bg-slate-800 p-6 rounded-lg shadow-xl mb-6 border border-slate-700">
                            <div class="flex justify-center my-2">${moonSvg}</div>
                            <h3 class="font-cinzel text-3xl mt-4 ${moonClass}">${displayPhaseName}</h3>
                            <p class="text-xl text-amber-400 mt-2">${phase.illumination}% ${t("Iluminada")}</p>
                            <p class="text-gray-400 mt-4 text-sm leading-relaxed max-w-md mx-auto">${phaseDesc}</p>
                        </div>
                        <h3 class="font-cinzel text-2xl text-amber-400 mb-4">${t("Próximas Fases")}</h3>
                        ${nextPhasesHtml}
                    </div>
                `;
  },
};
