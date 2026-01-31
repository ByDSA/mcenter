/**
 * Dispara el envío de un formulario y espera a que el manejador onSubmit de React termine.
 * * @param form - El elemento HTMLFormElement del DOM.
 * @param submitter - (Opcional) El botón o elemento que dispara el submit.
 * @returns Promise<void> - Se resuelve si el submit fue exitoso, se rechaza si hubo error.
 */
export async function submitAndWait(
  form: HTMLFormElement,
  submitter?: HTMLElement | null,
): Promise<void> {
  return await new Promise((resolve, reject) => {
    // Buscar la key de las props de React
    const reactPropsKey = Object.keys(form).find((key) => key.startsWith("__reactProps$"));

    // Si no encontramos las props, fallback nativo
    if (!reactPropsKey) {
      try {
        form.requestSubmit(submitter);
        resolve();
      } catch (e) {
        reject(e);
      }

      return;
    }

    // Obtenemos el objeto de props original (que probablemente sea Read-Only)
    const originalProps = (form as any)[reactPropsKey];
    const originalOnSubmit = originalProps.onSubmit;
    const originalAction = originalProps.action;

    if (!originalOnSubmit && typeof originalAction !== "function") {
      form.requestSubmit(submitter);
      resolve();

      return;
    }

    // Estrategia de Clonado para evitar error "Read only property"
    const targetProp = originalOnSubmit ? "onSubmit" : "action";
    const originalFn = originalOnSubmit || originalAction;
    // Creamos una COPIA mutable de las props
    const mutableProps = {
      ...originalProps,
    };
    const wrappedHandler = async (...args: any[]) => {
      try {
        // Ejecutamos la función original usando el contexto original
        const result = originalFn.apply(originalProps, args);

        // Si devuelve promesa, esperamos
        if (result instanceof Promise)
          await result;

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    // Inyectar el interceptor en la COPIA
    mutableProps[targetProp] = wrappedHandler;

    // Reemplazar el objeto de props en el DOM temporalmente
    (form as any)[reactPropsKey] = mutableProps;

    try {
      // Disparar el submit (React leerá nuestras mutableProps)
      form.requestSubmit(submitter);
    } catch (e) {
      reject(e);
    } finally {
      // Restaurar el objeto de props original INMEDIATAMENTE
      // Esto es seguro porque el evento se despacha síncronamente y React ya ha
      // extraído la referencia a 'wrappedHandler' para cuando llegamos aquí.
      (form as any)[reactPropsKey] = originalProps;
    }
  } );
}
