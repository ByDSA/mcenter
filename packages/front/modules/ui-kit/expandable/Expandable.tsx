import React, { useState, useRef, useEffect, ReactElement } from "react";
import { CloseFullscreen, OpenInFull } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type ExpandableContainerProps = {
  children: ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
};

export const ExpandableContainer = ( { children, className = "" }: ExpandableContainerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandOrigin, setExpandOrigin] = useState( {
    x: "50%",
    y: "50%",
  } );
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
      const width = Math.min(rect.width, parentRect?.width ?? Infinity);
      const height = Math.min(rect.height, parentRect?.height ?? Infinity);
      const centerX = ((rect.left + (width / 2)) / window.innerWidth) * 100;
      const centerY = ((rect.top + (height / 2)) / window.innerHeight) * 100;

      setExpandOrigin( {
        x: `${centerX}%`,
        y: `${centerY}%`,
      } );
    }

    setIsExpanded(true);
    setIsClosing(false);
  };
  const handleClose = (e?: KeyboardEvent | MouseEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsClosing(true);
    // Esperar a que termine la animación antes de ocultar completamente
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 200); // Ajusta este tiempo según la duración de tu animación CSS
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded && !isClosing)
        handleClose(e);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isExpanded && !isClosing && contentRef.current
        && !contentRef.current.contains(e.target as Node)
      )
        handleClose(e);
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);

      if (!isExpanded && !isClosing)
        document.body.style.overflow = "unset";
    };
  }, [isExpanded, isClosing]);

  // Función para renderizar contenido expandido con tamaños forzados
  const renderFullscreenContent = () => {
    if (!React.isValidElement(children))
      return children;

    const childType = children.type;
    const childProps = children.props;

    // TEXTAREA - Forzar tamaño completo
    if (childType === "textarea") {
      return (
        <textarea
          {...childProps}
          className={styles.fullscreenTextarea}
        />
      );
    }

    // PRE/CODE - Forzar tamaño completo
    if (childType === "pre") {
      return (
        <pre className={styles.fullscreenPre}>
          {childProps.children}
        </pre>
      );
    }

    // DIV con tabla o contenido con scroll
    if (childType === "div") {
      // Si tiene tabla o scroll limitado, expandir completamente
      if (childProps.style?.maxHeight || childProps.style?.overflow) {
        return (
          <div className={styles.fullscreenScrollDiv}>
            {childProps.children}
          </div>
        );
      }

      // Otros divs (como gráficos)
      return (
        <div
          {...childProps}
          className={classes(styles.fullscreenDiv, childProps.className)}
          style={{
            ...childProps.style,
          }}
        />
      );
    }

    // Fallback para otros elementos
    return React.cloneElement(children, {
      ...childProps,
      className: classes(styles.fullscreenScrollDiv, childProps.className),
      style: {
        ...childProps.style,
      },
    } );
  };

  return (
    <>
      <div className={styles.wrapper}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <div
          ref={containerRef}
          className={classes(styles.expandableContainer, className)}
        >
          {children}
        </div>
        <button
          onClick={handleExpand}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          className={classes(styles.expandButton, isHovered && styles.expandButtonVisible)}
        >
          <OpenInFull />
        </button>
      </div>

      {isExpanded && (
        <div className={classes(styles.fullscreenModal, isClosing && styles.closing)}>
          <div
            ref={contentRef}
            className={classes(styles.fullscreenContent, isClosing && styles.closing)}
            style={{
              transformOrigin: `${expandOrigin.x} ${expandOrigin.y}`,
            }}
          >
            <button
              onClick={handleClose}
              className={styles.closeButton}
            >
              <CloseFullscreen />
            </button>
            {renderFullscreenContent()}
          </div>
        </div>
      )}
    </>
  );
};
