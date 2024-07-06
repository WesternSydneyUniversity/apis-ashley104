"use client";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useState } from "react";
import { api } from "~/trpc/react";
import styles from "./create-task.module.css";
import { type Task } from "./task-list";

export function CreateTask() {
  const [text, setText] = useState("");
  const createTask = api.tasks.createTask.useMutation();
  const queryClient = useQueryClient();
  // not used now, but would be used if you loaded the data using a server component
  // const router = useRouter();

  return (
    <>
      <input
        type="text"
        value={text}
        placeholder="What needs to be done?"
        className={styles.taskInput}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        disabled={createTask.isPending}
        className={styles.taskButton}
        onClick={() => {
          createTask.mutate({ task: text }, {
            onSuccess(data) {
              const key = getQueryKey(api.tasks.tasks, undefined, "query");
              const existing = queryClient.getQueryData<Task[]>(key) ?? [];
              queryClient.setQueryData(key, [...existing, data]);
            }
          });
          setText("");
        }}
      >
        {createTask.isPending ? "Saving" : "Add Task"}
      </button>
    </>
  );
}
