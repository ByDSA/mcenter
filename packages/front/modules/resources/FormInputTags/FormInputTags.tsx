import { useState } from "react";
import { AddBox, Cancel } from "@mui/icons-material";
import { DaInputText } from "#modules/ui-kit/form/input/Text/InputText";
import styles from "./styles.module.css";

type Props = {
  value: string[];
  onChange: (newValue: string[])=> void;
  onEmptyEnter?: (e: React.KeyboardEvent<HTMLInputElement>)=> void;
};

export const FormInputTags = ( { value = [], onChange, onEmptyEnter }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const handleAdd = () => {
    const trimmed = inputValue.trim();

    if (!trimmed)
      return;

    if (!value.includes(trimmed))
      onChange([...value, trimmed]);

    setInputValue("");
  };
  const handleRemove = (index: number) => {
    const newValue = [...value];

    newValue.splice(index, 1);
    onChange(newValue);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (inputValue.trim() === "")
        onEmptyEnter?.(e);
      else
        handleAdd();
    }
  };

  return (
    <div className={styles.container}>
      {value.map((tag, index) => (
        <span key={`${tag}-${index}`} className={styles.item}>
          {tag}
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className={styles.remove}
            aria-label="Eliminar tag"
          >
            <Cancel />
          </button>
        </span>
      ))}

      <div className={styles.inputWrapper}>
        <DaInputText
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.inputField}
        />
        <button
          type="button"
          onClick={handleAdd}
          className={styles.addBtn}
          aria-label="Agregar tag"
        >
          <AddBox />
        </button>
      </div>
    </div>
  );
};
