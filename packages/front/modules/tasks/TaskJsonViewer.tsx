/* eslint-disable @typescript-eslint/naming-convention */
import { JsonViewer } from "@textea/json-viewer";
import { ExpandableContainer } from "#modules/ui-kit/expandable/Expandable";

export const TaskJsonViewer = ( { value } ) =><ExpandableContainer>
  <JsonViewer
    value={value}
    rootName={false}
    displayDataTypes={false}
    indentWidth={2}
    groupArraysAfterLength={20}
    highlightUpdates={true}
    collapseStringsAfterLength={55}
  /></ExpandableContainer>;
