import React, { useState } from "react";
import { isDefined } from "$shared/utils/validation";
import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
import { TaskStatusAny } from "./types";
import styles from "./styles.module.css";
import { TaskJsonViewer } from "./TaskJsonViewer";

type Props = {
  value: TaskStatusAny;
  onClick?: ()=> Promise<void>;
};

const formatDate = (date: Date | null | undefined): string => {
  if (!date)
    return "N/A";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  } ).format(new Date(date));
};
const getCardClass = (status: TaskStatusAny["status"]): string => {
  switch (status) {
    case "completed":
      return styles.completed;
    case "failed":
      return styles.failed;
    default:
      return styles.neutral;
  }
};
const getStatusClass = (status: TaskStatusAny["status"]): string => {
  switch (status) {
    case "completed":
      return styles.completed;
    case "failed":
      return styles.failed;
    case "active":
      return styles.active;
    case "delayed":
      return styles.delayed;
    case "prioritized":
      return styles.prioritized;
    case "waiting":
      return styles.waiting;
    case "waiting-children":
      return styles.waitingChildren;
    default:
      return styles.unknown;
  }
};

export const Task = ( { value, onClick }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleCardClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);

    if (onClick)
      await onClick();
  };

  return (
    <div className={`${styles.taskCard} ${getCardClass(value.status)}`}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.taskName} title={value.name}>{value.name}</h3>
          <span className={`${styles.status} ${getStatusClass(value.status)}`}>
            {value.status.replace("-", " ")}
          </span>
        </div>
        <div className={styles.id}>
            ID: {value.id}
        </div>
      </div>

      <div className={styles.details}>
        <div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Creado:</span>
            <span className={styles.detailValue}>{formatDate(value.createdAt)}</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Procesado:</span>
            <span className={styles.detailValue}>{formatDate(value.processedAt)}</span>
          </div>

          {isDefined(value.finishedAt) && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Finalizado:</span>
              <span className={styles.detailValue}>{formatDate(value.finishedAt)}</span>
            </div>
          )}
        </div>
        <div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Intentos:</span>
            <span className={styles.detailValue}>{value.attempts}/{value.maxAttempts}</span>
          </div>
        </div>
      </div>

      {
        isDefined(value.progress) && typeof value.progress === "object"
          && "percentage" in value.progress
        && (<div className={styles.progressTask}>
          <main>
            <span className={styles.bar}>
              <div
                className={styles.foregroundBar}
                style={{
                  width: `${value.progress.percentage}%`,
                }}
              />
            </span>
            <div>
              {value.progress.percentage.toFixed(1)}%
            </div>
          </main>
          <section className={styles.message}>
            {value.progress.message ?? ""}
          </section>
        </div>)}

      {value.status === "failed" && value.failedReason && (
        <div className={styles.failedReason}>
          <strong>Error:</strong> {value.failedReason}
        </div>
      )}
      <div className={styles.clickableArea} onClick={handleCardClick}>
        <div className={styles.expandIcon}>
          {isExpanded ? <ArrowDropDown /> : <ArrowRight />}Detalles
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.expandedSection}>
            {value.status === "completed" && isDefined(value.returnValue) && (
              <div className={styles.expandedItem}>
                <span className={styles.expandedLabel}>Return Value:</span>
                <pre className={styles.codeBlock}>
                  <TaskJsonViewer value={value.returnValue}/>
                </pre>
              </div>
            )}

            {isDefined(value.progress) && (
              <div className={styles.expandedItem}>
                <span className={styles.expandedLabel}>Progress:</span>
                <pre className={styles.codeBlock}>
                  <TaskJsonViewer value={value.progress}/>
                </pre>
              </div>
            )}

            {isDefined(value.payload) && (
              <div className={styles.expandedItem}>
                <span className={styles.expandedLabel}>Payload:</span>
                <pre className={styles.codeBlock}>
                  <TaskJsonViewer value={value.payload}/>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
