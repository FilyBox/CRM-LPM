import { z } from 'zod';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetTicketTypeByIdOptions = {
  id: number;
  name?: string;
  eventId: number;
  price?: number;
  uid?: string;
  maxQuantityPerUser: number;
  quantity?: number;
  available?: number;
  description?: string;
  seatNumber?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  imageUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export const ticketTypeRouter = router({
  createTicketType: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        eventId: z.number(),
        price: z.number().optional(),
        uid: z.string().optional(),
        maxQuantityPerUser: z.number().optional(),
        quantity: z.number().optional(),
        available: z.number().optional(),
        description: z.string().optional(),
        // seatNumber: z.string().optional(),
        stripeProductId: z.string().optional(),
        stripePriceId: z.string().optional(),
        imageUrl: z.string().optional(),
        status: z.string().optional(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        deletedAt: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!input.name) {
        throw new Error('El nombre del tipo de ticket es obligatorio');
      }

      try {
        return await prisma.ticketType.create({
          data: {
            name: input.name,
            eventId: input.eventId,
            ...(input.price !== undefined ? { price: input.price } : {}),
            ...(input.uid !== undefined ? { uid: input.uid } : {}),
            maxQuantityPerUser: input.maxQuantityPerUser ?? 0,
            quantity: input.quantity ?? 0,
            available: input.available ?? 0,
            ...(input.description !== undefined ? { description: input.description } : {}),
            // ...(input.seatNumber !== undefined ? { seatNumber: input.seatNumber } : {}),
            ...(input.stripeProductId !== undefined
              ? { stripeProductId: input.stripeProductId }
              : {}),
            ...(input.stripePriceId !== undefined ? { stripePriceId: input.stripePriceId } : {}),
            ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
            status: input.status ?? 'active',
            createdAt: input.createdAt ?? new Date(),
            updatedAt: input.updatedAt ?? new Date(),
          },
        });
      } catch (error) {
        console.error('Error creating ticket type:', error);
        throw new Error('Error creating ticket type');
      }
    }),

  getTicketType: authenticatedProcedure.query(async ({ input }) => {
    const ticketType = await prisma.ticketType.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return ticketType;
  }),

  updateTicketTypeById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        eventId: z.number().optional(),
        price: z.number().optional(),
        uid: z.string().optional(),
        maxQuantityPerUser: z.number().optional(),
        quantity: z.number().optional(),
        available: z.number().optional(),
        description: z.string().optional(),
        // seatNumber: z.string().optional(),
        // stripeProductId: z.string().optional(),
        // stripePriceId: z.string().optional(),
        imageUrl: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return await prisma.ticketType.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Error updating ticket type:', error);
        throw new Error('Error updating ticket type');
      }
    }),

  deleteTicketTypeById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      try {
        return await prisma.ticketType.delete({
          where: { id },
        });
      } catch (error) {
        console.error('Error deleting ticket type:', error);
        throw new Error('Error deleting ticket type');
      }
    }),
});
