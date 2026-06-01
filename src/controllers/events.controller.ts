import { Request, Response } from "express";
import prisma from "../infrastructure/prisma";

export async function createEvent(req: Request, res: Response) {
  const { type, payload } = req.body;
  const event = await prisma.event.create({
    data: {
      type,
      payload,
    },
  });
  console.log(`Event ${event.id} created at ${event.createdAt}`);
  return res.status(200).json({
    success: true,
    message: "Event created",
    event,
  });
}
