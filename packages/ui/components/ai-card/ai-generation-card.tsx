import * as React from 'react';

import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { AnimatePresence, motion } from 'framer-motion';

import { type Contract } from '@documenso/prisma/client';

import { Card, CardContent } from '../../primitives/card';
import { ScrollArea } from '../../primitives/scroll-area';

export default function Component({
  contract,
  generating,
  handleRetry,
}: {
  contract: Contract;
  documentRootPath: string;
  generating: boolean;
  handleRetry: () => void;
}) {
  // Variants para las animaciones

  const cardVariants = {
    generating: {
      transition: { duration: 0.5 },
    },
    completed: {
      transition: { duration: 0.8 },
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

  return (
    <div className="col-span-12 mx-auto flex w-full rounded-xl before:rounded-xl lg:fixed lg:right-5 lg:top-20 lg:col-span-6 lg:w-[32rem] xl:col-span-7">
      <motion.div variants={cardVariants} initial="generating">
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
                            <span className="text-sm font-medium text-gray-500">Start Date</span>
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
                            <span className="text-sm font-medium text-gray-500">Can Extend</span>
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

            {/* <AnimatePresence>
              <motion.div
                className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button
                  className="w-full"
                  onClick={handleRetry}
                  loading={generating}
                  disabled={generating}
                  // className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 font-medium text-white transition-colors duration-300 hover:from-purple-600 hover:to-indigo-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700"
                  // whileHover={{ scale: 1.02 }}
                  // whileTap={{ scale: 0.98 }}
                  // transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  Generar de nuevo
                </Button>
              </motion.div>
            </AnimatePresence> */}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
