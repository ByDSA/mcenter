"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useCallback, useEffect, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { Task } from "#modules/tasks/Task";
import { TaskStatusAny } from "#modules/tasks/types";
import { backendUrl } from "#modules/requests";
import { streamTaskStatus } from "#modules/tasks";
import { logger } from "#modules/core/logger";
import { useCrudData } from "#modules/fetching";
import { PageSpinner } from "#modules/ui-kit/spinner/Spinner";

const QUEUE_NAME = "single-tasks";
const N = 10;

export default function Page() {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatusAny> | null>(null);
  const [sortedTaskStatuses, setSortedTaskStatuses] = useState<TaskStatusAny[] | null>(null);
  const { data, isLoading } = useCrudData(
    {
      refetching: {
        everyMs: 1000,
        fn: async () => {
          const res = await fetch(
            backendUrl(PATH_ROUTES.tasks.queue.ids.withParams(QUEUE_NAME, N)),
          );
          const ret = (await res.json()).data as string[];

          return ret;
        },
      },
    },
  );
  const processNewTaskSatus = useCallback((taskStatus: TaskStatusAny, isNew = false) => {
    if ((taskStatus.status !== "completed" && taskStatus.status !== "failed") || isNew) {
      streamTaskStatus( {
        url: backendUrl(PATH_ROUTES.tasks.statusStream.withParams(taskStatus.id)),
        taskName: taskStatus.name,
        // eslint-disable-next-line require-await
        onListenStatus: async (status) => {
          setTaskStatuses(old=> ( {
            ...old,
            [taskStatus.id]: status,
          } ));

          return status;
        },
      } )
        .catch(showError);
    }
  }, [setTaskStatuses]);

  useEffect(()=> {
    if (taskStatuses) {
      const values = Object.values(taskStatuses);
      const sortedValues = values.toSorted(
        (a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setSortedTaskStatuses(sortedValues);
    }
  }, [taskStatuses]);

  useEffect(()=> {
    if (taskStatuses !== null) {
      for (const dataId of (data ?? [])) {
        if (taskStatuses[dataId] === undefined) {
          fetch(
            backendUrl(PATH_ROUTES.tasks.status.withParams(dataId)),
          )
            .then(r=>r.json())
            .then(r=> {
              return r as TaskStatusAny;
            } )
            .then(d=> {
              setTaskStatuses(old=> ( {
                ...old,
                [dataId]: d,
              } ));
              processNewTaskSatus(d, true);

              return d;
            } )
            .catch(showError);
        }
      }
    }
  }, [data, taskStatuses]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const response = await fetch(
        backendUrl(PATH_ROUTES.tasks.queue.status.withParams(QUEUE_NAME, N)),
      );
      const obj = await response.json() as {data: TaskStatusAny[];
errors?: any[];};

      if (obj.errors && obj.errors.length > 0)
        logger.error(obj.errors[0]);

      setTaskStatuses(obj.data.reduce((acc, taskStatus)=> {
        acc[taskStatus.id] = taskStatus;

        return acc;
      }, {} ));

      for (const taskStatus of obj.data)
        processNewTaskSatus(taskStatus);
    };

    fetchStatuses()
      .catch(showError);
  }, []);

  return (
    <>
      <h2>Task Manager</h2>
      {isLoading && <PageSpinner />}
      {sortedTaskStatuses && sortedTaskStatuses.map(t=> {
        return <Task key={t.id} value={t} />;
      } )}
      {
        sortedTaskStatuses && sortedTaskStatuses.length === 0 && <p>No tasks found.</p>
      }
    </>
  );
}
