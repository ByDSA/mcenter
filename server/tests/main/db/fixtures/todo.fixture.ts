import { CreationalTodo } from "@app/modules/todo";

export type TodoFixture = CreationalTodo & {
  _id?: string;
};

export const initFixtures: TodoFixture[] = [{
  _id: "64c6e66b0888c73767b70d4e",
  message: "Do something",
  labelId: "1",
  dueDate: "2021-07-01T00:00:00.000Z",
},
];

export const newItem: TodoFixture = {
  _id: "64c791e787647ecb15903228",
  message: "New TODO",
  labelId: "1",
  dueDate: "2021-07-02T00:00:00.000Z",
};

export const newItemWithUnexistingLabel: TodoFixture = {
  _id: "64c791e787647ecb15903228",
  message: "New TODO",
  labelId: "999",
  dueDate: "2021-07-03T00:00:00.000Z",
};
