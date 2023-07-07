import I18n from "../commons/I18n/I18n";
import I18nKeys from "./I18nKeys";
import Language from "./Language";

import translationsCa from "./translations/ca.json";
import translationsEn from "./translations/en.json";
import translationsEs from "./translations/es.json";

beforeAll(() => {
  I18n.putLocale(Language.ES, translationsEs);
  I18n.putLocale(Language.EN, translationsEn);
  I18n.putLocale(Language.CA, translationsCa);
  I18n.setLocale(Language.ES);
} );

const cases = [
  [Language.ES, I18nKeys.PAVAPARK, "Pavapark" ],
  [Language.ES, I18nKeys.SI, "Sí" ],
  [Language.ES, I18nKeys.EMAIL, "Email" ],
  [Language.ES, I18nKeys.CONTRASENA, "Contraseña" ],
  [Language.ES, "Texto inline", "Texto inline" ],
  [Language.EN, I18nKeys.CONTRASENA, "Password" ],
  [Language.CA, I18nKeys.CONTRASENA, "Contrasenya" ],
];

describe("traducciones", () => {
  test.each(cases)(
    "idioma: %p, key: %p, string esperado: %p",
    (language, key, expected) => {
      const actual = I18n.tr(key, {
        language,
      } );

      expect(actual).toBe(expected);
    },
  );
} );

const translationsArray = [translationsEs];

describe("all json have all keys with a valid string value", () => {
  for (const translation of translationsArray) {
    const keys = Object.keys(translation);

    test.each(keys)(
      "key: %p",
      (key) => {
        const actual = I18n.tr(key);

        expect(actual).toBeDefined();
        expect(actual).not.toBe("");
      },
    );
  }
} );

describe("all json have all valid keys (keys are in enum)", () => {
  const enumKeys = Object.keys(I18nKeys);

  for (const translation of translationsArray) {
    const keys = Object.keys(translation);

    test.each(keys)(
      "key in json: %p",
      (jsonKey) => {
        const actual = enumKeys.includes(jsonKey);

        expect(actual).toBeTruthy();
      },
    );
  }
} );

describe("all json have all keys with valid keys (json has enum key)", () => {
  const enumKeys = Object.keys(I18nKeys);

  for (const translation of translationsArray) {
    const jsonKeys = Object.keys(translation);

    test.each(enumKeys)(
      "key in enum: %p",
      (enumKey) => {
        const actual = jsonKeys.includes(enumKey);

        expect(actual).toBeTruthy();
      },
    );
  }
} );