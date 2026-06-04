import { Request, Response } from "express";
import prisma from "../infrastructure/prisma";
import { EventStatus } from "../generated/prisma/enums";

type EventStatsResult = {
  total: number;
} & Record<EventStatus, number>;

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

export async function getEventsStats(req: Request, res: Response) {
  const stats = await prisma.event.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });
  const initialState = Object.values(EventStatus).reduce<EventStatsResult>(
    (acc, status) => {
      const current = { ...acc };
      current[status] = 0;
      return current;
    },
    {
      total: 0,
    } as EventStatsResult,
  );
  const results = stats.reduce<EventStatsResult>(
    (acc, { status, _count: { _all } }) => {
      const current = { ...acc };
      current[status] = _all;
      current.total += _all;
      return current;
    },
    initialState,
  );
  res.status(200).json({
    success: true,
    results,
  });
}
