export type StatusQuery = {
  command: "in_enqueue";
  input: string;
  } | {
  command: "pl_delete";
  id: number;
  } | {
  command: "pl_random";
} | {
command: "fullscreen";
} | {
command: "in_play";
input: string;
} | {
command: "pl_empty";
} | {
command: "pl_loop";
} | {
command: "pl_next";
} | {
command: "pl_pause";
id?: number;
} | {
command: "pl_play";
id?: number;
} | {
command: "pl_previous";
} | {
command: "pl_repeat";
} | {
command: "pl_sd";
val: string;
} | {
command: "pl_sort";
id: 0 | 1;
val: number;
} | {
command: "pl_stop";
} | {
command: "seek";
val: string;
} | {
command: "volume";
val: string;
};
