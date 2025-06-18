import { useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { FilePlus, Loader } from 'lucide-react';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { stripe } from '@documenso/lib/server-only/stripe';
import { putFile } from '@documenso/lib/universal/upload/put-file';
import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { Input } from '@documenso/ui/primitives/input';
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { ImageUploader } from '~/components/general/dropzone';

interface TicketTypeFormData {
  name?: string;
  eventId?: number;
  price?: number;
  uid?: string;
  maxQuantityPerUser?: number;
  quantity?: number;
  available?: number;
  description?: string;
  seatNumber?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  imageUrl?: string;
  status?: string;
}

type EventCreateDialogProps = {
  teamId?: number;
};

export const TicketTypeCreateDialog = ({ teamId: _teamId }: EventCreateDialogProps) => {
  const { user } = useSession();
  const maxLength = 250;
  const { toast } = useToast();
  const { _ } = useLingui();
  const [image, setImage] = useState<File | null>(null);

  const { mutateAsync: createTicketType } = trpc.ticketType.createTicketType.useMutation();

  const [showEventCreateDialog, setShowEventCreateDialog] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [ticketTypeData, setTicketTypeData] = useState<{
    name?: string;
    eventId?: number;
    price?: number;
    uid?: string;
    maxQuantityPerUser?: number;
    quantity?: number;
    available?: number;
    description?: string;
    seatNumber?: string;
    stripeProductId?: string;
    stripePriceId?: string;
    imageUrl?: string;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  }>({
    name: '',
    eventId: undefined,
    price: undefined,
    uid: undefined,
    maxQuantityPerUser: undefined,
    quantity: undefined,
    available: undefined,
    description: undefined,
    seatNumber: undefined,
    stripeProductId: undefined,
    stripePriceId: undefined,
    imageUrl: undefined,
    status: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const { data: eventsList = [] } = trpc.event.findEvent.useQuery();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'teamId') {
      setTicketTypeData((prev) => ({ ...prev, teamId: value ? Number(value) : undefined }));
    } else if (name === 'beginning') {
      setTicketTypeData((prev) => ({ ...prev, beginning: value ? new Date(value) : new Date() }));
    } else if (name === 'end') {
      setTicketTypeData((prev) => ({ ...prev, end: value ? new Date(value) : new Date() }));
    } else {
      setTicketTypeData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTicketTypeData((prev) => ({ ...prev, [name]: value }));
  };

  const createStripeProduct = async () => {
    if (!ticketTypeData.name || !ticketTypeData.price) {
      throw new Error('Name and price are required to create a Stripe product');
    }

    // Crear producto en Stripe
    const product = await stripe.products.create({
      name: ticketTypeData.name,
      description: ticketTypeData.description || undefined,
      images: ticketTypeData.imageUrl ? [ticketTypeData.imageUrl] : undefined,
    });

    // Crear precio en Stripe
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(ticketTypeData.price * 100), // Stripe usa centavos
      currency: 'usd', // Ajusta según tu moneda
    });

    return {
      stripeProductId: product.id,
      stripePriceId: price.id,
    };
  };

  const onCreateEvent = async () => {
    if (isCreatingEvent || !user.id) return;
    setIsCreatingEvent(true);

    try {
      if (typeof ticketTypeData.eventId !== 'number') {
        throw new Error('eventId is required and must be a number');
      }
      if (typeof ticketTypeData.price === 'undefined') {
        throw new Error('Price is required');
      }

      // Crear producto en Stripe primero
      const stripeData = await createStripeProduct();

      // Guardar en la base de datos
      await createTicketType({
        name: ticketTypeData.name?.toString() ?? '',
        eventId: Number(ticketTypeData.eventId),
        price: Number(ticketTypeData.price),
        uid: ticketTypeData.uid?.toString(),
        maxQuantityPerUser:
          ticketTypeData.maxQuantityPerUser !== undefined
            ? Number(ticketTypeData.maxQuantityPerUser)
            : undefined,
        quantity:
          ticketTypeData.quantity !== undefined ? Number(ticketTypeData.quantity) : undefined,
        available:
          ticketTypeData.available !== undefined ? Number(ticketTypeData.available) : undefined,
        description: ticketTypeData.description?.toString(),
        stripeProductId: stripeData.stripeProductId,
        stripePriceId: stripeData.stripePriceId,
        imageUrl: ticketTypeData.imageUrl?.toString(),
        status: ticketTypeData.status?.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast({
        title: _(msg`Ticket type created successfully`),
        description: _(msg`Your ticket type has been created.`),
        duration: 5000,
      });

      setShowEventCreateDialog(false);
    } catch (error) {
      console.error('Error creating ticket type:', error);
      toast({
        title: _(msg`Error creating ticket type`),
        description: _(msg`There was an error creating your ticket type. Please try again.`),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const canCreateEvent = Boolean(user.id) && !isCreatingEvent && ticketTypeData.name;

  return (
    <Dialog
      open={showEventCreateDialog}
      onOpenChange={(value) => !isCreatingEvent && setShowEventCreateDialog(value)}
    >
      <DialogTrigger asChild>
        <Button className="m-1 cursor-pointer" disabled={!user.emailVerified}>
          <FilePlus className="-ml-1 mr-2 h-4 w-4" />
          <Trans>New Ticket Type</Trans>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-full max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Ticket Type</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Create a new ticket type with details like name, price, and description.</Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-100">
              <Trans>Name</Trans>
            </label>
            <Input
              id="name"
              name="name"
              value={ticketTypeData.name}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
            <label htmlFor="description" className="mt-4 block text-sm font-medium text-gray-100">
              <Trans>Description</Trans>
            </label>
            <Textarea
              id="description"
              name="description"
              value={ticketTypeData.description}
              maxLength={maxLength}
              onChange={handleTextareaChange}
              className="mt-1"
            />
          </div>

          <div className="flex w-full items-center justify-center">
            <ImageUploader
              onUpload={async (file: File) => {
                try {
                  // Limita el nombre base a 50 caracteres
                  const parts = file.name.split('.');
                  const ext = parts.length > 1 ? '.' + parts.pop() : '';
                  let base = parts.join('.');
                  if (base.length > 50) base = base.slice(0, 50);
                  const safeName = base + ext;

                  // Crea un nuevo File con el nombre truncado
                  const truncatedFile = new File([file], safeName, { type: file.type });

                  const result = await putFile(truncatedFile);
                  setTicketTypeData((prev) => ({
                    ...prev,
                    imageUrl: result.data,
                  }));
                  setImage(truncatedFile);
                } catch (error) {
                  console.error('Error al subir la imagen:', error);
                }
              }}
              image={image}
              isPending={isCreatingEvent}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-100">
              <Trans>Price</Trans>
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              value={ticketTypeData.price ?? ''}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="available" className="block text-sm font-medium text-gray-100">
              <Trans>Available</Trans>
            </label>
            <Input
              id="available"
              name="available"
              type="number"
              value={ticketTypeData.available ?? ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-100">
              <Trans>Seat Number</Trans>
            </label>
            <Input
              id="seatNumber"
              name="seatNumber"
              value={ticketTypeData.seatNumber ?? ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-100">
              <Trans>Quantity</Trans>
            </label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={ticketTypeData.quantity ?? ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="maxQuantityPerUser" className="block text-sm font-medium text-gray-100">
              <Trans>Max quantity per user</Trans>
            </label>
            <Input
              id="maxQuantityPerUser"
              name="maxQuantityPerUser"
              type="number"
              value={ticketTypeData.maxQuantityPerUser ?? ''}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="events" className="block text-sm font-medium text-gray-100">
              <Trans>Events</Trans>
            </label>
            <select
              id="eventId"
              name="eventId"
              value={ticketTypeData.eventId ?? ''}
              onChange={(e) => {
                setTicketTypeData((prev) => ({
                  ...prev,
                  eventId: e.target.value ? Number(e.target.value) : undefined,
                }));
              }}
              className="mt-1 block w-full rounded border-gray-300"
              required
            >
              <option value="">Select an event</option>
              {eventsList.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isCreatingEvent && (
          <div className="flex items-center justify-center rounded-lg py-4">
            <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreatingEvent}>
              <Trans>Cancel</Trans>
            </Button>
          </DialogClose>
          <Button type="button" onClick={onCreateEvent} disabled={!canCreateEvent}>
            <Trans>Create Ticket Type</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
