import { assertIsDefined } from "#modules/utils/built-in-types/errors";
import { ConfigOptions, NetConfig } from "./common";
import { getInitializedNetConfig } from "./initialization";

export default class GlobalConfig {
  private $options?: ConfigOptions;

  private $netConfig: NetConfig | undefined;

  public static create(options?: ConfigOptions) {
    const config = new GlobalConfig(options);

    return config;
  }

  private constructor(options?: ConfigOptions) {
    this.$options = options;
  }

  public initialize() {
    this.$netConfig = getInitializedNetConfig(this.$options?.net);
  }

  // eslint-disable-next-line accessor-pairs
  get net(): Readonly<NetConfig> {
    assertIsDefined(this.$netConfig);

    return {
      ssl:{
        ...this.$netConfig.ssl,
      },
      port: this.$netConfig.port,
    };
  }
}