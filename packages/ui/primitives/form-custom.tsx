import { useEffect, useState } from 'react';
import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarIcon, PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { type TLpm } from '@documenso/lib/types/lpm';
import { type lpm } from '@documenso/prisma/client';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { PopoverArtists } from '../components/popover-artists';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import { Calendar } from './calendar-year-picker';
import { Card, CardContent } from './card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Textarea } from './textarea';

const formSchema = z.object({
  productId: z.string(),
  productType: z.string(),
  productTitle: z.string(),
  productVersion: z.string().optional(),
  productDisplayArtist: z.string(),
  parentLabel: z.string().optional(),
  label: z.string(),
  artists: z
    .array(
      z.object({
        id: z.number(),
        artistName: z.string().nullable(),
      }),
    )
    .optional(),
  originalReleaseDate: z.date().optional(),
  releaseDate: z.date(),
  upc: z.string(),
  catalog: z.string(),
  productPriceTier: z.string().optional(),
  productGenre: z.array(z.string()).default([]),
  submissionStatus: z.string(),
  productCLine: z.string(),
  productPLine: z.string(),
  preOrderDate: z.date().optional(),
  exclusives: z.string().optional(),
  explicitLyrics: z.string(),
  productPlayLink: z.string().optional(),
  linerNotes: z.string().optional(),
  primaryMetadataLanguage: z.string(),
  compilation: z.string().optional(),
  pdfBooklet: z.string().optional(),
  timedReleaseDate: z.date().optional(),
  timedReleaseMusicServices: z.date().optional(),
  lastProcessDate: z.date(),
  importDate: z.date(),
  createdBy: z.string(),
  lastModified: z.date(),
  submittedAt: z.date(),
  submittedBy: z.string().optional(),
  vevoChannel: z.string().optional(),
  trackType: z.string(),
  trackId: z.string(),
  trackVolume: z.boolean().optional(),
  trackNumber: z.string(),
  trackName: z.string(),
  trackVersion: z.string().optional(),
  trackDisplayArtist: z.string(),
  isrc: z.string(),
  trackPriceTier: z.string().optional(),
  trackGenre: z.string(),
  audioLanguage: z.string(),
  trackCLine: z.string(),
  trackPLine: z.string(),
  writersComposers: z.string(),
  publishersCollectionSocieties: z.string(),
  withholdMechanicals: z.string(),
  preOrderType: z.string().optional(),
  instantGratificationDate: z.date().optional(),
  duration: z.string(),
  sampleStartTime: z.string(),
  explicitLyricsTrack: z.string(),
  albumOnly: z.string(),
  lyrics: z.string().optional(),
  additionalContributorsPerforming: z.string().optional(),
  additionalContributorsNonPerforming: z.string().optional(),
  producers: z.string().optional(),
  continuousMix: z.string(),
  continuouslyMixedIndividualSong: z.string(),
  trackPlayLink: z.string(),
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
  onSubmit: (data: lpm) => void;
  initialData: lpm | null;
  isSubmitting: boolean;
  artistData?: artistData;
}

// Tipo para los pasos del formulario
type FormStep = 'PRODUCT_INFO' | 'TRACK_INFO';

export default function MyForm({ onSubmit, initialData, artistData }: MyFormProps) {
  const { toast } = useToast();

  console.log('Initial data:', initialData);
  console.log('Artist data:', artistData);
  const [step, setStep] = useState<FormStep>('PRODUCT_INFO');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtists, setSelectedArtists] = React.useState<artistData>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submissionStatus: 'Draft',
      explicitLyrics: 'No',
      explicitLyricsTrack: 'No',
      albumOnly: 'No',
      trackVolume: false,
      withholdMechanicals: 'No',
      continuousMix: 'No',
      continuouslyMixedIndividualSong: 'No',
      productGenre: [],
      productVersion: '',
      parentLabel: '',
      originalReleaseDate: new Date(),
      productPriceTier: '',
      preOrderDate: new Date(),
      exclusives: '',
      productPlayLink: '',
      linerNotes: '',
      compilation: '',
      pdfBooklet: '',
      timedReleaseDate: new Date(),
      timedReleaseMusicServices: new Date(),
      submittedBy: '',
      vevoChannel: '',
      trackVersion: '',
      trackPriceTier: '',
      sampleStartTime: '',
      lyrics: '',
      additionalContributorsPerforming: '',
      additionalContributorsNonPerforming: '',
      producers: '',
      trackPlayLink: '',
      preOrderType: '',
      instantGratificationDate: new Date(),
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key !== 'id') {
          // Skip the id field
          // @ts-expect-error - We know these fields exist in our form schema
          form.setValue(key, initialData[key]);
          if (key === 'lpmArtists') {
            // Use type assertion to tell TypeScript that artists property exists
            const artistsData = (initialData as unknown as { lpmArtists: artistData })?.lpmArtists;
            console.log('Setting artists:', key, artistsData);
            setSelectedArtists(artistsData);
          }
        }
      });
    }
  }, [form, initialData]);

  useEffect(() => {
    if (initialData?.productGenre) {
      // Convertir string a array si es necesario
      const genres =
        typeof initialData.productGenre === 'string'
          ? initialData.productGenre.split(',').filter(Boolean)
          : initialData.productGenre;

      form.setValue('productGenre', genres);
    }
  }, [initialData, form]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const dataToSubmit = initialData?.id ? { ...values, id: initialData.id } : values;
      console.log('Form submitted:', dataToSubmit);
      const dataToSend = {
        ...dataToSubmit,
        productGenre: Array.isArray(dataToSubmit.productGenre)
          ? dataToSubmit.productGenre.join(',')
          : dataToSubmit.productGenre,
        lpmArtists: selectedArtists.map((artist) => ({
          id: artist.artistId,
          artistName: artist.artistName || '',
        })),
      };
      console.log('Data to send:', dataToSend);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      await onSubmit(dataToSend as unknown as TLpm);
      console.log('Form submitted successfully', values);
      toast({
        description: 'Data submitted successfully',
      });
    } catch (error) {
      console.error('Form submission error', error);
      toast({
        variant: 'destructive',
        description: 'Error submitting data',
      });
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    console.log('Form errors use effect:', form.formState.errors);
  }, [form.formState.errors]);
  // Función para validar los campos del paso 1 y avanzar al paso 2
  const onNextClick = async () => {
    const productFields = [
      'productId',
      'productType',
      'productTitle',
      'productDisplayArtist',
      'label',
      'originalReleaseDate',
      'releaseDate',
      'upc',
      'catalog',
      'productGenre',
      'submissionStatus',
      'productCLine',
      'productPLine',
      'preOrderDate',
      'exclusives',
      'explicitLyrics',
      'productPlayLink',
      'linerNotes',
      'primaryMetadataLanguage',
      'compilation',
      'pdfBooklet',
      'timedReleaseDate',
      'timedReleaseMusicServices',
      'lastProcessDate',
      'importDate',
      'createdBy',
      'lastModified',
      'submittedAt',
      'submittedBy',
      'vevoChannel',
    ];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const isValid = await form.trigger(productFields as any);

    if (isValid) {
      setStep('TRACK_INFO');
    } else {
      toast({
        variant: 'destructive',
        description: 'Por favor completa todos los campos requeridos.',
      });
    }
  };

  // Opciones para selects
  const yesNoOptions = [
    { label: 'Sí', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  const genreOptions = [
    { label: 'Rock', value: 'Rock' },
    { label: 'Pop', value: 'Pop' },
    { label: 'Hip Hop', value: 'Hip Hop' },
    { label: 'Electrónica', value: 'Electronic' },
    { label: 'Clásica', value: 'Classical' },
    { label: 'Jazz', value: 'Jazz' },
    { label: 'R&B', value: 'R&B' },
    { label: 'Latina', value: 'Latin' },
  ];

  const languageOptions = [
    { label: 'Español', value: 'Spanish' },
    { label: 'Inglés', value: 'English' },
    { label: 'Francés', value: 'French' },
    { label: 'Alemán', value: 'German' },
    { label: 'Japonés', value: 'Japanese' },
    { label: 'Portugués', value: 'Portuguese' },
  ];

  const productTypeOptions = [
    { label: 'Álbum', value: 'Album' },
    { label: 'Single', value: 'Single' },
    { label: 'EP', value: 'EP' },
    { label: 'Music Video', value: 'Music Video' },
    { label: 'Audio', value: 'Audio' },
  ];

  const trackTypeOptions = [
    { label: 'Audio', value: 'Audio' },
    { label: 'Video', value: 'Video' },
    { label: 'Remix', value: 'Remix' },
    { label: 'Acústico', value: 'Acoustic' },
  ];

  const statusOptions = [
    { label: 'Borrador', value: 'Draft' },
    { label: 'Pendiente', value: 'Pending' },
    { label: 'Enviado', value: 'Submitted' },
    { label: 'Aprobado', value: 'Approved' },
    { label: 'Rechazado', value: 'Rejected' },
  ];

  return (
    <div className="mx-auto max-w-6xl py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="">
          <Card className="border-border dark:bg-background relative p-6">
            {step === 'PRODUCT_INFO' && (
              <div className="h-20">
                <h1 className="text-xl font-semibold md:text-2xl">
                  Información del Producto Musical
                </h1>
                <p className="text-muted-foreground mt-2 text-xs md:text-sm">
                  Complete la información básica del producto o álbum musical. Todos los campos
                  marcados son obligatorios.
                </p>
              </div>
            )}

            {step === 'TRACK_INFO' && (
              <div className="h-20">
                <h1 className="text-xl font-semibold md:text-2xl">Información de la Pista</h1>
                <p className="text-muted-foreground mt-2 text-xs md:text-sm">
                  Complete la información detallada de la pista o canción. Esta información es
                  esencial para la distribución musical.
                </p>
              </div>
            )}

            <ScrollArea className="h-[60vh] w-full">
              <hr className="-mx-6 my-4" />

              {/* Paso 1: Información del Producto */}
              {step === 'PRODUCT_INFO' && (
                <CardContent className="px-1 pb-0">
                  <fieldset disabled={isSubmitting} className="space-y-6">
                    {/* Sección 1: Información básica del producto */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID del Producto</FormLabel>
                              <FormControl>
                                <Input placeholder="PRD123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Producto</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tipo de producto" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {productTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                          name="productTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del álbum o single" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productVersion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Versión del Producto (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Deluxe Edition, Remastered, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productDisplayArtist"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Artista Principal</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del artista" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div> */}
                      <div className="col-span-12">
                        {artistData && artistData.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <p>Artistas</p>
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
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="releaseDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Release Date</FormLabel>
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
                                        (() => {
                                          try {
                                            // Handle different date formats safely
                                            const date = new Date(field.value);
                                            return isNaN(date.getTime())
                                              ? 'Select date'
                                              : format(date, 'dd/MM/yyyy');
                                          } catch (error) {
                                            return 'Select date';
                                          }
                                        })()
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
                                        // Safely parse the date
                                        const date = field.value
                                          ? field.value instanceof Date
                                            ? field.value
                                            : new Date(field.value)
                                          : undefined;
                                        return date && !isNaN(date.getTime()) ? date : undefined;
                                      } catch (error) {
                                        return undefined;
                                      }
                                    })()}
                                    onSelect={(date) => field.onChange(date)} // Enviar Date directamente
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
                    </div>

                    <Separator />

                    {/* Sección 2: Información de sello y comercial */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="label"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sello Discográfico</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre del sello" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        {/* <FormField
                          control={form.control}
                          name="originalReleaseDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Original Release Date</FormLabel>
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
                                        (() => {
                                          try {
                                            // Handle different date formats safely
                                            const date = new Date(field.value);
                                            return isNaN(date.getTime())
                                              ? 'Select date'
                                              : format(date, 'dd/MM/yyyy');
                                          } catch (error) {
                                            return 'Select date';
                                          }
                                        })()
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
                                        // Safely parse the date
                                        const date = field.value
                                          ? new Date(field.value)
                                          : undefined;
                                        return date && !isNaN(date.getTime()) ? date : undefined;
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
                        /> */}

                        <FormField
                          control={form.control}
                          name="originalReleaseDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Original Release Date</FormLabel>
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
                                        (() => {
                                          try {
                                            console.log('Field value:', field.value);
                                            // Handle different date formats safely
                                            const date = new Date(field.value);
                                            return isNaN(date.getTime())
                                              ? 'Select date'
                                              : format(date, 'dd/MM/yyyy');
                                          } catch (error) {
                                            return 'Select date';
                                          }
                                        })()
                                      ) : (
                                        // format(
                                        //   // Only try to format if field.value is a non-empty string
                                        //   field.value && field.value.trim() !== ''
                                        //     ? new Date(field.value + 'T00:00:00')
                                        //     : new Date(),
                                        //   'dd/MM/yyyy',
                                        // )
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
                                        return field.value ? new Date(field.value) : undefined;
                                      } catch (error) {
                                        return undefined;
                                      }
                                    })()}
                                    onSelect={(date) => field.onChange(date)}
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
                          name="parentLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sello Principal (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Sello matriz" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="upc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UPC (Código Universal de Producto)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 884977968484" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="catalog"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Catálogo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: ABC-123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productPriceTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Price Tier (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Standard, Budget, Premium" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productGenre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Género Musical</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona género" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {genreOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div> */}

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productGenre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Género Musical (múltiple)</FormLabel>
                              <div className="relative">
                                <Select
                                  onValueChange={(value) => {
                                    // Crea una copia del array de valores actuales
                                    const currentValues = Array.isArray(field.value)
                                      ? [...field.value]
                                      : [];

                                    // Verifica si el valor ya está seleccionado
                                    const valueIndex = currentValues.indexOf(value);

                                    // Si ya está seleccionado, lo eliminamos
                                    if (valueIndex !== -1) {
                                      currentValues.splice(valueIndex, 1);
                                      field.onChange(currentValues);
                                    } else {
                                      // Si no está seleccionado, lo añadimos
                                      field.onChange([...currentValues, value]);
                                    }

                                    // Fuerza un refresco del componente
                                    field.onBlur();
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder="Selecciona géneros"
                                        className="truncate"
                                      >
                                        {Array.isArray(field.value) && field.value.length > 0
                                          ? field.value
                                              .map((value: string) => {
                                                const option = genreOptions.find(
                                                  (opt) => opt.value === value,
                                                );
                                                return option ? option.label : value;
                                              })
                                              .join(', ')
                                          : 'Selecciona géneros'}
                                      </SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {genreOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="flex items-center space-x-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="border-primary flex h-4 w-4 items-center justify-center rounded-sm border">
                                            {Array.isArray(field.value) &&
                                              field.value.includes(option.value) && (
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  className="h-3 w-3"
                                                >
                                                  <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                              )}
                                          </div>
                                          <span>{option.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {Array.isArray(field.value) &&
                                  field.value.map((value: string) => {
                                    const option = genreOptions.find((opt) => opt.value === value);
                                    return (
                                      <div
                                        key={value}
                                        className="bg-secondary text-secondary-foreground flex items-center rounded-md px-2 py-1 text-xs"
                                      >
                                        {option?.label || value}
                                        <button
                                          type="button"
                                          className="text-secondary-foreground/70 hover:text-secondary-foreground ml-1"
                                          onClick={() => {
                                            // Eliminar este género del array
                                            const newValues = Array.isArray(field.value)
                                              ? field.value.filter((item: string) => item !== value)
                                              : [];
                                            field.onChange(newValues);

                                            // Fuerza actualización del componente
                                            field.onBlur();
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-3 w-3"
                                          >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                          </svg>
                                        </button>
                                      </div>
                                    );
                                  })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sección 3: Información adicional y derechos */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productCLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Copyright (℗)</FormLabel>
                              <FormControl>
                                <Input placeholder="℗ 2025 Sello Discográfico" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="productPLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishing (©)</FormLabel>
                              <FormControl>
                                <Input placeholder="© 2025 Editora Musical" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        {/* <FormField
                          control={form.control}
                          name="preOrderDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Pre-Orden</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}
                      </div>

                      <div className="col-span-12">
                        <FormField
                          control={form.control}
                          name="exclusives"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exclusivas</FormLabel>
                              <FormControl>
                                <Input placeholder="Exclusivas" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="primaryMetadataLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Idioma Principal de Metadatos</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona idioma" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languageOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                          name="explicitLyrics"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Explicit Lyrics</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una opción" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yesNoOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="productPlayLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Play Link (URL)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enlace de Reproducción" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="compilation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compilación</FormLabel>
                            <FormControl>
                              <Input placeholder="Compilation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="pdfBooklet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PDF Booklet</FormLabel>
                            <FormControl>
                              <Input placeholder="PDF Booklet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name="timedReleaseDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Timed Release Date</FormLabel>
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
                                      (() => {
                                        try {
                                          // Handle different date formats safely
                                          const date = new Date(field.value);
                                          return isNaN(date.getTime())
                                            ? 'Select date'
                                            : format(date, 'dd/MM/yyyy');
                                        } catch (error) {
                                          return 'Select date';
                                        }
                                      })()
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
                                      // Safely parse the date
                                      const date = field.value
                                        ? field.value instanceof Date
                                          ? field.value
                                          : new Date(field.value)
                                        : undefined;
                                      return date && !isNaN(date.getTime()) ? date : undefined;
                                    } catch (error) {
                                      return undefined;
                                    }
                                  })()}
                                  onSelect={(date) => field.onChange(date)} // Enviar Date directamente
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
                        name="timedReleaseMusicServices"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Timed Release MusicServices</FormLabel>
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
                                      (() => {
                                        try {
                                          // Handle different date formats safely
                                          const date = new Date(field.value);
                                          return isNaN(date.getTime())
                                            ? 'Select date'
                                            : format(date, 'dd/MM/yyyy');
                                        } catch (error) {
                                          return 'Select date';
                                        }
                                      })()
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
                                      // Safely parse the date
                                      const date = field.value
                                        ? field.value instanceof Date
                                          ? field.value
                                          : new Date(field.value)
                                        : undefined;
                                      return date && !isNaN(date.getTime()) ? date : undefined;
                                    } catch (error) {
                                      return undefined;
                                    }
                                  })()}
                                  onSelect={(date) => field.onChange(date)} // Enviar Date directamente
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

                    <div className="col-span-12">
                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="linerNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinerNotes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="LinerNotes" className="min-h-32" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Sección 4: Información de estado y sistema */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="submissionStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado de Envío</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                          name="lastProcessDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Last Process Date</FormLabel>
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
                                        (() => {
                                          try {
                                            // Handle different date formats safely
                                            const date = new Date(field.value);
                                            return isNaN(date.getTime())
                                              ? 'Select date'
                                              : format(date, 'dd/MM/yyyy');
                                          } catch (error) {
                                            return 'Select date';
                                          }
                                        })()
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
                                        // Safely parse the date
                                        const date = field.value
                                          ? field.value instanceof Date
                                            ? field.value
                                            : new Date(field.value)
                                          : undefined;
                                        return date && !isNaN(date.getTime()) ? date : undefined;
                                      } catch (error) {
                                        return undefined;
                                      }
                                    })()}
                                    onSelect={(date) => field.onChange(date)} // Enviar Date directamente
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
                          name="importDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>ImportDate</FormLabel>
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
                                        (() => {
                                          try {
                                            // Handle different date formats safely
                                            const date = new Date(field.value);
                                            return isNaN(date.getTime())
                                              ? 'Select date'
                                              : format(date, 'dd/MM/yyyy');
                                          } catch (error) {
                                            return 'Select date';
                                          }
                                        })()
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
                                        // Safely parse the date
                                        const date = field.value
                                          ? field.value instanceof Date
                                            ? field.value
                                            : new Date(field.value)
                                          : undefined;
                                        return date && !isNaN(date.getTime()) ? date : undefined;
                                      } catch (error) {
                                        return undefined;
                                      }
                                    })()}
                                    onSelect={(date) => field.onChange(date)} // Enviar Date directamente
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
                          name="createdBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Creado Por</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="submittedBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subido por</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="vevoChannel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>vevoChannel(URL)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        {/* <FormField
                          control={form.control}
                          name="lastModified"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Última Modificación</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}

                        <FormField
                          control={form.control}
                          name="lastModified"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>lastModified</FormLabel>
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
                                        (() => {
                                          try {
                                            // Handle different date formats safely
                                            const date = new Date(field.value);
                                            return isNaN(date.getTime())
                                              ? 'Select date'
                                              : format(date, 'dd/MM/yyyy');
                                          } catch (error) {
                                            return 'Select date';
                                          }
                                        })()
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
                                        // Safely parse the date
                                        const date = field.value
                                          ? field.value instanceof Date
                                            ? field.value
                                            : new Date(field.value)
                                          : undefined;
                                        return date && !isNaN(date.getTime()) ? date : undefined;
                                      } catch (error) {
                                        return undefined;
                                      }
                                    })()}
                                    onSelect={(date) => field.onChange(date)} // Enviar Date directamente
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
                          name="submittedAt"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>submittedAt</FormLabel>
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
                                        (() => {
                                          try {
                                            // Handle different date formats safely
                                            const date = new Date(field.value);
                                            return isNaN(date.getTime())
                                              ? 'Select date'
                                              : format(date, 'dd/MM/yyyy');
                                          } catch (error) {
                                            return 'Select date';
                                          }
                                        })()
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
                                        // Safely parse the date
                                        const date = field.value
                                          ? field.value instanceof Date
                                            ? field.value
                                            : new Date(field.value)
                                          : undefined;
                                        return date && !isNaN(date.getTime()) ? date : undefined;
                                      } catch (error) {
                                        return undefined;
                                      }
                                    })()}
                                    onSelect={(date) => field.onChange(date)} // Enviar Date directamente
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
                    </div>
                  </fieldset>
                </CardContent>
              )}

              {/* Paso 2: Información de la Pista */}
              {step === 'TRACK_INFO' && (
                <CardContent className="px-0 pb-0">
                  <fieldset disabled={isSubmitting} className="space-y-6">
                    {/* Sección 1: Información básica de pista */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID de Pista</FormLabel>
                              <FormControl>
                                <Input placeholder="TRK123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Pista</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tipo de pista" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {trackTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                          name="trackName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de la Pista</FormLabel>
                              <FormControl>
                                <Input placeholder="Título de la canción" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Pista</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          control={form.control}
                          name="trackDisplayArtist"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Artista de la Pista</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre del artista para esta pista"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackVersion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Versión de la Pista (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Remix, Live, Acoustic, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="isrc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ISRC</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: USABC1234567" {...field} />
                              </FormControl>
                              <FormDescription>
                                Código Internacional Estándar de Grabación
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackPriceTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Track Price Tier</FormLabel>
                              <FormControl>
                                <Input placeholder="" {...field} />
                              </FormControl>
                              <FormDescription>Nivel de precio para la pista</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sección 2: Información de derechos y comercial */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackCLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Copyright de Pista (℗)</FormLabel>
                              <FormControl>
                                <Input placeholder="℗ 2025 Sello Discográfico" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackPLine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publishing de Pista (©)</FormLabel>
                              <FormControl>
                                <Input placeholder="© 2025 Editora Musical" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="trackGenre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Género de la Pista</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona género" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {genreOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                          disabled={isLoading}
                          control={form.control}
                          name="audioLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Idioma del Audio</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona idioma" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languageOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                          disabled={isLoading}
                          control={form.control}
                          name="explicitLyricsTrack"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contenido Explícito en Pista</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una opción" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yesNoOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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

                    {/* Sección 3: Información técnica */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duración</FormLabel>
                              <FormControl>
                                <Input placeholder="03:45" {...field} />
                              </FormControl>
                              <FormDescription>Formato mm:ss</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="sampleStartTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sample Start Time</FormLabel>
                              <FormControl>
                                <Input placeholder="03:45" {...field} />
                              </FormControl>
                              <FormDescription>Formato mm:ss</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="albumOnly"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>¿Solo en Álbum?</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una opción" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yesNoOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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
                          disabled={isLoading}
                          control={form.control}
                          name="writersComposers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compositores</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombres de compositores separados por comas"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="publishersCollectionSocieties"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Editoras y Sociedades de Gestión</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Editoras y sociedades separadas por comas"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="withholdMechanicals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>withholdMechanicals</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una opción" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yesNoOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
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

                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="preOrderType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Pre-Orden</FormLabel>
                            <FormControl>
                              <Input placeholder="Tipo de Pre-Orden" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      {/* <FormField
                        control={form.control}
                        name="instantGratificationDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Gratificación Instantánea</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                    </div>

                    <Separator />

                    {/* Sección 4: Información complementaria */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="lyrics"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Letras (Opcional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Letras de la canción"
                                  className="min-h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="producers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Productores (Opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombres de productores separados por comas"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="additionalContributorsPerforming"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Colaboradores Adicionales (Intérpretes) (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Músicos, vocalistas, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="additionalContributorsNonPerforming"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Colaboradores Adicionales (No Intérpretes) (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Músicos, vocalistas, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12">
                        <FormField
                          control={form.control}
                          name="trackPlayLink"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Track Play Link(URL)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </fieldset>
                </CardContent>
              )}

              {/* Indicador de Progreso */}
              <div className="mt-6 px-6">
                {step === 'PRODUCT_INFO' && (
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium">Información del Producto</span> 1/2
                  </p>
                )}

                {step === 'TRACK_INFO' && (
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium">Información de la Pista</span> 2/2
                  </p>
                )}

                <div className="bg-foreground/40 relative mt-4 h-1.5 rounded-full">
                  <motion.div
                    layout="size"
                    layoutId="form-step-progress"
                    className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
                    style={{
                      width: step === 'PRODUCT_INFO' ? '50%' : '100%',
                    }}
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Botones de navegación */}
            <div className="mt-6 flex items-center gap-x-4 px-6">
              {/* Botón para volver al paso anterior */}
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="flex-1"
                disabled={step === 'PRODUCT_INFO' || isLoading}
                onClick={() => setStep('PRODUCT_INFO')}
              >
                Volver
              </Button>

              {/* Botón para avanzar o enviar */}
              {step === 'PRODUCT_INFO' && (
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 disabled:cursor-not-allowed"
                  loading={isLoading}
                  onClick={onNextClick}
                >
                  Siguiente
                </Button>
              )}

              {step === 'TRACK_INFO' && (
                <>
                  {/* <Button
                      onClick={() => console.log('pepe')}
                      type="submit"
                      size="lg"
                      className="flex-1"
                      loading={isSubmitting}
                    >
                      Completar
                    </Button> */}
                  <Button
                    disabled={isLoading}
                    loading={isLoading}
                    type="button"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      const values = form.getValues();
                      void handleSubmit(values); // Using void operator to explicitly mark as intentionally unhandled
                    }}
                  >
                    Completar
                  </Button>
                </>
              )}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
