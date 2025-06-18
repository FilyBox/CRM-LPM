import { z } from 'zod';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetEventByIdOptions = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  venue?: string;
  artists: string[];
  beginning: Date;
  end: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export const eventRouter = router({
  createEvent: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        venue: z.string().optional(),
        artists: z.array(z.string()).optional(),
        beginning: z.date().optional(),
        end: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input.name) {
        throw new Error('El nombre del evento es obligatorio');
      }

      try {
        return await prisma.event.create({
          data: {
            name: input.name,
            description: input.description,
            image: input.image,
            venue: input.venue,
            artists: input.artists
              ? {
                  connect: input.artists.map((artistId) => ({ id: Number(artistId) })),
                }
              : undefined,
            beginning: input.beginning ?? new Date(),
            end: input.end ?? new Date(),
          },
        });
      } catch (error) {
        console.error('Error creating event:', error);
        throw new Error('Error creating event');
      }
    }),

  findEvent: authenticatedProcedure.query(async () => {
    const events = await prisma.event.findMany({
      orderBy: {
        id: 'asc',
      },
    });
    return events;
  }),

  updateEventById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        // teamId: z.number().optional(),
        venue: z.string().optional(),
        artists: z.array(z.string()).optional(),
        beginning: z.date().optional(),
        end: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      if (!id) {
        throw new Error('El ID del evento es obligatorio');
      }

      try {
        return await prisma.event.update({
          where: { id },
          data: {
            ...data,
            artists: data.artists
              ? {
                  connect: data.artists.map((artistId) => ({ id: Number(artistId) })),
                }
              : undefined,
          },
        });
      } catch (error) {
        console.error('Error updating event:', error);
        throw new Error('Error updating event');
      }
    }),

  deleteEventById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new Error('El ID del evento es obligatorio');
      }

      try {
        return await prisma.event.delete({
          where: { id },
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        throw new Error('Error deleting event');
      }
    }),
});
