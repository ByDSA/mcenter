/* eslint-disable daproj/max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { BaseEmail, BaseEmailProps } from "../../../mails/templates/BaseEmail";
import { ButtonLink, Center, createAppUrlLink } from "../../../mails/templates/utils";

type Props = Omit<BaseEmailProps, "children"> & {
  url: string;
  expiresMinutes: number;
  username: string;
};

export const VerificationEmail = (props: Props) => {
  const { url, username, expiresMinutes, ...baseProps } = props;
  const AppUrlLink = createAppUrlLink( {
    appName: baseProps.appName,
    appUrl: props.appUrl,
  } );

  return (
    <BaseEmail
      {...baseProps}
      title="Verificación de correo"
    >
      <h1 className="content-title">Hola, {username} 👋</h1>
      <p className="center">¡Gracias por registrarte en <span className="strong"><AppUrlLink /></span>! ☺️</p>
      <p>Para terminar el proceso de creación de cuenta necesitamos verificar tu dirección de correo:</p>

      <Center>
        <ButtonLink href={url}>Verificar mi correo</ButtonLink>
      </Center>

      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p className="url-fallback">{url}</p>

      <p>El enlace caduca en aproximadamente <span className="strong">{expiresMinutes} minutos</span>.</p>

      <hr className="content-divider" />

      <p className="verification-disclaimer">Si no has sido tú quien se ha registrado en <span className="strong"><AppUrlLink /></span>, por favor, ignora este correo.</p>
    </BaseEmail>
  );
};
