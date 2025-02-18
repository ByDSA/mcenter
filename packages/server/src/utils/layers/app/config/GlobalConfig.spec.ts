import { GlobalConfig } from "./GlobalConfig";

describe("config", () => {
  it("se crea sin errores", () => {
    const f = () =>GlobalConfig.create();

    expect(f).not.toThrow();
  } );

  describe("configuración por defecto", () => {
    let config: GlobalConfig;

    beforeAll(() => {
      config = GlobalConfig.create();
    } );

    it("se crea e inicializa sin errores", () => {
      const f = () => config.initialize();

      expect(f).not.toThrow();
    } );

    describe("comprobación de configuración por defecto", () => {
      describe("configuración de red", () => {
        it("está definida", () => {
          const actual = config.net;

          expect(actual).toBeDefined();
        } );

        it("port=0", () => {
          expect(config.net.port).toBe(0);
        } );

        describe("ssl", () => {
          it("está definida", () => {
            const actual = config.net.ssl;

            expect(actual).toBeDefined();
          } );

          it("enabled=false", () => {
            expect(config.net.ssl.enabled).toBeFalsy();
          } );

          it("required=false", () => {
            expect(config.net.ssl.required).toBeFalsy();
          } );

          it("cert=null", () => {
            expect(config.net.ssl.cert).toBeNull();
          } );

          it("key=null", () => {
            expect(config.net.ssl.key).toBeNull();
          } );
        } );
      } );
    } );
  } );
} );
