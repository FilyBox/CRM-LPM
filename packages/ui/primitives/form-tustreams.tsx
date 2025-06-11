import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type TtuStreams } from '@documenso/lib/types/tustreams';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { PopoverArtists } from '../components/popover-artists';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty' }),
  UPC: z.string().optional().nullable(),
  artist: z.string().optional().nullable(),
  type: z.enum(['Sencillo', 'Album', 'Single', 'EP']).optional().nullable(),
  total: z.number().optional().nullable(),
  date: z.date().optional().nullable(),
});

type artistData = {
  teamId: number | null;
  id: number;
  userId: number | null;
  createdAt: Date;
  artistId: number;
  artistName: string;
}[];

interface MyFormProps {
  onSubmit: (data: TtuStreams) => void;
  initialData?: TtuStreams | null;
  artistData?: artistData;
}

export default function FormTuStreams({ onSubmit, initialData, artistData }: MyFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<artistData>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      UPC: '',
      artist: '',
      type: undefined,
      date: undefined,
    },
  });

  const TypeOfTuStreamsValues = {
    Sencillo: 'Sencillo',
    Album: 'Album',
    Single: 'Single',
    EP: 'EP',
  } as const;

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key !== 'id') {
          // Skip the id field
          // @ts-expect-error - We know these fields exist in our form schema
          form.setValue(key, initialData[key]);
          if (key === 'tuStreamsArtists') {
            // Use type assertion to tell TypeScript that artists property exists
            const artistsData = (initialData as unknown as { tuStreamsArtists: artistData })
              ?.tuStreamsArtists;
            console.log('Setting artists:', key, artistsData);
            setSelectedArtists(artistsData);
          }
        }
      });
    }
  }, [form, initialData]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const dataToSubmit = {
        ...values,
        date: values.date ? new Date(values.date + 'T00:00:00') : null,
        ...(initialData?.id && { id: initialData.id }),
        tuStreamsArtists: selectedArtists.map((artist) => ({
          id: artist.artistId,
          artistName: artist.artistName || '',
        })),
      };

      await onSubmit(dataToSubmit as TtuStreams);

      toast({
        description: 'TuStreams record submitted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error submitting TuStreams record',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const convertToNumber = (value: string): number | undefined => {
    if (!value || value === '') return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  return (
    <div className="mx-auto max-w-4xl py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="">
          <Card className="border-border dark:bg-background relative p-6">
            <ScrollArea className="h-[60vh] w-full">
              <hr className="-mx-6 my-4" />

              <CardContent className="px-1 pb-0">
                <fieldset disabled={isLoading} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12">
                      <FormField
                        control={form.control}
                        name="UPC"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UPC</FormLabel>
                            <FormControl>
                              <Input placeholder="UPC Code" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {artistData && artistData.length > 0 && (
                      <div className="col-span-12">
                        <p>Artist</p>
                        <Popover modal={true}>
                          <PopoverTrigger asChild className="w-fit">
                            <Button className="min-h-9 min-w-9">
                              <PlusIcon width="25" height="25" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="z-9999 w-fit">
                            <PopoverArtists
                              selectedArtists={selectedArtists}
                              setSelectedArtists={setSelectedArtists}
                              userArray={artistData}
                            />
                          </PopoverContent>
                        </Popover>

                        {selectedArtists.length > 0 ? (
                          <div className="flex -space-x-2 overflow-hidden">
                            {selectedArtists.map((user) => (
                              <Avatar
                                key={user.id}
                                className="border-background inline-block border-2"
                              >
                                {user.artistName && (
                                  <AvatarFallback>{user.artistName[0]}</AvatarFallback>
                                )}
                              </Avatar>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground h-10 text-sm">
                            Select artists to add to this thread.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value)}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TypeOfTuStreamsValues).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="total"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(convertToNumber(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </fieldset>
              </CardContent>
            </ScrollArea>

            {/* Submit Button */}
            <div className="mt-6 flex items-center justify-end gap-x-4 px-6">
              <Button
                disabled={isLoading}
                loading={isLoading}
                type="button"
                size="lg"
                className="flex-1"
                onClick={() => {
                  void form.trigger().then((isValid) => {
                    if (isValid) {
                      const values = form.getValues();
                      void handleSubmit(values);
                    } else {
                      toast({
                        variant: 'destructive',
                        description: 'Complete all required fields',
                      });
                    }
                  });
                }}
              >
                Completar
              </Button>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
