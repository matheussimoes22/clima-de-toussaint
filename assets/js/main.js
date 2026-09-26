/**
 * Ponto de entrada do Clima de Toussaint.
 * Inicializa a interface somente após o documento estar pronto e ativa o modo offline.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const isNativeApp = window.Capacitor?.isNativePlatform?.() === true;
  document.documentElement.classList.toggle("native-app", isNativeApp);

  if (isNativeApp) {
    // Reinicia o efeito a cada toque, inclusive quando a tela já está ativa.
    document.querySelectorAll(".nav-button").forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.remove("is-tapping");
        void button.offsetWidth;
        button.classList.add("is-tapping");
        setTimeout(() => button.classList.remove("is-tapping"), 430);
      });
    });
  }

  try {
    // As folhas nao bloqueiam a splash, mas devem estar prontas antes do aplicativo.
    const styles = Array.from(
      document.querySelectorAll("link[data-app-style]"),
      (link) =>
        link.dataset.failed
          ? Promise.reject(new Error("Falha ao carregar estilos"))
          : link.sheet
            ? Promise.resolve()
            : new Promise((resolve, reject) => {
                link.addEventListener("load", resolve, { once: true });
                link.addEventListener("error", reject, { once: true });
              }),
    );
    const [{ App }] = await Promise.all([
      import("./app/app-controller.js"),
      ...styles,
    ]);
    await App.init();
    // Revela a interface pronta sem aguardar um ciclo da animação.
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("booting");
      const splash = document.getElementById("app-splash");
      splash.classList.add("leaving");
      setTimeout(() => splash.remove(), 240);
    });
  } catch (error) {
    document.getElementById("splash-message").textContent =
      "Não foi possível iniciar o observatório.";
    document.getElementById("splash-retry").hidden = false;
    console.error(error);
    return;
  }

  if (!isNativeApp && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // O aplicativo continua funcional online mesmo se o cache offline falhar.
    });
  }
});
