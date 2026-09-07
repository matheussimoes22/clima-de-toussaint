/**
 * Integra as telas e camadas do app ao histórico do navegador.
 * No Android, o botão/gesto Voltar passa a fechar uma camada ou retornar à tela anterior.
 */

export const APP_HISTORY_ID = "clima-toussaint";
export const VALID_VIEWS = new Set(["today", "calendar", "monthly", "moon"]);

/** Gera uma URL estática compatível com Netlify, GitHub Pages e modo offline. */
export function viewUrl(view, locationLike = window.location) {
  const url = new URL(locationLike.href);
  url.hash = view === "today" ? "" : view;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Cria o estado mínimo mantido em cada entrada do histórico. */
export function createHistoryState(view, layer = null) {
  return {
    appId: APP_HISTORY_ID,
    view: VALID_VIEWS.has(view) ? view : "today",
    layer,
  };
}

/** Obtém uma tela válida a partir do hash, com fallback para a preferência salva. */
export function getInitialView(savedView, hash = window.location.hash) {
  const hashView = hash.replace(/^#/, "");
  if (VALID_VIEWS.has(hashView)) return hashView;
  return VALID_VIEWS.has(savedView) ? savedView : "today";
}

/** Registra uma navegação do usuário sem duplicar a tela atual. */
export function pushView(view, previousView) {
  const state = createHistoryState(view);
  const shouldReplace = history.state?.layer || previousView === view;
  history[shouldReplace ? "replaceState" : "pushState"](
    state,
    "",
    viewUrl(view),
  );
}

/** Adiciona modal ou ajustes como camada temporária fechável pelo botão Voltar. */
export function pushLayer(view, layer) {
  if (
    history.state?.appId === APP_HISTORY_ID &&
    history.state.layer === layer
  ) {
    return;
  }
  const method = history.state?.layer ? "replaceState" : "pushState";
  history[method](createHistoryState(view, layer), "", viewUrl(view));
}

/** Retorna uma entrada interna para o estado normal da tela atual. */
export function replaceInitialHistory(view) {
  history.replaceState(createHistoryState(view), "", viewUrl(view));
}
