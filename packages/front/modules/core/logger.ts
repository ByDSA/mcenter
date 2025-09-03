import winston from "winston";
import Transport from "winston-transport";
import { toast } from "react-toastify";

class ToastTransport extends Transport {
  log(info, callback) {
    const { level, message } = info;

    switch (level) {
      case "error":
        toast.error(message);
        break;
      case "warn":
        toast.warn(message);
        break;
      case "info":
        toast.success(message);
        break;
      case "debug":
        toast.info(message);
        break;
      default:
        toast(message);
        break;
    }

    callback();
  }
}

const transports: Transport[] = [
  new ToastTransport(),
];
const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  class FrontendConsoleTransport extends Transport {
    log(info, callback) {
      const { level, message } = info;
      let fn = console.log;

      if (level === "debug" && isDev)
        fn = console.debug;
      else
        fn = console[level] ?? console.log;

      fn(message);

      callback();
    }
  }
  transports.push(new FrontendConsoleTransport());
}

export const logger = winston.createLogger( {
  level: isDev ? "debug" : "info",
  transports,
} );
