import styles from "./Modal.module.css";

// Códigos de teclas a bloquear: Espacio, Re Pág, Av Pág, Fin, Inicio, Izq, Arriba, Der, Abajo
const scrollKeys = {
  32: 1,
  33: 1,
  34: 1,
  35: 1,
  36: 1,
  37: 1,
  38: 1,
  39: 1,
  40: 1,
};

function preventDefault(e) {
  // Si el evento viene de dentro del modal activo, NO bloquearlo.
  const isInsideModal = e.target.closest(`.${styles.modal}`);

  if (isInsideModal)
    return;

  e.preventDefault();
}

function preventDefaultForScrollKeys(e: KeyboardEvent) {
  // Solo bloqueamos si es una tecla de scroll
  if (scrollKeys[e.keyCode]) {
    preventDefault(e);

    return false;
  }
}

export function disableInput() {
  // Bloquea rueda del ratón (moderno y legacy)
  window.addEventListener("wheel", preventDefault, {
    passive: false,
  } as AddEventListenerOptions);
  window.addEventListener("DOMMouseScroll", preventDefault, false); // Firefox antiguo

  // Bloquea gestos táctiles (móvil/tablet)
  window.addEventListener("touchmove", preventDefault, {
    passive: false,
  } as AddEventListenerOptions);

  // Bloquea TECLADO (Flechas, Espacio, etc.)
  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}

export function enableInput() {
  window.removeEventListener("wheel", preventDefault, {
    passive: false,
  } as AddEventListenerOptions);
  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener("touchmove", preventDefault, {
    passive: false,
  } as AddEventListenerOptions);
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}
