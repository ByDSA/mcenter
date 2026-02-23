"use client";

import { ReactNode, Ref, useImperativeHandle, useMemo, useState } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./FullscreenLayout.module.css";
import { ControlButtonView } from "./ControlButtonsView";

export type FullscreenLayoutHandle = {
  setView: (index: number)=> void;
};

export type FullscreenLayoutProps = {
  elements: {
    content: ReactNode;
    icon: ReactNode;
    iconTitle: string;
  }[];

  startElement?: number;

  /** Acciones opcionales en el header (p.ej. MusicSettingsButton en browser) */
  headerActions?: ReactNode;

  /** Acción al cerrar (solo browser; remote no tiene botón de cerrar aquí) */
  bottomRight?: ReactNode;

  ref?: Ref<FullscreenLayoutHandle>;
};

export const FullscreenPlayerLayout = ( { elements,
  startElement = 0,
  headerActions,
  bottomRight, ref }: FullscreenLayoutProps) =>{
  const [view, setView] = useState<number>(startElement);
  const content = useMemo(() => {
    return elements[view].content;
  }, [view]);

  useImperativeHandle(ref, () => ( {
    setView,
  } ));

  return (
    <>
      {headerActions && (
        <header className={styles.header}>{headerActions}</header>
      )}

      <main className={styles.main}>{content}</main>

      <footer className={styles.footer}>
        <aside>
          {elements.map((e, i)=> {
            const isActive = view === i;

            return <article key={i}>
              <ControlButtonView
                className={classes(isActive && styles.activeViewButton)}
                disabled={isActive}
                onClick={isActive ? undefined : () => setView(i)}
                title={e.iconTitle}
              >
                {e.icon}
              </ControlButtonView>
              {isActive && underlineElement}
            </article>;
          } )}
        </aside>

        {bottomRight}
      </footer>
    </>
  );
};

const underlineElement = <span className={styles.underline} />;
