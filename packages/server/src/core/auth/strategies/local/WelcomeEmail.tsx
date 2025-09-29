/* eslint-disable daproj/max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { BaseEmail, BaseEmailProps } from "../../../mails/templates/BaseEmail";
import { ButtonLink, Center, createAppUrlLink } from "../../../mails/templates/utils";

type Props = Omit<BaseEmailProps, "children"> & {
  username: string;
};

export const WelcomeEmail = (props: Props) => {
  const { username, ...baseProps } = props;
  const AppUrlLink = createAppUrlLink( {
    appName: baseProps.appName,
    appUrl: props.appUrl,
  } );

  return <BaseEmail
    {...baseProps}
    title="Mensaje de bienvenida"
  >
    <h1 className="content-title">¡Bienvenido, {username}! 👋</h1>
    <p className="center">¡Gracias por registrarte en <span className="strong"><AppUrlLink /></span>! ☺️</p>

    <p>Tu cuenta ha sido creada exitosamente y ya puedes comenzar a disfrutar de todos nuestros servicios. ¿Listo para empezar? 😜</p>

    <Center>
      <ButtonLink href={baseProps.appUrl}>Entrar en {baseProps.appName}</ButtonLink>
    </Center>

    <p className="small-text">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar con nuestro equipo de soporte.</p>
  </BaseEmail>;
};
