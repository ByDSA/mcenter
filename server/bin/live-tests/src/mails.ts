import * as nodemailer from "nodemailer";
import envs from "./envs";

type Params = {
  to?: string;
  subject?: string;
  text?: string;
  html: string;
};

// eslint-disable-next-line import/prefer-default-export
export async function sendMailAsync( {html,text,subject,to}: Params){
  const transporter = nodemailer.createTransport( {
    pool: true,
    host: envs.SMTP_HOST,
    port: 465,
    secure: true, // use TLS
    auth: {
      user: envs.SMTP_USER,
      pass: envs.SMTP_PASSWORD,
    },
  } );
  const message = {
    from: `MCenter Live Testing <${ envs.SMTP_USER }>`,
    to: to ?? envs.SMTP_DEFAULT_TO,
    subject: subject ?? "Live tests",
    text,
    html,
  };
  const info = await transporter.sendMail(message);
  const {response} = info;

  if (!response.includes("success"))
    throw new Error(`Error sending email: ${JSON.stringify(info)}`);

  return info;
}