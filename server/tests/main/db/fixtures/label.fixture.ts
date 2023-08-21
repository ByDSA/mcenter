import { Label } from "@app/modules/label";

export type LabelFixture = Label;

export const initFixtures: LabelFixture[] = [{
  id: "1",
  name: "label1",
}];

export const newItem: LabelFixture = {
  id: "99",
  name: "label99",
};
