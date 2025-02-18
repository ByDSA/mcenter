export type ResourceInputCommonProps<R> = {
  resourceState: [R, React.Dispatch<React.SetStateAction<R>>];
  prop: keyof R;
  isOptional?: boolean;
  error?: string;
};
