import React, { useState, useMemo, ReactNode, useEffect } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Pagination.module.css";

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
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

/**
 * Props para el componente de botón.
 * Ahora recibe index y value por separado.
 */
export type PaginationButtonProps = {
  pageIndex: number;
  pageValue: number | string;
  isActive: boolean;
  isDisabled: boolean;
  onClick: ()=> void;
  label?: ReactNode | string;
};

/**
 * Props base comunes para cualquier modo de paginación.
 */
type BasePaginationProps = {
  initialPageIndex?: number; // Índice inicial
  position?: "both" | "bottom" | "top";
  allowClickActive?: boolean;
  neighbors?: number;
  renderButton?: React.FC<PaginationButtonProps>;
  className?: string;
  showPageInfo?: boolean;
  onChange?: (details: PaginationChangeDetails)=> void;
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

// ----------------------------------------------------------------------
// COMPONENTES INTERNOS
// ----------------------------------------------------------------------
const DefaultPageButton = ( { pageValue,
  isActive,
  isDisabled,
  onClick,
  label }: PaginationButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={classes(
        styles.button,
        isActive && styles.active,
        isDisabled && styles.disabled,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label || pageValue}
    </button>
  );
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------
export const PaginationContainer = (props: PaginationContainerProps) => {
  const { children,
    initialPageIndex,
    position = "bottom",
    allowClickActive = false,
    neighbors = 2,
    renderButton: CustomButton,
    className,
    showPageInfo = true,
    onChange } = props;
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
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (initialPageIndex !== undefined)
      return initialPageIndex;

    return minIndex;
  } );

  // Asegurar que si cambian las props y el índice queda fuera, se resetee
  useEffect(() => {
    if (currentIndex < minIndex)
      setCurrentIndex(minIndex);

    if (currentIndex > maxIndex)
      setCurrentIndex(maxIndex);
  }, [maxIndex, minIndex]);

  // Helper para obtener el valor a mostrar basado en un índice
  const getValueForIndex = (idx: number): number | string => {
    if (isCustomMode && props.customValues)
      return props.customValues[idx];

    return idx;
  };
  // Generar la lista de números de página (Indices) para renderizar
  const paginationRange = useMemo(() => {
    const totalNumbers = (neighbors * 2) + 3; // neighbors + current + neighbors + first + last
    const totalButtons = totalNumbers + 2; // + dots
    const rangeLength = maxIndex - minIndex + 1;

    // Caso 1: Todo cabe sin puntos suspensivos
    if (rangeLength <= totalButtons) {
      return Array.from( {
        length: rangeLength,
      }, (_, i) => minIndex + i);
    }

    const leftSiblingIndex = Math.max(currentIndex - neighbors, minIndex);
    const rightSiblingIndex = Math.min(currentIndex + neighbors, maxIndex);
    const shouldShowLeftDots = leftSiblingIndex > minIndex + 1;
    const shouldShowRightDots = rightSiblingIndex < maxIndex - 1;

    // Caso 2: Puntos solo a la derecha
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + (2 * neighbors);
      const leftRange = Array.from( {
        length: leftItemCount,
      }, (_, i) => minIndex + i);

      return [...leftRange, "...", maxIndex];
    }

    // Caso 3: Puntos solo a la izquierda
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + (2 * neighbors);
      const rightRange = Array.from(
        {
          length: rightItemCount,
        },
        (_, i) => maxIndex - rightItemCount + 1 + i,
      );

      return [minIndex, "...", ...rightRange];
    }

    // Caso 4: Puntos a ambos lados
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        {
          length: rightSiblingIndex - leftSiblingIndex + 1,
        },
        (_, i) => leftSiblingIndex + i,
      );

      return [minIndex, "...", ...middleRange, "...", maxIndex];
    }

    return [];
  }, [minIndex, maxIndex, neighbors, currentIndex]);
  // Manejador de cambio
  const handlePageChange = (newIndex: number) => {
    if (newIndex < minIndex || newIndex > maxIndex)
      return;

    if (newIndex === currentIndex && !allowClickActive)
      return;

    setCurrentIndex(newIndex);

    if (onChange) {
      onChange( {
        pageIndex: newIndex,
        pageValue: getValueForIndex(newIndex),
        totalPages: maxIndex - minIndex + 1, // Cantidad total de páginas
        isFirst: newIndex === minIndex,
        isLast: newIndex === maxIndex,
      } );
    }
  };
  const renderPaginationNav = () => (
    <nav className={styles.nav} aria-label="Page navigation">
      {/* Botón Previous */}
      <DefaultPageButton
        label="&laquo;"
        pageIndex={currentIndex - 1}
        pageValue="prev" // Valor dummy
        isActive={false}
        isDisabled={currentIndex === minIndex}
        onClick={() => handlePageChange(currentIndex - 1)}
      />

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
          isDisabled: pageIdx === currentIndex && !allowClickActive,
          onClick: () => handlePageChange(pageIdx),
          // Si es custom, el label es el valor (string), si es numérico, es el numero
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

      {/* Botón Next */}
      <DefaultPageButton
        label="&raquo;"
        pageIndex={currentIndex + 1}
        pageValue="next" // Valor dummy
        isActive={false}
        isDisabled={currentIndex === maxIndex}
        onClick={() => handlePageChange(currentIndex + 1)}
      />
    </nav>
  );
  const currentValue = getValueForIndex(currentIndex);
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
                    {currentValue} <span className={styles.muted}>({currentIndex + 1}/{totalCount})</span>
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
