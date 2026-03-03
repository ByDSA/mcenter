"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import { DaAnchor } from "#modules/ui-kit/Anchor/Anchor";
import { classes } from "#modules/utils/styles";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { interpolateJSX } from "#modules/core/i18n/utils";
import styles from "./styles.module.css";

export default function RegisterDonePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resendUrl = backendUrl(PATH_ROUTES.auth.local.emailVerification.resend.path);
  const [isDisabled, setIsDisabled] = useState(false);
  const { LL } = useI18nContext();
  const handleResend = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    setIsDisabled(true);

    const res = await fetch(resendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify( {
        email,
      } ),
    } );

    if (!res.ok) {
      logger.error(LL.core.auth.register.emailVerification.errorResending());
      setIsDisabled(false);
    } else {
      logger.info(LL.core.auth.register.emailVerification.resent());
      setTimeout(() => {
        setIsDisabled(false);
      }, 30000);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.title}>¡Registro completado con éxito!</p>
      <p>
        {
          interpolateJSX(
            LL.core.auth.register.emailVerification.sentEmail(),
            {
              email: <span className={styles.strong}>{email}</span>,
              link: <DaAnchor
                href={resendUrl}
                onClick={!isDisabled ? handleResend : undefined}
                title={isDisabled
                  ? LL.core.auth.register.emailVerification.disabledTitle()
                  : undefined}
                className={classes(isDisabled && styles.disabled)}
              >
                {LL.core.auth.register.emailVerification.linkText()}
              </DaAnchor>,
            },
          )
        }
      </p>
      <p>{LL.core.auth.register.emailVerification.subMessage()}</p>
    </div>
  );
}
