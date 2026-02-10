import { useState, useMemo, useEffect, ReactNode, useRef, useCallback } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Pagination.module.css";
import { PaginationButtonProps,
  DefaultPageButton } from "./PaginationComponents";

/**
 * Información enviada cuando la página cambia.
 * Se separa el índice interno del valor mostrado.
 */
export type PaginationChangeDetails = {
  pageIndex: number; // El puntero lógico (ej: 0, 1, 2 ó 1, 2, 3)
  pageValue: number | string; // El valor real a mostrar (ej: "Enero", "Febrero" ó 1, 2)
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
};

type BasePaginationProps = {
  initialPageIndex?: number | null; // Índice inicial
  position?: "both" | "bottom" | "top";
  allowClickActive?: boolean;
  maxVisibleButtons?: number; // Número total de botones visibles (incluyendo primero y último)
  // si es undefined, se auto-calcula
  renderButton?: React.FC<PaginationButtonProps>;
  className?: string;
  isDisabled?: boolean;
  showPageInfo?: boolean;
  showNavigationButtons?: boolean; // Nueva prop
  onChange?: (details: PaginationChangeDetails)=> Promise<void> | void; // Ahora puede ser async
  children: ReactNode | ((props: {
    currentPageIndex: number;
    currentValue: number | string;
  } )=> ReactNode);
};

/**
 * Modo 1: Paginación Numérica (Rango)
 * Requiere maxValue. minValue es opcional (default 1).
 * NO permite customValues.
 */
type RangePaginationProps = BasePaginationProps & {
  maxValue: number;
  minValue?: number;
  customValues?: never;
};

/**
 * Modo 2: Paginación Personalizada (Array)
 * Requiere customValues.
 * NO permite maxValue ni minValue.
 */
type CustomPaginationProps = BasePaginationProps & {
  customValues: (number | string)[];
  maxValue?: never;
  minValue?: never;
};

// Unión de tipos para hacerlos excluyentes
export type PaginationContainerProps = CustomPaginationProps | RangePaginationProps;

export const PaginationContainer = (props: PaginationContainerProps) => {
  const { children,
    initialPageIndex,
    position = "bottom",
    allowClickActive = false,
    maxVisibleButtons, // Ya no tiene default, puede ser undefined
    renderButton: CustomButton,
    className,
    isDisabled = false,
    showPageInfo = true,
    showNavigationButtons = true, // Por defecto se muestran
    onChange } = props;
  // Refs para ResizeObserver
  const navRef = useRef<HTMLElement>(null);
  // Estado para el número calculado de botones visibles
  // Default mientras se calcula
  const [calculatedMaxButtons, setCalculatedMaxButtons] = useState<number>(7);
  // Detectar modo
  const isCustomMode = Array.isArray(props.customValues);
  // Normalizar límites lógicos (Indices internos)
  // Si es custom, los índices son 0...length-1
  // Si es rango, los índices son minValue...maxValue
  const minIndex = isCustomMode ? 0 : (props.minValue ?? 1);
  const maxIndex = isCustomMode
    ? props.customValues!.length - 1
    : (props.maxValue as number);
  // Estado del índice actual
  const [currentIndex, setCurrentIndex] = useState<number | null>(() => {
    if (initialPageIndex !== undefined)
      return initialPageIndex;

    return minIndex;
  } );
  // Estado para controlar si está cambiando (para async)
  const [isChanging, setIsChanging] = useState(false);
  // Valor efectivo de maxVisibleButtons (manual o calculado)
  const effectiveMaxButtons = maxVisibleButtons ?? calculatedMaxButtons;
  // Función para calcular cuántos botones caben
  const calculateMaxButtons = useCallback(() => {
    if (maxVisibleButtons !== undefined)
      return;

    if (!navRef.current || currentIndex === null)
      return;

    const navWidth = navRef.current.offsetWidth;
    const buttonWidth = 32;
    const ellipsisWidth = 16;
    const gap = 8;
    const totalPages = maxIndex - minIndex + 1;
    const navigationButtonsWidth = showNavigationButtons
      ? ((buttonWidth * 2) + (gap * 2))
      : 0;
    let availableWidth = navWidth - navigationButtonsWidth;
    // Si caben todas las páginas sin ellipsis
    const maxButtonsNoEllipsis = Math.ceil((availableWidth + gap) / (buttonWidth + gap));

    if (maxButtonsNoEllipsis >= totalPages) {
      setCalculatedMaxButtons(totalPages);

      return;
    }

    // Si no caben todas, calcular cuántos ellipsis habrá con la página actual
    // Probamos con un número tentativo de botones para determinar los ellipsis
    const tentativeMaxButtons = maxButtonsNoEllipsis;
    const buttonsForMiddle = tentativeMaxButtons - 2;
    const leftButtons = Math.floor(buttonsForMiddle / 2);
    const rightButtons = buttonsForMiddle - leftButtons - 1;
    let leftSiblingIndex = Math.max(currentIndex - leftButtons, minIndex);
    let rightSiblingIndex = Math.min(currentIndex + rightButtons, maxIndex);
    const shouldShowLeftDots = leftSiblingIndex > minIndex + 1;
    const shouldShowRightDots = rightSiblingIndex < maxIndex - 1;
    // Contar ellipsis que aparecerán
    const ellipsisCount = (shouldShowLeftDots ? 1 : 0) + (shouldShowRightDots ? 1 : 0);
    // Restar espacio de los ellipsis que realmente aparecerán
    const ellipsisSpace = (ellipsisWidth + gap) * ellipsisCount;
    const availableWidthWithEllipsis = availableWidth - ellipsisSpace;
    const maxButtons = Math.ceil((availableWidthWithEllipsis + gap) / (buttonWidth + gap));
    const finalMaxButtons = Math.max(3, maxButtons);

    setCalculatedMaxButtons(finalMaxButtons);
  }, [maxVisibleButtons, showNavigationButtons, maxIndex, minIndex, currentIndex]);

  // ResizeObserver para detectar cambios de tamaño
  useEffect(() => {
    if (maxVisibleButtons !== undefined)
      return; // Solo si es auto-adaptable

    if (!navRef.current)
      return;

    const resizeObserver = new ResizeObserver(() => {
      calculateMaxButtons();
    } );

    resizeObserver.observe(navRef.current);

    // Calcular inmediatamente al montar
    calculateMaxButtons();

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateMaxButtons, maxVisibleButtons]);

  // Asegurar que si cambian las props y el índice queda fuera, se resetee
  useEffect(() => {
    if (currentIndex === null)
      return;

    if (currentIndex < minIndex)
      setCurrentIndex(minIndex);

    if (currentIndex > maxIndex)
      setCurrentIndex(maxIndex);
  }, [maxIndex, minIndex, currentIndex]);

  // Helper para obtener el valor a mostrar basado en un índice
  const getValueForIndex = (idx: number): number | string => {
    if (isCustomMode && props.customValues)
      return props.customValues[idx];

    return idx;
  };
  // Generar la lista de números de página (Indices) para renderizar
  const paginationRange = useMemo(() => {
    const totalPages = maxIndex - minIndex + 1;

    // Si no hay página actual, no mostramos nada
    if (currentIndex === null)
      return [];

    // Si el total de páginas cabe en effectiveMaxButtons, mostrar todas
    if (totalPages <= effectiveMaxButtons) {
      return Array.from( {
        length: totalPages,
      }, (_, i) => minIndex + i);
    }

    // Calcular cuántos botones mostrar alrededor de la página actual
    // Reservamos 2 espacios para el primero y el último
    const buttonsForMiddle = effectiveMaxButtons - 2;
    // Calcular cuántos botones a cada lado del actual
    const leftButtons = Math.floor(buttonsForMiddle / 2);
    const rightButtons = buttonsForMiddle - leftButtons - 1; // -1 porque incluye el botón actual
    // Calcular el rango ideal
    let leftSiblingIndex = Math.max(currentIndex - leftButtons, minIndex);
    let rightSiblingIndex = Math.min(currentIndex + rightButtons, maxIndex);
    // Ajustar si nos acercamos a los extremos
    const totalButtonsInMiddle = rightSiblingIndex - leftSiblingIndex + 1;

    if (totalButtonsInMiddle < buttonsForMiddle) {
      if (leftSiblingIndex === minIndex) {
        // Estamos cerca del inicio, extender a la derecha
        rightSiblingIndex = Math.min(minIndex + buttonsForMiddle - 1, maxIndex);
      } else if (rightSiblingIndex === maxIndex) {
        // Estamos cerca del final, extender a la izquierda
        leftSiblingIndex = Math.max(maxIndex - buttonsForMiddle + 1, minIndex);
      }
    }

    const shouldShowLeftDots = leftSiblingIndex > minIndex + 1;
    const shouldShowRightDots = rightSiblingIndex < maxIndex - 1;

    // Caso 1: Sin puntos a la izquierda (inicio)
    if (!shouldShowLeftDots) {
      const leftRange = Array.from(
        {
          length: rightSiblingIndex - minIndex + 1,
        },
        (_, i) => minIndex + i,
      );

      if (shouldShowRightDots)
        return [...leftRange, "...", maxIndex];

      return leftRange;
    }

    // Caso 2: Sin puntos a la derecha (final)
    if (!shouldShowRightDots) {
      const rightRange = Array.from(
        {
          length: maxIndex - leftSiblingIndex + 1,
        },
        (_, i) => leftSiblingIndex + i,
      );

      return [minIndex, "...", ...rightRange];
    }

    // Caso 3: Puntos a ambos lados (medio)
    const middleRange = Array.from(
      {
        length: rightSiblingIndex - leftSiblingIndex + 1,
      },
      (_, i) => leftSiblingIndex + i,
    );

    return [minIndex, "...", ...middleRange, "...", maxIndex];
  }, [minIndex, maxIndex, effectiveMaxButtons, currentIndex]);
  // Manejador de cambio (ahora async)
  const handlePageChange = async (newIndex: number) => {
    if (newIndex < minIndex || newIndex > maxIndex)
      return;

    if (newIndex === currentIndex && !allowClickActive)
      return;

    if (isChanging)
      return; // Prevenir clicks mientras está cambiando

    setIsChanging(true);

    try {
      if (onChange) {
        await onChange( {
          pageIndex: newIndex,
          pageValue: getValueForIndex(newIndex),
          totalPages: maxIndex - minIndex + 1,
          isFirst: newIndex === minIndex,
          isLast: newIndex === maxIndex,
        } );
      }

      // Solo cambiar visualmente después de que termine el onChange
      setCurrentIndex(newIndex);
    } catch (error) {
      console.error("Error changing page:", error);
      // No cambiar la página si hubo error
    } finally {
      setIsChanging(false);
    }
  };
  const renderPaginationNav = () => (
    <nav ref={navRef} className={styles.nav} aria-label="Page navigation">
      {/* Botón Previous - solo si showNavigationButtons es true */}
      {showNavigationButtons && (
        <DefaultPageButton
          label="&laquo;"
          pageIndex={currentIndex! - 1}
          pageValue="prev"
          isActive={false}
          isDisabled={currentIndex === minIndex || currentIndex === null || isChanging}
          onClick={() => handlePageChange(currentIndex! - 1)}
        />
      )}

      {paginationRange.map((item, index) => {
        if (item === "...") {
          return (
            <span key={`dots-${index}`} className={styles.ellipsis}>
              &hellip;
            </span>
          );
        }

        const pageIdx = item as number;
        const pageVal = getValueForIndex(pageIdx);
        const btnProps: PaginationButtonProps = {
          pageIndex: pageIdx,
          pageValue: pageVal,
          isActive: pageIdx === currentIndex,
          isDisabled: isDisabled || isChanging,
          onClick: () => handlePageChange(pageIdx),
          label: String(pageVal),
        };

        return CustomButton
          ? (
            <CustomButton key={pageIdx} {...btnProps} />
          )
          : (
            <DefaultPageButton key={pageIdx} {...btnProps} />
          );
      } )}

      {/* Botón Next - solo si showNavigationButtons es true */}
      {showNavigationButtons && (
        <DefaultPageButton
          label="&raquo;"
          pageIndex={currentIndex! + 1}
          pageValue="next"
          isActive={false}
          isDisabled={currentIndex === maxIndex || currentIndex === null || isChanging}
          onClick={() => handlePageChange(currentIndex! + 1)}
        />
      )}
    </nav>
  );
  const currentValue = currentIndex === null ? null : getValueForIndex(currentIndex);
  const totalCount = maxIndex - minIndex + 1;

  return (
    <div className={classes(styles.container, className)}>
      {(position === "top" || position === "both") && renderPaginationNav()}

      <div className={styles.content}>
        {typeof children === "function"
          ? (children as any)( {
            currentPageIndex: currentIndex,
            currentValue: currentValue,
          } )
          : children}
      </div>

      {(position === "bottom" || position === "both") && (
        <div className={styles.footerContainer}>
          {renderPaginationNav()}
          {showPageInfo && (
            <div className={styles.pageInfo}>
              {isCustomMode
                ? (
                  <span>
                    {currentValue} <span className={styles.muted}>({currentIndex! + 1}/{totalCount})</span>
                  </span>
                )
                : (
                  <span>
                    Página {currentValue} de {maxIndex}
                  </span>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
