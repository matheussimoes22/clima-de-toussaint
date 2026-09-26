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

/**
 * Liga o gesto ao trilho com os meses anterior, atual e seguinte.
 * O mês vizinho acompanha o dedo e só passa a ser o mês ativo ao fim do gesto.
 */
export function bindCalendarSwipe(viewport, track, changeMonth) {
  let start = null;
  let suppressClick = false;
  let moving = false;
  let gestureWidth = 0;
  let pendingOffset = null;
  let animationFrame = 0;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const width = () => Math.max(1, gestureWidth || viewport.clientWidth || 1);
  const center = () => -width();

  const setTrackPosition = (offset, transition = "none") => {
    if (!track?.style) return;
    track.style.transition = transition;
    track.style.transform = `translate3d(${center() + offset}px, 0, 0)`;
  };
  const flushTrackPosition = () => {
    if (animationFrame && typeof cancelAnimationFrame === "function")
      cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (pendingOffset === null) return;
    setTrackPosition(pendingOffset);
    pendingOffset = null;
  };
  const scheduleTrackPosition = (offset) => {
    pendingOffset = offset;
    if (animationFrame) return;
    if (typeof requestAnimationFrame !== "function") {
      flushTrackPosition();
      return;
    }
    animationFrame = requestAnimationFrame(() => {
      animationFrame = 0;
      if (pendingOffset === null) return;
      setTrackPosition(pendingOffset);
      pendingOffset = null;
    });
  };
  const settle = () => {
    flushTrackPosition();
    setTrackPosition(
      0,
      reduced() ? "none" : "transform 220ms cubic-bezier(.2,.8,.2,1)",
    );
  };
  const finishMonthChange = (delta) => {
    moving = false;
    changeMonth(delta);
  };
  const moveTo = (delta, suppressFollowingClick = false) => {
    if (!delta || moving) return;
    flushTrackPosition();
    gestureWidth = viewport.clientWidth || gestureWidth;
    suppressClick = suppressFollowingClick;
    if (reduced() || !track?.animate) {
      finishMonthChange(delta);
      return;
    }
    moving = true;
    const from = track.style.transform || `translate3d(${center()}px, 0, 0)`;
    const to = `translate3d(${center() - delta * width()}px, 0, 0)`;
    const animation = track.animate([{ transform: from }, { transform: to }], {
      duration: 260,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "forwards",
    });
    animation.finished
      .then(() => finishMonthChange(delta))
      .catch(() => {
        moving = false;
        settle();
      });
  };

  setTrackPosition(0);
  viewport.addEventListener(
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
      gestureWidth = viewport.clientWidth || 1;
      setTrackPosition(0);
      const touch = event.touches[0];
      start = { x: touch.clientX, y: touch.clientY, time: performance.now() };
    },
    { passive: true },
  );
  viewport.addEventListener(
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
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        event.preventDefault();
        const drag = Math.max(-width(), Math.min(width(), dx));
        scheduleTrackPosition(drag);
      }
    },
    { passive: false },
  );
  viewport.addEventListener("touchcancel", () => {
    start = null;
    settle();
  });
  viewport.addEventListener(
    "touchend",
    (event) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const delta = swipeDirection(
        touch.clientX - start.x,
        touch.clientY - start.y,
        performance.now() - start.time,
        width(),
      );
      start = null;
      if (!delta) {
        settle();
        return;
      }
      event.preventDefault();
      moveTo(delta, true);
    },
    { passive: false },
  );
  viewport.addEventListener(
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
  return { moveTo: (delta) => moveTo(delta, false) };
}
