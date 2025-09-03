import { dateSchema } from "../date";
import { validStringDate } from "./fixtures";

describe("dateSchema", () => {
  describe("casos válidos", () => {
    it("debería validar correctamente un objeto Date válido", () => {
      const validDate = new Date("2023-12-25");
      const result = dateSchema.parse(validDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(11); // Diciembre es mes 11
      expect(result.getDate()).toBe(25);
    } );

    it("debería convertir y validar una string de fecha ISO válida", () => {
      const result = dateSchema.parse(validStringDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(validStringDate);
    } );

    it("debería convertir y validar una string de fecha simple", () => {
      const dateString = "2023-12-25";
      const result = dateSchema.parse(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(25);
    } );

    it("debería validar fecha actual", () => {
      const now = new Date();
      const result = dateSchema.parse(now);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(now.getTime());
    } );

    it("debería convertir timestamp ms válido", () => {
      const timestamp = 1703505000000; // 25 dic 2023
      const result = dateSchema.parse(timestamp);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(1703505000000);
    } );
  } );

  describe("casos inválidos - strings que no son fechas válidas", () => {
    it("debería fallar con string de fecha inválida", () => {
      const invalidDateString = "invalid-date";

      expect(() => dateSchema.parse(invalidDateString)).toThrow();
    } );

    it("debería fallar con string vacía", () => {
      const emptyString = "";

      expect(() => dateSchema.parse(emptyString)).toThrow();
    } );

    it("debería fallar con string que no representa fecha", () => {
      const notDate = "hello world";

      expect(() => dateSchema.parse(notDate)).toThrow();
    } );
  } );

  describe("casos inválidos - tipos incorrectos", () => {
    it("debería fallar con boolean", () => {
      const boolean = true;

      expect(() => dateSchema.parse(boolean)).toThrow("Invalid date");
    } );

    it("debería fallar con null", () => {
      const nullValue = null;

      expect(() => dateSchema.parse(nullValue)).toThrow("Invalid date");
    } );

    it("debería fallar con undefined", () => {
      const undefinedValue = undefined;

      expect(() => dateSchema.parse(undefinedValue)).toThrow("Invalid date");
    } );

    it("debería fallar con array", () => {
      const array = [2023, 12, 25];

      expect(() => dateSchema.parse(array)).toThrow("Invalid date");
    } );

    it("debería fallar con objeto", () => {
      const object = {
        year: 2023,
        month: 12,
        day: 25,
      };

      expect(() => dateSchema.parse(object)).toThrow("Invalid date");
    } );
  } );

  describe("casos edge", () => {
    it("debería manejar Date inválido correctamente", () => {
      const invalidDate = new Date("invalid");

      expect(() => dateSchema.parse(invalidDate)).toThrow();
    } );

    it("debería validar fecha límite mínima", () => {
      const minDate = new Date("1970-01-01T00:00:00.000Z");
      const result = dateSchema.parse(minDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(0);
    } );

    it("debería validar fecha futura lejana", () => {
      const futureDate = new Date("2099-12-31T23:59:59.999Z");
      const result = dateSchema.parse(futureDate);

      expect(result).toBeInstanceOf(Date);
    } );

    it("debería convertir string con diferentes formatos de fecha", () => {
      const formats = [
        "12/25/2023",
        "December 25, 2023",
        "25 Dec 2023",
        "2023/12/25",
      ];

      formats.forEach(format => {
        const result = dateSchema.parse(format);

        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
      } );
    } );
  } );

  describe("validación con safeParse", () => {
    it("safeParse debería retornar success: true para fecha válida", () => {
      const validDate = new Date("2023-12-25");
      const result = dateSchema.safeParse(validDate);

      expect(result.success).toBe(true);

      expect(result.data).toBeInstanceOf(Date);
    } );

    it("safeParse debería retornar success: false para string inválida", () => {
      const invalidString = "not-a-date";
      const result = dateSchema.safeParse(invalidString);

      expect(result.success).toBe(false);

      expect(result.error).toBeDefined();
    } );
  } );
} );
