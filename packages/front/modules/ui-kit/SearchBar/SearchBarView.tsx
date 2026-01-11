import { Search, Close } from "@mui/icons-material";
import { InputHTMLAttributes } from "react";
import styles from "./SearchBar.module.css";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onKeyDown" | "type"> & {
  action: (value: string)=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SearchBarView = (props: Props) => {
  const { action, onChange, ...inputProps } = props;
  const handleClearClick = () => {
    if (onChange) {
      onChange( {
        target: {
          value: "",
        },
        currentTarget: {
          value: "",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <article className={styles.inputContainer}>
      <Search className={styles.searchIcon} />

      <input
        {...inputProps}
        type="text"
        className={styles.searchInput}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            action((e.target as HTMLInputElement).value);
        }}
      />
      {inputProps.value && (
        <Close
          className={styles.clearIcon}
          onClick={handleClearClick}
          onMouseDown={(e)=>e.preventDefault()}
        />
      )}
    </article>
  );
};
