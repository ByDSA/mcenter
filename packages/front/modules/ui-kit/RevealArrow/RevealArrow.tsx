import React, { useState, useRef, useEffect } from "react";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import styles from "./RevealArrow.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  position?: "left" | "right";
};
export const RevealArrow = ( { children, position = "left", className }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si está expandido y el clic NO es en el contenido, cerramos
      if (isExpanded && contentRef.current && !contentRef.current.contains(event.target as Node))
        setIsExpanded(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  return (
    <div
      className={classes(
        styles.container,
        position === "left" && styles.left,
        position === "right" && styles.right,
        className,
        isExpanded ? styles.expandedMode : "",
      )}
    >
      <div
        ref={iconRef}
        className={classes(styles.iconWrapper, isExpanded ? styles.hidden : styles.visible)}
        onMouseEnter={() => setIsExpanded(true)}
        onClick={() => setIsExpanded(true)}
      >
        <KeyboardArrowLeft />
      </div>

      <div
        ref={contentRef}
        className={classes(styles.contentWrapper, isExpanded ? styles.visible : styles.hidden)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {children}
      </div>
    </div>
  );
};
