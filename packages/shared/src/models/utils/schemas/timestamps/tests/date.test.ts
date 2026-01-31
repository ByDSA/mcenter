import { dateSchema } from "../date";
import { validStringDate } from "./fixtures";

describe("dateSchema", () => {
  describe("casos válidos", () => {
    it("debería validar correctamente un objeto Date válido", () => {
      const validDate = new Date("2023-12-25");
      const result = dateSchema.parse(validDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2023);
      expect(result.getUTCMonth()).toBe(11); // Diciembre es mes 11
      expect(result.getUTCDate()).toBe(25);
    } );

    it("debería convertir y validar una string de fecha ISO válida", () => {
      const result = dateSchema.parse(validStringDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(validStringDate);
    } );

    it("debería convertir y validar una string de fecha simple (YYYY-MM-DD)", () => {
      const dateString = "2023-12-25";
      const result = dateSchema.parse(dateString);

      expect(result).toBeInstanceOf(Date);
      // Usamos UTC para evitar problemas de desfase local en el entorno de ejecución
      expect(result.toISOString()).toContain("2023-12-25");
    } );

    it("debería convertir timestamp ms válido (number)", () => {
      const timestamp = 1703505000000;
      const result = dateSchema.parse(timestamp);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(timestamp);
    } );
  } );

  describe("casos inválidos", () => {
    describe.each([
      {
        type: "String inválida",
        value: "not-a-date",
      },
      {
        type: "String vacía",
        value: "",
      },
      {
        type: "Texto con números",
        value: "123-abc-456",
      },
      {
        type: "Boolean",
        value: true,
      },
      {
        type: "Null",
        value: null,
      },
      {
        type: "Undefined",
        value: undefined,
      },
      {
        type: "Array",
        value: [],
      },
      {
        type: "Objeto",
        value: {},
      },
      {
        type: "Date inválido",
        value: new Date("invalid"),
      },
      {
        type: "Infinity",
        value: Infinity,
      },
      {
        type: "NaN",
        value: NaN,
      },
    ])("debería lanzar error cuando el valor es $type", ( { value } ) => {
      it(`falla con: ${value}`, () => {
        expect(() => dateSchema.parse(value)).toThrow();
      } );
    } );
  } );

  describe("comportamiento nativo y desbordamiento (JS quirks)", () => {
    it("debería desbordar Abril 31 a Mayo 1 (comportamiento estándar de new Date)", () => {
      const result = dateSchema.parse("2023-04-31");

      // Comprobamos en UTC para consistencia
      expect(result.getUTCMonth()).toBe(4); // Mayo
      expect(result.getUTCDate()).toBe(1);
    } );

    it("debería manejar correctamente el año 0 (usando formato ISO extendido)", () => {
      // Para años menores a 1000 o negativos, ISO requiere 6 dígitos o Z
      const result = dateSchema.parse("0000-01-01T00:00:00Z");

      expect(result.getUTCFullYear()).toBe(0);
    } );
  } );

  describe("casos edge adicionales", () => {
    it("debería validar el timestamp 0 (Unix Epoch)", () => {
      const result = dateSchema.parse(0);

      expect(result.getTime()).toBe(0);
    } );

    it("debería fallar con números que exceden la capacidad de Date", () => {
      expect(() => dateSchema.parse(8.64e16)).toThrow();
    } );

    it("debería ignorar espacios en blanco alrededor de la string", () => {
      const result = dateSchema.parse("  2023-12-25  ");

      expect(result.getUTCFullYear()).toBe(2023);
    } );

    it("debería validar fechas antiguas usando sufijo Z para evitar LMT (Local Mean Time)", () => {
      // El sufijo Z fuerza UTC, evitando que la hora solar local reste minutos y cambie el año
      const result = dateSchema.parse("1000-01-01T00:00:00Z");

      expect(result.getUTCFullYear()).toBe(1000);
    } );

    it("debería validar fechas muy lejanas", () => {
      const result = dateSchema.parse("9999-12-31T00:00:00Z");

      expect(result.getUTCFullYear()).toBe(9999);
    } );

    it.each([
      ["2023-12-25T10:00:00Z"],
      ["2023/12/25"],
    ])("debería aceptar formatos variados que JS reconoce: %s", (format) => {
      const result = dateSchema.parse(format);

      expect(result.getUTCFullYear()).toBe(2023);
    } );
  } );
} );
