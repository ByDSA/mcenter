"use client";

import { showError } from "$shared/utils/errors/showError";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useContextMenuTrigger, ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { TasksApi } from "#modules/tasks/requests";
import { TaskStatusAny } from "#modules/tasks/types";

type Props = {
  task: TaskStatusAny;
};

const ACTIVE_STATUSES = new Set([
  "active", "waiting", "delayed", "prioritized", "waiting-children",
]);

export const TaskControlsButton = ( { task }: Props) => {
  const { openMenu } = useContextMenuTrigger();
  const api = FetchApi.get(TasksApi);
  const isFinished = !ACTIVE_STATUSES.has(task.status);
  const handlePause = async () => {
    await api.pauseTask(task.id).catch(showError);
  };
  const handleResume = async () => {
    await api.resumeTask(task.id).catch(showError);
  };
  const handleKill = async () => {
    if (!confirm(`¿Forzar la terminación de "${task.name}"? Esta operación no puede deshacerse.`))
      return;

    await api.killTask(task.id).catch(showError);
  };

  return (
    <SettingsButton
      theme="light"
      onClick={(e) => {
        openMenu( {
          event: e,
          content: (
            <>
              {task.status === "active"
                ? (
                  <ContextMenuItem
                    label="Pausar"
                    onClick={handlePause}
                    disabled={isFinished}
                  />
                )
                : (
                  <ContextMenuItem
                    label="Reanudar"
                    onClick={handleResume}
                    disabled={isFinished}
                  />
                )}
              <ContextMenuItem
                label="Detener"
                onClick={handleKill}
                disabled={isFinished}
              />
            </>
          ),
        } );
      }}
    />
  );
};
