export type InputResourceProps<T> = {
  resourceState: [T, React.Dispatch<React.SetStateAction<T>>];
  prop: keyof T;
  isOptional?: boolean;
  style?: React.CSSProperties;
  error?: string;
};