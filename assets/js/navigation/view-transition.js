/** Entrada original: dissolução e subida de 12 px, reiniciada em cada navegação. */
export function animateViewEntry(main, previousAnimation) {
  previousAnimation?.cancel();
  main.classList.remove("view-enter");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  if (typeof main.animate === "function")
    return main.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 450, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "none" },
    );
  void main.offsetWidth;
  main.classList.add("view-enter");
  return null;
}
