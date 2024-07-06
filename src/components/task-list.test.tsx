/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionProvider } from "next-auth/react";
import { describe, it } from "vitest";
import { TRPCReactProvider } from "~/trpc/react";
import { server, trpcMsw } from "~/trpc/testing";
import { TaskList } from "./task-list";

import { vi } from "vitest";
import { appRouter } from "~/server/api/root";
import { createCallerFactory } from "~/server/api/trpc";

const createCaller = createCallerFactory(appRouter);

vi.mock("~/server/db", () => ({}));

describe("Task List", function () {
  beforeEach(() => {
    let data = [
      {
        userId: "1",
        id: 1,
        description: "Task 1",
        completed: false
      },
      {
        userId: "1",
        id: 2,
        description: "Task 2",
        completed: true
      }
    ];

    const caller = createCaller({
      db: {
        task: {
          findMany() {
            return Promise.resolve(data);
          },
          create(input: Any) {
            const newItem = {
              userId: "1",
              id: 3,
              description: input.data.description,
              completed: false
            };
            data = [...data, newItem];
            return Promise.resolve(newItem);
          },
          update(input: Any) {
            const index = data.findIndex((item) => item.id === input.where.id);
            data[index] = {
              ...data[index],
              ...input.data
            };
            return data[index];
          },
          delete(input: Any) {
            const index = data.findIndex((item) => item.id === input.id);
            data.splice(index, 1);
            return true;
          }
        }
      },
      session: {
        user: {
          id: "1"
        }
      }
    } as Any);
    server.use(trpcMsw.tasks.tasks.query(() => caller.tasks.tasks()));
    server.use(
      trpcMsw.tasks.toggleTaskCompletion.mutation((input) =>
        caller.tasks.toggleTaskCompletion(input)
      )
    );
    server.use(
      trpcMsw.tasks.createTask.mutation((input) => caller.tasks.createTask(input))
    );
    server.use(
      trpcMsw.tasks.deleteTask.mutation((input) =>
        caller.tasks.deleteTask(input)
      )
    );

    render(
      <SessionProvider session={{ user: { id: "1" }, expires: "" }}>
        <TRPCReactProvider>
          <TaskList />
        </TRPCReactProvider>
      </SessionProvider>
    );
  });

  it("Renders the number of active tasks", async function () {
    expect(await screen.findByText("1 task")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("Renders completed tasks as with line through", async function () {
    expect(await screen.findByText("Task 1")).not.toHaveStyle(
      "text-decoration: line-through"
    );
    expect(screen.getByText("Task 2")).toHaveStyle(
      "text-decoration: line-through"
    );
  });

  it("Completes tasks by clicking on the checkbox", async function () {
    expect(await screen.findByText("Task 1")).not.toHaveStyle(
      "text-decoration: line-through"
    );
    await userEvent.click(screen.getByTestId(`task-1`));
    expect(screen.getByText("Task 1")).toHaveStyle(
      "text-decoration: line-through"
    );

    expect(screen.getByTestId("task-1")).toBeChecked();
    expect(screen.getByText("0 tasks")).toBeInTheDocument();
  });

  it("Adds task via the input box and changes the counter", async function () {
    expect(await screen.findByText("1 task")).toBeInTheDocument();

    await userEvent.type(
      screen.getByPlaceholderText("What needs to be done?"),
      "New Task"
    );
    await userEvent.click(screen.getByText("Add Task"));

    const newTask = await screen.findByText("New Task");
    expect(newTask).toBeInTheDocument();
    expect(newTask).not.toHaveStyle("text-decoration: line-through");
    expect(screen.getByText("2 tasks")).toBeInTheDocument();
  });

  it("Can delete tasks", async function () {
    expect(await screen.findByText("1 task")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("delete-1"));

    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.getByText("0 tasks")).toBeInTheDocument();
  });
});
