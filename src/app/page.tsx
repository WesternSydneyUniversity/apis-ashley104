import { TaskList } from "~/components/task-list";
import styles from "./index.module.css";

import { Stick_No_Bills } from "next/font/google";
import { UserInfo } from "~/components/user-info";
import { Suspense } from "react";

const sticks = Stick_No_Bills({ subsets: ["latin"] });

export default async function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.login}>
          <UserInfo />
        </div>
        <header className={styles.header}>
          <h1 style={sticks.style} className={styles.title}>
            Get Things Done
          </h1>
          <h2 className={styles.subHeader}>
            The easiest way to control your time!
          </h2>
        </header>
        <Suspense fallback={<div>Loading posts...</div>}>
          <TaskList />
        </Suspense>
      </div>
    </main>
  );
}
