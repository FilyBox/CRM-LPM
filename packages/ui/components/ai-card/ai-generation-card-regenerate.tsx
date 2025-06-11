import { useEffect, useState } from 'react';

import { useRealtimeRun } from '@trigger.dev/react-hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, XCircleIcon } from 'lucide-react';

import type { contractInfoTask } from '@documenso/lib/trigger/example';
import { type Contract } from '@documenso/prisma/client';
import { Button } from '@documenso/ui/primitives/button';

import { Card, CardContent } from '../../primitives/card';
import { ScrollArea } from '../../primitives/scroll-area';

export default function Component({
  contract,
  publicAccessToken,
  handleRetry,
  runId,
}: {
  contract: Contract;
  runId: string;
  publicAccessToken: string;
  documentRootPath: string;
  handleRetry: () => void;
}) {
  const { run, error } = useRealtimeRun<typeof contractInfoTask>(runId, {
    accessToken: publicAccessToken,
  });
  console.log('runId', runId);
  console.log('run', run);
  const [isGenerating, setIsGenerating] = useState(true);
  console.log('isGenerating', isGenerating);
  const [showResult, setShowResult] = useState(false);

  const [contractDetailsVisible, setContractDetailsVisible] = useState(false);
  const [contractDetails, setContractDetails] = useState<Contract | null>(null);

  const cardVariants = {
    generating: {
      transition: { duration: 0.5 },
    },
    completed: {
      transition: { duration: 0.8 },
    },
  };

  const shimmerVariants = {
    animate: {
      x: ['-100%', '200%'],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 2,
        ease: 'easeInOut',
      },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.3,
      },
    },
  };

  // useEffect(() => {
  //   console.log('runId changed:', runId);
  //   setIsGenerating(true);
  //   setShowResult(false);
  //   setDisplayText('');
  //   setGeneratedContent('');
  //   setContractDetails(null);
  // }, [runId]);

  useEffect(() => {
    if (run && run.status === 'COMPLETED') {
      setIsGenerating(false);
      setContractDetails(run.output as Contract);
      setShowResult(true);
      setContractDetailsVisible(true);
    }
  }, [isGenerating, run]);

  if (!run && !error) {
    return (
      <div className="col-span-12 mx-auto w-full rounded-xl p-4 before:rounded-xl lg:fixed lg:right-5 lg:top-20 lg:col-span-6 lg:w-[32rem] xl:col-span-7">
        <motion.section
          className="border-border bg-widget relative flex w-full flex-col overflow-hidden rounded-xl border pb-4 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <>
              <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/20"
                variants={shimmerVariants}
                animate="animate"
              />
              <motion.div
                className="relative z-10 flex h-[300px] items-center justify-center px-6 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <motion.div
                      className="h-12 w-12 text-purple-600 dark:text-purple-400"
                      animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        rotate: {
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 3,
                          ease: 'linear',
                        },
                        scale: {
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1.5,
                          ease: 'easeInOut',
                        },
                      }}
                    >
                      <Sparkles className="h-full w-full" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 text-purple-400 dark:text-purple-300"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 0, 0.7],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                      }}
                    >
                      <Sparkles className="h-full w-full" />
                    </motion.div>
                  </div>

                  <p className="text-center text-lg font-medium text-purple-800 dark:text-purple-300">
                    Generando Con IA
                  </p>

                  <div className="flex gap-2">
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={index}
                        className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 0.6,
                          delay: index * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          </AnimatePresence>
        </motion.section>
      </div>
    );
  }

  if (isGenerating) {
    console.error('Error fetching run data:', error);
    return (
      <>
        <div className="col-span-12 mx-auto w-full rounded-xl p-4 before:rounded-xl lg:fixed lg:right-5 lg:top-20 lg:col-span-6 lg:w-[32rem] xl:col-span-7">
          <motion.div
            variants={cardVariants}
            animate={isGenerating ? 'generating' : 'completed'}
            initial="generating"
          >
            <Card className="relative overflow-hidden border-2">
              {/* Gradiente animado de fondo */}
              <motion.div className="gradient-border-mask absolute inset-0 rounded-lg border-2 backdrop-blur-[2px] before:pointer-events-none before:absolute before:-inset-[2px] before:rounded-lg before:p-[2px] before:[background:linear-gradient(var(--card-gradient-degrees),theme(colors.primary.DEFAULT/50%)_5%,theme(colors.border/80%)_30%)]" />

              <CardContent className="relative z-10 p-2">
                <motion.section
                  className="border-border bg-widget relative flex w-full flex-col overflow-hidden rounded-xl border pb-4 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      className="relative z-10 px-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ScrollArea className="h-[32rem]">
                        <motion.div
                          className="grid grid-cols-1 gap-4"
                          variants={textContainerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                            >
                              <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </motion.div>
                            <span className="text-sm font-medium text-red-700 dark:text-red-300">
                              Error al generar nuevo contenido
                            </span>
                            <motion.div
                              className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 1.5,
                              }}
                            />
                          </motion.div>
                          <motion.h3
                            className="mb-2 border-b border-gray-200 pb-2 text-2xl font-semibold"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          >
                            {contract?.fileName}
                          </motion.h3>

                          {contract?.title && (
                            <motion.div
                              className="flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Title</span>
                              <span className="text-base">{contract.title}</span>
                            </motion.div>
                          )}

                          {contract?.artists && (
                            <motion.div
                              className="flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Artists</span>
                              <span className="text-base">{contract.artists}</span>
                            </motion.div>
                          )}

                          {contract?.status && (
                            <motion.div
                              className="flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Status</span>
                              <span className="text-base">{contract.status}</span>
                            </motion.div>
                          )}

                          <motion.div
                            className="grid grid-cols-2 gap-4"
                            variants={contentVariants}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            {contract?.startDate && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">
                                  Start Date
                                </span>
                                <span className="text-base">
                                  {format(contract.startDate as Date, 'd MMM yyyy', { locale: es })}
                                </span>
                              </div>
                            )}

                            {contract?.endDate && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">End Date</span>
                                <span className="text-base">
                                  {format(contract.endDate as Date, 'd MMM yyyy', { locale: es })}
                                </span>
                              </div>
                            )}
                          </motion.div>

                          <motion.div
                            className="grid grid-cols-2 gap-4"
                            variants={contentVariants}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                          >
                            {contract?.isPossibleToExpand !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">
                                  Can Extend
                                </span>
                                <span className="text-base">{contract.isPossibleToExpand}</span>
                              </div>
                            )}

                            {contract?.possibleExtensionTime && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">
                                  Extension Time
                                </span>
                                <span className="text-base">{contract.possibleExtensionTime}</span>
                              </div>
                            )}
                          </motion.div>

                          {contract?.summary && (
                            <motion.div
                              className="mt-2 flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.2 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Summary</span>
                              <motion.p
                                className="mt-1 text-base"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 0.8 }}
                              >
                                {contract.summary}
                              </motion.p>
                            </motion.div>
                          )}
                        </motion.div>
                      </ScrollArea>
                    </motion.div>
                  </AnimatePresence>
                </motion.section>

                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Button
                        className="w-full"
                        onClick={handleRetry}
                        loading={isGenerating}
                        disabled={isGenerating}
                      >
                        Generar de nuevo
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  if (!run) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-900 p-8">
        <div className="text-gray-200">No run data available</div>
      </div>
    );
  }

  if (run.status !== 'COMPLETED') {
    return (
      <div className="col-span-12 mx-auto w-full rounded-xl p-4 before:rounded-xl lg:fixed lg:right-5 lg:top-20 lg:col-span-6 lg:w-[32rem] xl:col-span-7">
        <motion.section
          className="border-border bg-widget relative flex w-full flex-col overflow-hidden rounded-xl border pb-4 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <>
              <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/20"
                variants={shimmerVariants}
                animate="animate"
              />
              <motion.div
                className="relative z-10 flex h-[300px] items-center justify-center px-6 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <motion.div
                      className="h-12 w-12 text-purple-600 dark:text-purple-400"
                      animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        rotate: {
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 3,
                          ease: 'linear',
                        },
                        scale: {
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1.5,
                          ease: 'easeInOut',
                        },
                      }}
                    >
                      <Sparkles className="h-full w-full" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 text-purple-400 dark:text-purple-300"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 0, 0.7],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                      }}
                    >
                      <Sparkles className="h-full w-full" />
                    </motion.div>
                  </div>

                  <p className="text-center text-lg font-medium text-purple-800 dark:text-purple-300">
                    Generando Con IA
                  </p>

                  <div className="flex gap-2">
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={index}
                        className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 0.6,
                          delay: index * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          </AnimatePresence>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="col-span-12 mx-auto w-full rounded-xl p-4 before:rounded-xl lg:fixed lg:right-5 lg:top-20 lg:col-span-6 lg:w-[32rem] xl:col-span-7">
      <motion.div
        variants={cardVariants}
        animate={isGenerating ? 'generating' : 'completed'}
        initial="generating"
      >
        <Card className="relative overflow-hidden border-2">
          {/* Gradiente animado de fondo */}
          <motion.div className="gradient-border-mask absolute inset-0 rounded-lg border-2 backdrop-blur-[2px] before:pointer-events-none before:absolute before:-inset-[2px] before:rounded-lg before:p-[2px] before:[background:linear-gradient(var(--card-gradient-degrees),theme(colors.primary.DEFAULT/50%)_5%,theme(colors.border/80%)_30%)]" />

          {/* Efecto shimmer solo durante generación */}

          <CardContent className="p-2] relative z-10">
            <motion.section
              className="border-border bg-widget relative flex w-full flex-col overflow-hidden rounded-xl border pb-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <>
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20" />

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/20"
                      variants={shimmerVariants}
                      animate="animate"
                    />
                    <motion.div
                      className="relative z-10 flex h-[300px] items-center justify-center px-6 py-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <motion.div
                            className="h-12 w-12 text-purple-600 dark:text-purple-400"
                            animate={{
                              rotate: 360,
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              rotate: {
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 3,
                                ease: 'linear',
                              },
                              scale: {
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 1.5,
                                ease: 'easeInOut',
                              },
                            }}
                          >
                            <Sparkles className="h-full w-full" />
                          </motion.div>
                          <motion.div
                            className="absolute inset-0 text-purple-400 dark:text-purple-300"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.7, 0, 0.7],
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                            }}
                          >
                            <Sparkles className="h-full w-full" />
                          </motion.div>
                        </div>

                        <p className="text-center text-lg font-medium text-purple-800 dark:text-purple-300">
                          Generando Con IA
                        </p>

                        <div className="flex gap-2">
                          {[0, 1, 2].map((index) => (
                            <motion.div
                              key={index}
                              className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400"
                              animate={{ y: [0, -8, 0] }}
                              transition={{
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 0.6,
                                delay: index * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    className="relative z-10 px-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {contractDetailsVisible && (
                      <ScrollArea className="h-[32rem]">
                        <motion.div
                          className="grid grid-cols-1 gap-4"
                          variants={textContainerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.h3
                            className="mb-2 border-b border-gray-200 pb-2 text-2xl font-semibold"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          >
                            {contractDetails?.fileName}
                          </motion.h3>

                          {contractDetails?.title && (
                            <motion.div
                              className="flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Title</span>
                              <span className="text-base">{contractDetails.title}</span>
                            </motion.div>
                          )}

                          {contractDetails?.artists && (
                            <motion.div
                              className="flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Artists</span>
                              <span className="text-base">{contract.artists}</span>
                            </motion.div>
                          )}

                          {contractDetails?.status && (
                            <motion.div
                              className="flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Status</span>
                              <span className="text-base">{contractDetails.status}</span>
                            </motion.div>
                          )}

                          <motion.div
                            className="grid grid-cols-2 gap-4"
                            variants={contentVariants}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            {contractDetails?.startDate && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">
                                  Start Date
                                </span>
                                <span className="text-base">
                                  {format(contractDetails.startDate as Date, 'd MMM yyyy', {
                                    locale: es,
                                  })}
                                </span>
                              </div>
                            )}

                            {contractDetails?.endDate && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">End Date</span>
                                <span className="text-base">
                                  {format(contractDetails.endDate as Date, 'd MMM yyyy', {
                                    locale: es,
                                  })}
                                </span>
                              </div>
                            )}
                          </motion.div>

                          <motion.div
                            className="grid grid-cols-2 gap-4"
                            variants={contentVariants}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                          >
                            {contractDetails?.isPossibleToExpand !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">
                                  Can Extend
                                </span>
                                <span className="text-base">
                                  {contractDetails.isPossibleToExpand}
                                </span>
                              </div>
                            )}

                            {contractDetails?.possibleExtensionTime && (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">
                                  Extension Time
                                </span>
                                <span className="text-base">
                                  {contractDetails.possibleExtensionTime}
                                </span>
                              </div>
                            )}
                          </motion.div>

                          {contractDetails?.summary && (
                            <motion.div
                              className="mt-2 flex flex-col"
                              variants={contentVariants}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.2 }}
                            >
                              <span className="text-sm font-medium text-gray-500">Summary</span>
                              <motion.p
                                className="mt-1 text-base"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 0.8 }}
                              >
                                {contractDetails.summary}
                              </motion.p>
                            </motion.div>
                          )}
                        </motion.div>
                      </ScrollArea>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Button
                    className="w-full"
                    onClick={handleRetry}
                    loading={isGenerating}
                    disabled={isGenerating}
                    // className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 font-medium text-white transition-colors duration-300 hover:from-purple-600 hover:to-indigo-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700"
                    // whileHover={{ scale: 1.02 }}
                    // whileTap={{ scale: 0.98 }}
                    // transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    Generar de nuevo
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
