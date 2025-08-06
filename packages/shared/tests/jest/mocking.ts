export function createMockClass<T>(OriginalClass: new (...args: any[])=> T) {
  class MockClass {
    constructor(..._args: any[]) {
      // Obtener todos los métodos del prototipo de la clase original
      let { prototype } = OriginalClass;

      // Recorrer toda la cadena de prototipos
      while (prototype && prototype !== Object.prototype) {
        Object.getOwnPropertyNames(prototype).forEach(name => {
          if (name !== "constructor" && typeof prototype[name] === "function") {
            // Asignar jest.fn() a cada método
            (this as any)[name] = jest.fn();
          }
        } );
        prototype = Object.getPrototypeOf(prototype);
      }
    }
  }

  // Retornar la clase con el tipo correcto
  return MockClass as new (...args: any[])=> jest.Mocked<T>;
}

export function createMockInstance<T>(OriginalClass: new (...args: any[])=> T) {
  class MockClass {
    constructor(..._args: any[]) {
      // Obtener todos los métodos del prototipo de la clase original
      let { prototype } = OriginalClass;

      // Recorrer toda la cadena de prototipos
      while (prototype && prototype !== Object.prototype) {
        Object.getOwnPropertyNames(prototype).forEach(name => {
          if (name !== "constructor" && typeof prototype[name] === "function") {
            // Asignar jest.fn() a cada método
            (this as any)[name] = jest.fn();
          }
        } );
        prototype = Object.getPrototypeOf(prototype);
      }
    }
  }

  // Retornar la clase con el tipo correcto
  return new MockClass() as jest.Mocked<T>;
}
