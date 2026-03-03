"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useRouter } from "next/navigation";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import styles from "./LogginButton.module.css";

export const LoginButton = () => {
  const router = useRouter();
  const { LL } = useI18nContext();

  return <DaButton theme="white" className={styles.button} onClick={()=> {
    router.push(PATH_ROUTES.auth.frontend.login.path);
  }}>{LL.core.auth.login.loginButton()}</DaButton>;
};
