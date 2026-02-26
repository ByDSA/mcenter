const TASKS = "/api/tasks";

export const tasksRoutes = {
  path: TASKS,
  withParams: (id: string) => `${TASKS}/${id}`,
  status: {
    withParams: (id: string) => `${TASKS}/${id}/status`,
    stream: {
      withParams: (id: string) => `${TASKS}/${id}/status/stream`,
    },
  },
  queue: {
    status: {
      withParams: (queue: string, n?: number) => `${TASKS}/queue/${queue}/status${n ? `?n=${n}` : ""}`,
    },
    ids: {
      withParams: (queue: string, n?: number) => `${TASKS}/queue/${queue}/ids${n ? `?n=${n}` : ""}`,
    },
  },
  statusStream: {
    withParams: (id: string, heartbeatEveryMs?: number) => `${TASKS}/${id}/status/stream${heartbeatEveryMs ? `?heartbeat=${heartbeatEveryMs}` : ""}`,
  },
  pause: {
    withParams: (id: string) => `${TASKS}/${id}/pause`,
  },
  resume: {
    withParams: (id: string) => `${TASKS}/${id}/resume`,
  },
  kill: {
    withParams: (id: string) => `${TASKS}/${id}/kill`,
  },
};
