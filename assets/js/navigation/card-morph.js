/** Transforms a snapshot of the selected calendar cell into its detail sheet. */
export function morphCalendarCard(
  source,
  panel,
  closing = false,
  currentRect = null,
) {
  const from = source.getBoundingClientRect();
  const to = panel.getBoundingClientRect();
  const surface = document.createElement("div");
  const snapshot = source.cloneNode(true);
  const properties = [
    "display",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "width",
    "height",
    "padding",
    "margin",
    "gap",
    "align-items",
    "justify-content",
    "flex-direction",
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "text-align",
    "color",
    "background",
    "border",
    "border-radius",
    "opacity",
    "fill",
    "stroke",
  ];
  const originals = [source, ...source.querySelectorAll("*")];
  const copies = [snapshot, ...snapshot.querySelectorAll("*")];
  originals.forEach((element, index) => {
    const style = getComputedStyle(element);
    for (const property of properties)
      copies[index].style.setProperty(
        property,
        style.getPropertyValue(property),
      );
    copies[index].removeAttribute("id");
  });
  const sourceStyle = getComputedStyle(source);
  const panelStyle = getComputedStyle(panel);
  const sx = from.width / to.width,
    sy = from.height / to.height;
  // The surface has its final dimensions, so text in the detail sheet never
  // has to be rasterized repeatedly while the small card grows.
  surface.style.cssText = `position:fixed;left:${to.left}px;top:${to.top}px;width:${to.width}px;height:${to.height}px;z-index:60;pointer-events:none;overflow:hidden;transform-origin:0 0;will-change:transform;box-sizing:border-box;`;
  surface.style.background = sourceStyle.background;
  surface.style.border = panelStyle.border;
  surface.style.borderRadius = panelStyle.borderRadius;
  surface.setAttribute("aria-hidden", "true");
  snapshot.style.cssText += `;position:absolute;left:0;top:0;margin:0;width:${from.width}px;height:${from.height}px;transform-origin:0 0;transform:scale(${1 / sx},${1 / sy});pointer-events:none;`;
  snapshot.tabIndex = -1;
  surface.append(snapshot);
  document.body.append(surface);
  const small = `translate3d(${from.left - to.left}px,${from.top - to.top}px,0) scale(${sx},${sy})`;
  const large =
    closing && currentRect
      ? `translate3d(${currentRect.left - to.left}px,${currentRect.top - to.top}px,0) scale(${currentRect.width / to.width},${currentRect.height / to.height})`
      : "translate3d(0,0,0) scale(1,1)";
  const modal = panel.parentElement;
  modal.classList.toggle("day-card-closing", closing);
  const originalVisibility = source.style.visibility;
  const originalOrigin = panel.style.transformOrigin;
  source.style.visibility = "hidden";
  panel.style.transformOrigin = "0 0";
  const duration = closing ? 300 : 420;
  const options = {
    duration,
    easing: "cubic-bezier(.2,.75,.2,1)",
    fill: "both",
  };
  const movement = closing
    ? [{ transform: large }, { transform: small }]
    : [{ transform: small }, { transform: large }];
  const animation = surface.animate(movement, options);
  // Both layers follow exactly the same geometry. Details replace the cell
  // during expansion, rather than appearing after an empty surface has grown.
  const panelMotion = panel.animate(movement, options);
  const panelFade = panel.animate(
    closing
      ? [{ opacity: 1 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }]
      : [
          { opacity: 0 },
          { opacity: 0, offset: 0.1 },
          { opacity: 1, offset: 0.75 },
          { opacity: 1 },
        ],
    options,
  );
  const surfaceFade = surface.animate(
    closing
      ? [{ opacity: 0 }, { opacity: 1, offset: 0.7 }, { opacity: 1 }]
      : [
          { opacity: 1 },
          { opacity: 1, offset: 0.1 },
          { opacity: 0, offset: 0.75 },
          { opacity: 0 },
        ],
    options,
  );
  const labelAnimation = snapshot.animate(
    closing
      ? [
          { opacity: 0 },
          { opacity: 0, offset: 0.25 },
          { opacity: 1, offset: 0.8 },
          { opacity: 1 },
        ]
      : [
          { opacity: 1 },
          { opacity: 1, offset: 0.12 },
          { opacity: 0, offset: 0.65 },
          { opacity: 0 },
        ],
    options,
  );
  let cleaned = false;
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    surface.remove();
    modal.classList.remove("day-card-closing");
    source.style.visibility = originalVisibility;
    panel.style.transformOrigin = originalOrigin;
    panelMotion.cancel();
    panelFade.cancel();
    surfaceFade.cancel();
    labelAnimation.cancel();
  }
  const finished = animation.finished.then(cleanup, cleanup);
  return {
    finished,
    effect: animation.effect,
    cancel() {
      animation.cancel();
      cleanup();
    },
  };
}
