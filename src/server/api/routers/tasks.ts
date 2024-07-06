import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";


export const tasksRouter = createTRPCRouter({
  tasks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      where: { userId: ctx.session.user.id }
    });
  }),
  createTask: protectedProcedure
    .input(z.object({ task: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const newTask = await ctx.db.task.create({
        data: {
          userId: ctx.session.user.id,
          description: input.task,
          completed: false
        }
      });
      return newTask;
    }),

  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.task.delete({
        where: { id: input.taskId }
      });
    }),
  toggleTaskCompletion: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.taskId }
      });
      if (!task) {
        throw new Error("Task not found");
      }
      const updatedTask = await ctx.db.task.update({
        where: { id: input.taskId },
        data: { completed: !task.completed }
      });
      return updatedTask;
    })
});
