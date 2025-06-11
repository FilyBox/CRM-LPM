import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Release, TypeOfRelease } from '@prisma/client';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type Releases } from '@documenso/prisma/client';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { cn } from '../lib/utils';
import { Button } from './button';
// import { Calendar } from './calendar';
import { Calendar } from './calendar-year-picker';
import { Card, CardContent } from './card';
import { Checkbox } from './checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';

const TypeOfReleaseValues = {
  ALBUM: 'Album',
  EP: 'EP',
  SINGLE: 'Sencillo',
  // ...(typeof TypeOfRelease === 'object' ? TypeOfRelease : {}),
};

const ReleaseValues = {
  FOCUS: 'Focus',
  SOFT: 'Soft',
  // ...(typeof Release === 'object' ? Release : {}),
};

const formSchema = z.object({
  date: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === null ? '' : val)),
  artist: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === null ? '' : val)),
  lanzamiento: z.string().min(1, { message: 'Release title cannot be empty' }),
  typeOfRelease: z.nativeEnum(TypeOfRelease).optional(),
  release: z.nativeEnum(Release).optional(),
  uploaded: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === null ? '' : val)),
  streamingLink: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === null ? '' : val)),
  assets: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  canvas: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  cover: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  audioWAV: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  video: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  banners: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  pitch: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  EPKUpdates: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  WebSiteUpdates: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  Biography: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
});

interface MyFormProps {
  onSubmit: (data: Releases) => void;
  initialData?: Releases | null;
}

export default function FormReleases({ onSubmit, initialData }: MyFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: '',
      artist: '',
      lanzamiento: '',
      typeOfRelease: undefined,
      release: undefined,
      uploaded: '',
      streamingLink: '',
      assets: false,
      canvas: false,
      cover: false,
      audioWAV: false,
      video: false,
      banners: false,
      pitch: false,
      EPKUpdates: false,
      WebSiteUpdates: false,
      Biography: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key !== 'id') {
          // Skip the id field
          // @ts-expect-error - We know these fields exist in our form schema

          form.setValue(key, initialData[key]);
          if (key === 'typeOfRelease' || key === 'release') {
            form.setValue(key, undefined);
          }
        }
      });
    }
  }, [form, initialData]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form values:', values);
    try {
      setIsLoading(true);
      const dataToSubmit = initialData?.id ? { ...values, id: initialData.id } : values;
      console.log('Form submitted:', dataToSubmit);

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      await onSubmit(dataToSubmit as unknown as Releases);

      toast({
        description: 'Release submitted successfully',
      });
    } catch (error) {
      console.error('Form submission error', error);
      toast({
        variant: 'destructive',
        description: 'Error submitting release',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="">
          <Card className="border-border dark:bg-background relative p-6">
            {/* <div className="h-20">
              <h1 className="text-xl font-semibold md:text-2xl">Release Information</h1>
              
            </div> */}

            <ScrollArea className="h-[60vh] w-full">
              <hr className="-mx-6 my-4" />

              <CardContent className="px-1 pb-0">
                <fieldset disabled={isLoading} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      {/* <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-[240px] pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      (console.log('pepe', field.value),
                                      format(
                                        // Only try to format if field.value is a non-empty string
                                        field.value && field.value.trim() !== ''
                                          ? new Date(field.value + 'T00:00:00')
                                          : new Date(),
                                        'dd/MM/yyyy',
                                      ))
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="z-9999 w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={(() => {
                                    try {
                                      return field.value && field.value.trim() !== ''
                                        ? new Date(field.value + 'T00:00:00')
                                        : undefined;
                                    } catch (error) {
                                      return undefined;
                                    }
                                  })()}
                                  onSelect={(date) =>
                                    field.onChange(date ? date.toISOString().split('T')[0] : '')
                                  }
                                  disabled={(date) => date < new Date('1900-01-01')}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="artist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artist</FormLabel>
                            <FormControl>
                              <Input placeholder="Artist name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="lanzamiento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lanzamiento</FormLabel>
                            <FormControl>
                              <Input placeholder="Lanzamiento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="typeOfRelease"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type of Release</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value)}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type of release" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(TypeOfReleaseValues).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                        name="release"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Type</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value)}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select release type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(ReleaseValues).map((release) => (
                                  <SelectItem key={release} value={release}>
                                    {release}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Release Details */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="uploaded"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uploaded</FormLabel>
                            <FormControl>
                              <Input placeholder="Upload status" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="streamingLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Streaming Link</FormLabel>
                            <FormControl>
                              <Input placeholder="Link to streaming" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* <div className="col-span-12">
                      <FormField
                        control={form.control}
                        name="assets"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assets</FormLabel>
                            <FormControl>
                              <Input placeholder="Assets information" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div> */}
                  </div>

                  <Separator />

                  {/* Checkboxes Section */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="assets"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Assets</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="canvas"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Canvas</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="cover"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Cover</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="audioWAV"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Audio WAV</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="video"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Video</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="banners"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Banners</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="pitch"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Pitch</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="EPKUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">EPK Updates</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="WebSiteUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Website Updates</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="Biography"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Biography</FormLabel>
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
              {/* <Button type="submit" size="lg" disabled={isLoading} className="min-w-32">
                {isLoading ? 'Submitting...' : 'Submit Release'}
              </Button> */}
              <Button
                disabled={isLoading}
                loading={isLoading}
                type="button"
                size="lg"
                className="flex-1"
                onClick={() => {
                  // Trigger validation before submitting
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
