"use client";

import { CreateTask } from "~/components/create-task";
import { TaskItem } from "./task-item";
import styles from "./task-list.module.css";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react"; 

export type Task = {
  userId: string;
  id: number;
  description: string;
  completed: boolean;
};

export function TaskList() {
  const session = useSession();
  const tasksQuery = api.tasks.tasks.useQuery(undefined, {
    enabled: !!session.data,
  })
  if (tasksQuery.isLoading) {
    return <div>Loading tasks...</div>;
  }
  const tasks = tasksQuery.data ?? [];

  const activeTasks = tasks.filter((task) => !task.completed);

  return (
    <>
      <div>
        <section className={styles.counter}>
          <div className={styles.taskLabel}>
            {activeTasks.length} task{activeTasks.length == 1 ? "" : "s"}
          </div>
        </section>
        <section className={styles.section}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </section>
      </div>
      <section className={styles.inputContainer}>
        <CreateTask />
      </section>
    </>
  );
}
