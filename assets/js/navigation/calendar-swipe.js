/** Um deslocamento horizontal deliberado; movimentos verticais sempre cancelam. */
export function swipeDirection(dx, dy, elapsed, width) {
  if (
    elapsed > 900 ||
    Math.abs(dx) < Math.max(55, width * 0.16) ||
    Math.abs(dx) < Math.abs(dy) * 1.8
  )
    return 0;
  return dx < 0 ? 1 : -1;
}

/** Acrescenta gesto touch ao grid, preservando cliques, botões e rolagem vertical. */
export function bindCalendarSwipe(grid, changeMonth) {
  let start = null;
  let suppressClick = false;
  let moving = false;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reset = () => {
    if (grid.style) {
      grid.style.transform = "";
      grid.style.transition = "";
    }
  };
  const settle = () => {
    if (!grid.style) return;
    grid.style.transition = reduced() ? "none" : "transform 180ms ease-out";
    grid.style.transform = "";
  };
  grid.addEventListener(
    "touchstart",
    (event) => {
      if (
        !matchMedia("(max-width: 767px)").matches ||
        event.touches.length !== 1
      ) {
        start = null;
        settle();
        return;
      }
      if (moving) return;
      suppressClick = false;
      reset();
      const touch = event.touches[0];
      start = { x: touch.clientX, y: touch.clientY, time: performance.now() };
    },
    { passive: true },
  );
  grid.addEventListener(
    "touchmove",
    (event) => {
      if (!start || event.touches.length !== 1) {
        settle();
        start = null;
        return;
      }
      const touch = event.touches[0];
      const dx = touch.clientX - start.x,
        dy = touch.clientY - start.y;
      if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx) / 1.8) {
        start = null;
        settle();
        return;
      }
      if (
        Math.abs(dx) > 12 &&
        Math.abs(dx) > Math.abs(dy) * 1.8 &&
        grid.style
      ) {
        grid.style.transform = reduced()
          ? ""
          : `translateX(${Math.max(-grid.clientWidth * 0.4, Math.min(grid.clientWidth * 0.4, dx * 0.65))}px)`;
      }
    },
    { passive: true },
  );
  grid.addEventListener("touchcancel", () => {
    start = null;
    settle();
  });
  grid.addEventListener(
    "touchend",
    (event) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const delta = swipeDirection(
        touch.clientX - start.x,
        touch.clientY - start.y,
        performance.now() - start.time,
        grid.clientWidth,
      );
      start = null;
      if (!delta) {
        settle();
        return;
      }
      event.preventDefault();
      suppressClick = true;
      if (!grid.animate || reduced()) {
        reset();
        changeMonth(delta);
        return;
      }
      moving = true;
      const animation = grid.animate(
        [
          { transform: grid.style.transform || "translateX(0)", opacity: 1 },
          {
            transform: `translateX(${-delta * grid.clientWidth * 0.55}px)`,
            opacity: 0,
          },
        ],
        { duration: 150, easing: "ease-in", fill: "forwards" },
      );
      animation.finished
        .then(() => {
          if (!grid.isConnected) return;
          changeMonth(delta);
          const next = document.getElementById("calendar-grid");
          next?.animate(
            [
              { transform: `translateX(${delta * 60}px)`, opacity: 0 },
              { transform: "translateX(0)", opacity: 1 },
            ],
            { duration: 210, easing: "cubic-bezier(.2,.8,.2,1)" },
          );
        })
        .catch(() => {
          moving = false;
          reset();
        });
    },
    { passive: false },
  );
  grid.addEventListener(
    "click",
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClick = false;
      }
    },
    true,
  );
}
