"use client";

import { useState, useEffect } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Función que actualiza el estado
    const handleResize = () => setWidth(window.innerWidth);

    // Suscribirse al evento de cambio de tamaño
    window.addEventListener("resize", handleResize);

    // Limpiar el evento al desmontar el componente para evitar fugas de memoria
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
