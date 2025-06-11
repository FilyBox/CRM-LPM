'use client';

import React, { useEffect, useRef } from 'react';
import { useCallback, useState } from 'react';

import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { AnimatePresence, motion } from 'framer-motion';
import { useSpring } from 'framer-motion';
import { CalendarIcon, CalendarOff, CheckCircle2, User, Users, X } from 'lucide-react';

import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Progress as ProgressBar } from './progress';

interface ProjectStatusCardProps {
  title: string;
  fileName?: string;
  progress?: number;
  onNavigate?: () => void;
  status?: (string | undefined)[];
  startDate: Date | null | undefined;
  expandible?: string;
  extensionTime?: string;
  endDate?: Date;
  summary?: string;
  contributors: Array<{ name: string; image?: string }>;
  tasks?: Array<{ title: string; completed: boolean }>;
  githubStars: number;
  openIssues: number;
  link?: string;
  assets?: boolean;
  canvas?: boolean;
  cover?: boolean;
  audioWAV?: boolean;
  video?: boolean;
  banners?: boolean;
  pitch?: boolean;
  EPKUpdates?: boolean;
  WebSiteUpdates?: boolean;
  Biography?: boolean;
}

export function useExpandable(initialState = false) {
  const [isExpanded, setIsExpanded] = useState(initialState);
  const springConfig = { stiffness: 300, damping: 30 };
  const animatedHeight = useSpring(0, springConfig);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return { isExpanded, toggleExpand, animatedHeight };
}

export function ProjectStatusCard({
  title,
  progress,
  startDate,
  contributors,
  tasks,
  onNavigate,
  status,
  endDate,
  assets,
  canvas,
  cover,
  audioWAV,
  video,
  banners,
  pitch,
  EPKUpdates,
  WebSiteUpdates,
  Biography,
  expandible,
  summary,
  extensionTime,
  githubStars,
  link,
  fileName,
  openIssues,
}: ProjectStatusCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);
  console.log('WebSiteUpdates', WebSiteUpdates);
  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  return (
    <Card
      className="text-foreground w-full max-w-md cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={toggleExpand}
    >
      <CardHeader className="space-y-1">
        <div className="flex w-full items-start justify-between">
          <div className="space-y-2">
            <div className="flex gap-2">
              {status &&
                status.length > 0 &&
                status.map((status, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={
                      status === 'VIGENTE'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }
                  >
                    {status}
                  </Badge>
                ))}
            </div>

            {/* <Badge
              variant="secondary"
              className={
                progress === 100 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }
            >
              {progress === 100 ? 'Completed' : 'In Progress'}
            </Badge> */}
            <h3 className="text-2xl font-semibold">{title}</h3>
            {fileName && (
              <h4 className="text-accent-foreground text-lg font-semibold">{fileName}</h4>
            )}
          </div>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Github className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on GitHub</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {progress && (
            <div className="space-y-2">
              <div className="fileName flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} className="h-2" />
            </div>
          )}

          <motion.div
            style={{ height: animatedHeight }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="text-foreground flex items-center justify-between text-sm">
                      {expandible && (
                        <div className="flex flex-col items-start">
                          <span className="fileName">Expandible:</span>
                          <span>{expandible}</span>
                        </div>
                      )}

                      {extensionTime && (
                        <div className="flex flex-col items-start">
                          <span className="fileName">Tiempo de extensión:</span>
                          <span>{extensionTime}</span>
                        </div>
                      )}

                      {link && (
                        <a
                          href={link as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-foreground hover:underline"
                        >
                          {link}
                        </a>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="flex items-center text-sm font-medium">
                        <Users className="mr-2 h-4 w-4" />
                        Artistas
                      </h4>
                      <div className="flex flex-col gap-2">
                        {contributors.map((contributor, index) => (
                          <div key={index} className="flex items-center">
                            <User className="text-accent-foreground mr-2 h-4 w-4" />
                            <p>{contributor.name}</p>
                          </div>
                          // <TooltipProvider key={index}>
                          //   <Tooltip>
                          //     <TooltipTrigger asChild>
                          //       <Avatar className="border-2 border-white">
                          //         <AvatarImage src={contributor.image} alt={contributor.name} />
                          //         <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                          //       </Avatar>
                          //     </TooltipTrigger>
                          //     <TooltipContent>
                          //       <p>{contributor.name}</p>
                          //     </TooltipContent>
                          //   </Tooltip>
                          // </TooltipProvider>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables/Assets Section */}
                    {(assets ||
                      canvas ||
                      cover ||
                      audioWAV ||
                      video ||
                      banners ||
                      pitch ||
                      EPKUpdates ||
                      WebSiteUpdates ||
                      Biography) && (
                      <div className="space-y-2">
                        <h4 className="flex items-center text-sm font-medium">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Entregables
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {assets && (
                            <Badge
                              variant={assets === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {assets ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Assets
                            </Badge>
                          )}

                          {canvas && (
                            <Badge
                              variant={canvas === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {canvas ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Canva
                            </Badge>
                          )}

                          {cover && (
                            <Badge
                              variant={cover === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {cover ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Cover
                            </Badge>
                          )}

                          {audioWAV && (
                            <Badge
                              variant={audioWAV === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {audioWAV ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Audio WAV
                            </Badge>
                          )}

                          {video && (
                            <Badge
                              variant={video === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {video ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Video
                            </Badge>
                          )}

                          {banners && (
                            <Badge
                              variant={banners === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {banners ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Banners
                            </Badge>
                          )}
                          {pitch && (
                            <Badge
                              variant={pitch === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {pitch ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Pitch
                            </Badge>
                          )}
                          {EPKUpdates !== undefined && (
                            <Badge
                              variant={EPKUpdates === true ? 'default' : 'destructive'}
                              className={`flex items-center justify-center`}
                            >
                              {EPKUpdates ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}
                              EPK Updates
                            </Badge>
                          )}
                          {WebSiteUpdates !== undefined && (
                            <Badge
                              variant={WebSiteUpdates === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {WebSiteUpdates ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Web Site Updates
                            </Badge>
                          )}
                          {Biography !== undefined && (
                            <Badge
                              variant={Biography === true ? 'default' : 'destructive'}
                              className="flex items-center justify-center"
                            >
                              {Biography ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <X className="mr-1 h-3 w-3 text-red-500" />
                              )}{' '}
                              Biography
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {tasks && tasks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Tasks</h4>
                        {tasks?.map((task, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="fileName">{task.title}</span>
                            {task.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    )}
                    {summary && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Resumen</h4>
                        <p className="text-sm">{summary}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="text-foreground flex w-full flex-col-reverse items-center justify-between gap-2 text-sm">
          {onNavigate && (
            <div className="w-full space-y-2">
              <Button onClick={onNavigate} className="w-full">
                {/* <MessageSquare className="mr-2 h-4 w-4" /> */}
                View
              </Button>
            </div>
          )}
          <div className="flex w-full items-center justify-between">
            {startDate ? (
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{format(startDate, 'd MMM yyyy', { locale: es })}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Sin especificar</span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center">
                <CalendarOff className="mr-2 h-4 w-4" />
                <span>{format(endDate, 'd MMM yyyy', { locale: es })}</span>
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
