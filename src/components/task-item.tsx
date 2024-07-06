"use client";

import type { Task } from "./task-list";

import styles from "./task-item.module.css";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

export function TaskItem({ task }: { task: Task }) {
  const deleteTask = api.tasks.deleteTask.useMutation();
  const toggleTaskCompletion = api.tasks.toggleTaskCompletion.useMutation();
  const queryClient = useQueryClient();

  return (
    <div className={styles.container}>
      <div className={styles.checkbox}>
        <div className={styles.round}>
          <input
            type="checkbox"
            id={`task-${task.id}`}
            checked={task.completed}
            data-testid={`task-${task.id}`}
            onClick={() => {
              toggleTaskCompletion.mutate({ taskId: task.id }, {
                onSuccess() {
                  const key = getQueryKey(api.tasks.tasks, undefined, "query");
                  const existing = queryClient.getQueryData<Task[]>(key) ?? [];
                  queryClient.setQueryData(key, existing.map((t) => {
                    if (t.id === task.id) {
                      return { ...t, completed: !t.completed };
                    }
                    return t;
                  }));
                }
              });
            }}
          />
          <label htmlFor={`task-${task.id}`}></label>
        </div>
      </div>
      <span
        className={styles.title}
        style={task.completed ? { textDecoration: "line-through" } : undefined}
      >
        {task.description}
      </span>
      <div className={styles.actions}>
        <button
          data-testid={`delete-${task.id}`}
          className={styles.deleteButton}
          onClick={() => {
            deleteTask.mutate({ taskId: task.id }, {
              onSuccess() {
                const key = getQueryKey(api.tasks.tasks, undefined, "query");
                const existing = queryClient.getQueryData<Task[]>(key) ?? [];
                queryClient.setQueryData(key, existing.filter((t) => t.id !== task.id));
              }
            });
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
