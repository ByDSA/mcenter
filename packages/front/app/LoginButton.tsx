"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useRouter } from "next/navigation";
import { Button } from "#modules/ui-kit/input/Button";
import styles from "./LogginButton.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LoginButton = () => {
  const router = useRouter();

  return <Button className={styles.button} onClick={()=> {
    router.push(PATH_ROUTES.auth.frontend.login.path);
  }}>Login</Button>;
};
