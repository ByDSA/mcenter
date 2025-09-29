"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import styles from "./styles.module.css";

export default function RegisterDonePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resendUrl = backendUrl(PATH_ROUTES.auth.local.emailVerification.resend.path);
  const [isDisabled, setIsDisabled] = useState(false);
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
      logger.error("Error en el reenvío");
      setIsDisabled(false);
    } else {
      logger.info("Enviado email de verificación");
      setTimeout(() => {
        setIsDisabled(false);
      }, 30000);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.title}>¡Registro completado con éxito!</p>
      <p>
        Te hemos enviado un correo a {" "}
        <span className={styles.strong}>{email}</span>{" "}
        para verificar tu cuenta. Si en unos minutos no lo recibes, haz clic{" "}
        <a
          href={resendUrl}
          onClick={!isDisabled ? handleResend : undefined}
          title={isDisabled ? "Desactivado temporalmente" : undefined}
          className={isDisabled ? styles.disabled : ""}
        >
          aquí
        </a>{" "}
        para reenviarlo.
      </p>
      <p>Puedes cerrar esta página cuando quieras.</p>
    </div>
  );
}
