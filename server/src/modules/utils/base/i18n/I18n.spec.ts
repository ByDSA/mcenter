import { TR_BAD_PASSWORD, TR_CONTROLLER, TR_EXPIRED_PASSWORD, TR_ID, TR_NO, TR_OBJECT_NOT_FOUND, TR_PARKING_METER_COLLECTION, TR_YES } from "./constants";
import I18n from "./I18n";

beforeAll(() => {
  I18n.configure();
} );

describe.each([
  [TR_ID, "Id"],
  [TR_YES, "Yes"],
  [TR_NO, "No"],
  [TR_PARKING_METER_COLLECTION, "Recaudación parkimetros"],
  [TR_CONTROLLER, "Controlador"],
  [TR_BAD_PASSWORD, "Contraseña incorrecta"],
  [TR_OBJECT_NOT_FOUND, "Objeto no encontrado"],
  [TR_EXPIRED_PASSWORD, "Contraseña expirada"],
])("I18n", (key, expected) => {
  it(`${key} => ${expected}`, () => {
    const actual = I18n.tr(key);

    expect(actual).toBe(expected);
  } );
} );