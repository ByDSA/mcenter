import { ReactNode } from "react";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import styles from "./styles.module.css";

type Props = {
  label?: string;
  top?: ReactNode;
};
export const EmptyList = (props?: Props) => {
  const { LL } = useI18nContext();

  return <section className={styles.container}>
    {props?.top}
    <span className={styles.label}>{props?.label
    ?? LL.common.lists.empty()}</span>
  </section>;
};

export const EmptyListTopIconWrap = ( { children }: {children: ReactNode} )=> {
  return <span className={styles.topIconWrap}>{children}</span>;
};
