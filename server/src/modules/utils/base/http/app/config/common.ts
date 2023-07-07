export type TextFile = {
  path: string;
  content: Buffer | null;
};

export type NetConfig = {
  ssl: {
  enabled?: boolean;
  required?: boolean;
  key: TextFile | null;
  cert: TextFile | null;
  };
  port: number;
};

export enum SSLMode {
  DISABLED = "disabled",
  ENABLED = "enabled",
  REQUIRED = "required",
}

export enum NodeEnvorinment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  TEST = "test",
}

export type ConfigOptions = {
  net?: {
    sslMode?: SSLMode;
    port?: number;
  };
};