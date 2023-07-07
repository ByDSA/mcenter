import GlobalConfig from "./GlobalConfig";

describe("Config", () => {
  it("Se crea sin errores", () => {
    GlobalConfig.create();
  } );

  describe("Configuración por defecto", () => {
    let config: GlobalConfig;

    beforeAll(() => {
      config = GlobalConfig.create();
    } );

    it("Se crea e inicializa sin errores", () => {
      config.initialize();
    } );

    describe("Comprobación de configuración por defecto", () => {
      describe("Configuración de red", () => {
        it("está definida", () => {
          const actual = config.net;

          expect(actual).toBeDefined();
        } );
        it("port=80", () => {
          expect(config.net.port).toBe(80);
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