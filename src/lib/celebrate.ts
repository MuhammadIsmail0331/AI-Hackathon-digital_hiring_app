import confetti from "canvas-confetti";

const BRAND = ["#0d7a5f", "#d97706", "#c2552b", "#fbbf24", "#ffffff"];

/** Brand-colored celebration burst (offer accepted, job completed, profile saved...). */
export function celebrate() {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 38,
    origin: { y: 0.7 },
    colors: BRAND,
  });
  window.setTimeout(() => {
    confetti({
      particleCount: 55,
      spread: 110,
      startVelocity: 30,
      origin: { y: 0.6 },
      colors: BRAND,
    });
  }, 260);
}
