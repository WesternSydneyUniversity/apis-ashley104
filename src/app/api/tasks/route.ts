import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthSession } from "~/server/auth";

// In-memory data store for tasks
const tasks = [
  {
    userId: "1",
    id: 1,
    description: "Complete the project report",
    completed: false
  },
  { userId: "1", id: 2, description: "Clean the house", completed: true }
];

async function listTasks(req: NextRequest, res: NextResponse) {
  const session = await getServerAuthSession();
  if (session == null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    tasks.filter((task) => task.userId === session.user.id)
  );
}

async function addTask(req: NextRequest, res: NextResponse) {
  const session = await getServerAuthSession();
  if (session == null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { description, completed = false } = await req.json();
  const newTask = {
    id: tasks.length + 1,
    description,
    completed,
    userId: session.user.id
  };
  tasks.push(newTask);
  return NextResponse.json(newTask, { status: 201 });
}

async function updateTask(req: NextRequest) {
  const session = await getServerAuthSession();
  if (session == null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, description, completed } = await req.json();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    tasks[taskIndex] = { id, description, completed, userId: session.user.id };
    return NextResponse.json(tasks[taskIndex]);
  }

  return NextResponse.json({ message: "Task not found" }, { status: 404 });
}

async function deleteTask(req: NextRequest) {
  const session = await getServerAuthSession();
  if (session == null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    return NextResponse.json({ message: "Task deleted" });
  }

  return NextResponse.json({ message: "Task not found" }, { status: 404 });
}

// export individual handlers as REST commands
export {
  deleteTask as DELETE,
  listTasks as GET,
  addTask as POST,
  updateTask as PUT
};
