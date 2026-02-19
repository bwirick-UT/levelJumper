export const canvas = document.getElementById("game");
export const ctx = canvas.getContext("2d");

export function resizeCanvas() {
  const isMobile = window.innerWidth <= 800;
  const margin = isMobile ? 0 : 100;
  canvas.width = window.innerWidth - (margin * 2);
  canvas.height = window.innerHeight - (margin * 2);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);