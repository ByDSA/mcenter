"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useRouter } from "next/navigation";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import styles from "./LogginButton.module.css";

export const LoginButton = () => {
  const router = useRouter();

  return <DaButton theme="white" className={styles.button} onClick={()=> {
    router.push(PATH_ROUTES.auth.frontend.login.path);
  }}>Login</DaButton>;
};
