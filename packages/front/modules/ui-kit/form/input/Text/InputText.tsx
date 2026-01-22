import { RefObject, useRef, useCallback } from "react";
import { RefCallBack } from "react-hook-form";
import { classes } from "#modules/utils/styles";
import { updateHeight } from "../../../input/height";
import styles from "./styles.module.css";

const pressEnterSubmit = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Evita el salto de línea en el textarea

    const { form } = e.currentTarget;

    if (form) {
      // Despacha el evento de submit del formulario de manera programática
      form.requestSubmit();
    }
  }
};

export const updateNull = (target: HTMLInputElement | HTMLTextAreaElement, nullable: boolean |
  undefined) => {
  if (nullable) {
    if (target.value === "")
      target.classList.add(styles.null);
    else
      target.classList.remove(styles.null);
  }
};
const update = (target: HTMLTextAreaElement, nullable: boolean | undefined) => {
  updateNull(target, nullable);

  updateHeight( {
    element: target,
  } );
};

export const DaInputTextMultiline = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref?: RefCallBack | RefObject<HTMLTextAreaElement | null>;
    nullable?: boolean;
    newLineOnEnter?: boolean;
  },
) => {
  const { className, nullable, onChange, newLineOnEnter, ...textAreaProps } = props;
  const externalRef = props.ref;
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  // Callback Ref: Se ejecuta automáticamente cuando el nodo se monta
  const setRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      internalRef.current = node;

      update(node, nullable);

      if (typeof externalRef === "function")
        externalRef(node);
      else if (externalRef)
        externalRef.current = node;
    }
  }, [externalRef]);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    update(e.target, nullable);

    onChange?.(e);
  };

  return (
    <textarea
      {...textAreaProps}
      ref={setRef}
      className={classes("ui-kit-input-text", styles.input, className)}
      onChange={handleChange}
      onKeyDown={!newLineOnEnter
        ? (e)=>{
          pressEnterSubmit(e);
          props.onKeyDown?.(e);
        }
        : props.onKeyDown}
    />
  );
};

export const DaInputText = (props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    ref?: RefCallBack | RefObject<HTMLInputElement | null>;
    nullable?: boolean;
} ) => {
  const { className, nullable, onChange, ...inputProps } = props;
  const externalRef = props.ref;
  const internalRef = useRef<HTMLInputElement | null>(null);
  // Callback Ref: Se ejecuta automáticamente cuando el nodo se monta
  const setRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      internalRef.current = node;

      updateNull(node, nullable);

      if (typeof externalRef === "function")
        externalRef(node);
      else if (externalRef)
        externalRef.current = node;
    }
  }, [externalRef]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNull(e.target, nullable);

    onChange?.(e);
  };

  return <input
    {...inputProps}
    ref={setRef}
    type="text"
    className={classes("ui-kit-input-text", styles.input, className)}
    onChange={handleChange}
  />;
};
