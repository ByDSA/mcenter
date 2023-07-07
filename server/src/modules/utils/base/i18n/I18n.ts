import i18n from "i18n";

export default class I18n {
  public static configure(options: i18n.ConfigurationOptions) {
    i18n.configure(options);
  }

  public static tr(key: string): string {
    // eslint-disable-next-line no-underscore-dangle
    return i18n.__(key);
  }
}