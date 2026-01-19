import { useState } from "react";
import { AddBox, Cancel } from "@mui/icons-material";
import { FormInputText } from "#modules/ui-kit/form/input/Text/FormInputText";

// Estilos inline básicos para simplificar
const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
    alignItems: "center",
  },
  item: {
    background: "var(--color-gray-850)",
    padding: "0.2rem 0.5rem",
    borderRadius: "0.5rem",
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--color-gray-700)",
    fontSize: "0.9rem",
  },
  remove: {
    marginLeft: "0.5rem",
    cursor: "pointer",
    color: "var(--color-red)",
    display: "flex",
  },
  addBtn: {
    marginLeft: "0.25rem",
    cursor: "pointer",
    color: "var(--color-green-600)",
    display: "flex",
  },
};

type Props = {
  value: string[];
  onChange: (newValue: string[])=> void;
  onEmptyEnter?: (e: React.KeyboardEvent<HTMLInputElement>)=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
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
    <div style={styles.container}>
      {value.map((tag, index) => (
        <span key={`${tag}-${index}`} style={styles.item}>
          {tag}
          <a onClick={() => handleRemove(index)} style={styles.remove}>
            <Cancel style={{
              width: "1rem",
              height: "1rem",
            }} />
          </a>
        </span>
      ))}
      <div style={{
        display: "flex",
        alignItems: "center",
      }}>
        <FormInputText
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "8rem",
            minWidth: "8rem",
          }}
        />
        <a onClick={handleAdd} style={styles.addBtn}>
          <AddBox />
        </a>
      </div>
    </div>
  );
};
