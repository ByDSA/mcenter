import type { ResourceState } from "./ResourceInputCommonProps";
import { AddOnReset } from "#modules/utils/resources/useCrud";

export type ResourceInputProps<R extends object, V> = {
  resourceState: ResourceState<R>;
  originalResource: ResourceState<R>[0];
  getValue: (resource: R)=> V | undefined;
  getUpdatedResource: (newValue: V | undefined, oldResource: R)=> R;
  caption?: React.JSX.Element | string;
  isOptional?: boolean;
  addOnReset?: AddOnReset<R>;
  isHidden?: boolean;
  disabled?: boolean;
};

export enum ResourceInputType {
  Boolean = "boolean",
  Number = "number",
  Text = "text"
}

type ResourceInputViewProps = {
  type: ResourceInputType;
  caption?: React.JSX.Element | string;
  inputElement: React.ReactNode;
  checkboxOptionalElement?: React.ReactNode;
  isVisible?: boolean;
};

export const defaultValuesMap = Object.freeze( {
  [ResourceInputType.Boolean]: false,
  [ResourceInputType.Number]: 0,
  [ResourceInputType.Text]: "",
} as const);

export function ResourceInputView( { caption,
  inputElement: mainInputElement,
  type,
  checkboxOptionalElement,
  isVisible = true }: ResourceInputViewProps) {
  if (!isVisible)
    return null;

  const input = (
    <span className={`ui-kit-resource-input-${type}`}>
      <span>{mainInputElement}</span>
      {checkboxOptionalElement}
    </span>
  );

  if (caption) {
    return (
      <span className="ui-kit-resource-input">
        <span>{caption}</span>
        {input}
      </span>
    );
  }

  return input;
}
