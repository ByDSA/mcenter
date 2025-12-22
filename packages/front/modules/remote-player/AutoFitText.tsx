/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect, useRef, useCallback } from "react";

export const useAutoFitText = (options: any = {} ) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const { maxSize = 32,
    minSize = 12,
    step = 0.5,
    debounceMs = 100 } = options;
  const adjustTextSize = useCallback(() => {
    const element = elementRef.current;

    if (!element)
      return;

    const container = element.parentElement;

    if (!container)
      return;

    let fontSize = maxSize;

    element.style.fontSize = `${fontSize}px`;

    // Crear un elemento temporal para medir el texto
    const tester = document.createElement("div");

    tester.style.position = "absolute";
    tester.style.visibility = "hidden";
    tester.style.height = "auto";
    tester.style.width = "auto";
    tester.style.whiteSpace = "nowrap";
    tester.style.fontFamily = getComputedStyle(element).fontFamily;
    tester.style.fontWeight = getComputedStyle(element).fontWeight;
    tester.textContent = element.textContent;

    document.body.appendChild(tester);

    while (fontSize > minSize) {
      tester.style.fontSize = `${fontSize}px`;

      if (tester.offsetWidth <= container.clientWidth
          && tester.offsetHeight <= container.clientHeight)
        break;

      fontSize -= step;
    }

    element.style.fontSize = `${fontSize}px`;
    document.body.removeChild(tester);
  }, [maxSize, minSize, step]);

  useEffect(() => {
    let timeoutId;
    const debouncedAdjust = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(adjustTextSize, debounceMs);
    };

    // Ajustar al montar y cuando cambie el contenido
    adjustTextSize();

    // Observer para detectar cambios en el contenido
    const observer = new MutationObserver(debouncedAdjust);

    if (elementRef.current) {
      observer.observe(elementRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      } );
    }

    // Listener para cambios de tamaño de ventana
    window.addEventListener("resize", debouncedAdjust);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener("resize", debouncedAdjust);
    };
  }, [adjustTextSize, debounceMs]);

  return elementRef;
};

export const AutoFitText = ( { title,
  className,
  maxSize = 32,
  minSize = 12,
  ...props } ) => {
  const titleRef = useAutoFitText( {
    maxSize,
    minSize,
  } );

  return (
    <span
      ref={titleRef}
      className={className}
      title={title}
      {...props}
    >
      {title}
    </span>
  );
};
