import { useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ListFilter, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { trpc } from '@documenso/trpc/react';
import type { Config, Result } from '@documenso/ui/lib/types';
import { Button } from '@documenso/ui/primitives/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@documenso/ui/primitives/drawer';
import { ScrollArea } from '@documenso/ui/primitives/scroll-area';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useOptionalCurrentTeam } from '~/providers/team';

import { QueryViewer } from '../general/advance-filters/query-viewer';
import { Results } from '../general/advance-filters/results';
import { Search } from '../general/advance-filters/search';
import { SuggestedQueries } from '../general/advance-filters/suggested-queries';

const ZCreateFolderFormSchema = z.object({
  name: z.string().min(1, { message: 'Folder name is required' }),
});

type TCreateFolderFormSchema = z.infer<typeof ZCreateFolderFormSchema>;

export type CreateFolderDialogProps = {
  trigger?: React.ReactNode;
  tableToConsult: string;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

type SearchProps = {
  status?: 'NO_ESPECIFICADO' | 'VIGENTE' | 'FINALIZADO' | undefined;
  query?: string | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
  period?: '7d' | '14d' | '30d' | undefined;
};

export const AdvancedFilterDialog = ({
  trigger,
  tableToConsult,
  ...props
}: CreateFolderDialogProps) => {
  const aiQuery = trpc.document.aiConnection.useMutation();

  const { _ } = useLingui();
  const { toast } = useToast();
  const { folderId } = useParams();

  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const [inputValue, setInputValue] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [activeQuery, setActiveQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [chartConfig, setChartConfig] = useState<Config | null>(null);

  const handleSubmit = async (suggestion?: string) => {
    const question = suggestion ?? inputValue;
    if (inputValue.length === 0 && !suggestion) return;
    clearExistingData();
    if (question.trim()) {
      setSubmitted(true);
    }
    setLoading(true);
    setLoadingStep(1);
    setActiveQuery('');
    try {
      const { query, companies, generation } = await aiQuery.mutateAsync({
        question,
        tableToConsult,
      });

      // const query = await generateQuery(question);
      console.log('Generated query:', query);
      if (query === undefined) {
        toast({
          description: _(msg`An error occurred. Please try again.`),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      setActiveQuery(query);
      setLoadingStep(2);
      // const companies = await runGenerateSQLQuery(query);
      console.log('SQL query results:', companies);
      const columns = companies.length > 0 ? Object.keys(companies[0]) : [];
      setResults(companies);
      setColumns(columns);
      setLoading(false);
      // const generation = await generateChartConfig(companies, question);
      if (generation && generation.config) {
        setChartConfig(generation.config);
      }
    } catch (e) {
      console.error('Error generating query or running SQL:', e);
      toast({
        description: _(msg`An error occurred. Please try again.`),
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion);
    try {
      await handleSubmit(suggestion);
    } catch (e) {
      toast({
        description: _(msg`An error occurred. Please try again.`),
        variant: 'destructive',
      });
    }
  };

  const clearExistingData = () => {
    setActiveQuery('');
    setResults([]);
    setColumns([]);
    setChartConfig(null);
  };

  const handleClear = () => {
    setSubmitted(false);
    setInputValue('');
    clearExistingData();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="flex w-full items-center space-x-2 sm:w-fit">
            <ListFilter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] !max-h-screen">
        <DrawerHeader>
          <DrawerTitle>Advanced Filters</DrawerTitle>
          <DrawerDescription>
            Use the filters below to refine your search results.
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="h-[90vh] w-full">
          <motion.div
            className="bg-card sm:border-border flex flex-grow flex-col rounded-xl sm:border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex flex-grow flex-col p-6 sm:p-8">
              {/* <Header handleClear={handleClear} /> */}
              <Search
                handleClear={handleClear}
                handleSubmit={handleSubmit}
                inputValue={inputValue}
                setInputValue={setInputValue}
                submitted={submitted}
              />
              <div id="main-container" className="flex flex-grow flex-col sm:min-h-[420px]">
                <div className="h-full flex-grow">
                  <AnimatePresence mode="wait">
                    {!submitted ? (
                      <SuggestedQueries
                        tableToConsult={tableToConsult}
                        handleSuggestionClick={handleSuggestionClick}
                      />
                    ) : (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        className="flex min-h-[400px] flex-col sm:h-full"
                      >
                        {activeQuery.length > 0 && (
                          <QueryViewer activeQuery={activeQuery} inputValue={inputValue} />
                        )}
                        {loading ? (
                          <div className="bg-background/50 absolute flex h-full w-full flex-col items-center justify-center space-y-4">
                            <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
                            <p className="text-foreground">
                              {loadingStep === 1
                                ? 'Generating SQL query...'
                                : 'Running SQL query...'}
                            </p>
                          </div>
                        ) : results.length === 0 ? (
                          <div className="flex flex-grow items-center justify-center">
                            <p className="text-muted-foreground text-center">No results found.</p>
                          </div>
                        ) : (
                          <Results results={results} chartConfig={chartConfig} columns={columns} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollArea>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="w-full" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
