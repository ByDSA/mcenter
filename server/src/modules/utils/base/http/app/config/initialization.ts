/* eslint-disable import/prefer-default-export */
import assert from "node:assert";
import { assertIsDefined } from "#modules/utils/built-in-types/errors";
import { FileNotFoundError } from "#modules/utils/fs/errors";
import { readIfExistsSync } from "#modules/utils/fs/operations";
import { ConfigOptions, NetConfig, SSLMode, TextFile } from "./common";

function initializeSSL(mode: SSLMode): NetConfig["ssl"] {
  if (mode === SSLMode.DISABLED){
    return {
      enabled: false,
      required: false,
      key: null,
      cert: null,
    };
  }

  const ENV_NAME = {
    SSL_CERT: "SSL_CERT",
    SSL_KEY: "SSL_KEY",
  } as const;
  const SSL_KEY = process.env[ENV_NAME.SSL_KEY];
  const SSL_CERT = process.env[ENV_NAME.SSL_CERT];
  const sslConfig: NetConfig["ssl"] = {
    enabled: false,
    required: false,
    key: null,
    cert: null,
  };

  if (SSL_CERT) {
    sslConfig.cert = {
      path: SSL_CERT,
      content: readIfExistsSync(SSL_CERT),
    };
  }

  if (mode === SSLMode.REQUIRED)
    assertLoaded(ENV_NAME.SSL_CERT, sslConfig.cert);

  if (SSL_KEY) {
    sslConfig.key = {
      path: SSL_KEY,
      content: readIfExistsSync(SSL_KEY),
    };
  }

  if (mode === SSLMode.REQUIRED)
    assertLoaded(ENV_NAME.SSL_KEY, sslConfig.key);

  sslConfig.enabled = !!sslConfig.key?.content &&
      !!sslConfig.cert?.content;

  if (mode === SSLMode.REQUIRED)
    assert(sslConfig.enabled, "SSL required but not enabled");

  return sslConfig;
}

export function getInitializedNetConfig(options?: ConfigOptions["net"]) {
  const sslConfig = initializeSSL(options?.sslMode ?? SSLMode.DISABLED);
  const port: number = calcPort(options);

  return {
    ssl: sslConfig,
    port,
  };
}

function calcPort(options: ConfigOptions["net"]): number {
  const ENV_NAME = {
    NODE_PORT: "NODE_PORT",
  } as const;
  const NODE_PORT = process.env[ENV_NAME.NODE_PORT];

  if (options?.port !== undefined)
    return options.port;

  if (NODE_PORT !== undefined)
    return +NODE_PORT;

  return 0;
}

function assertLoaded(envName: string, file: TextFile | null) {
  if (!file?.content) {
    const env = process.env[envName];

    assertIsDefined(env);

    throw new FileNotFoundError(env);
  }
}