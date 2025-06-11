import type { Config, Result, Unicorn } from '@documenso/ui/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@documenso/ui/primitives/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@documenso/ui/primitives/tabs';

import { DynamicChart } from './dynamic-chart';
import { SkeletonCard } from './skeleton-card';

export const Results = ({
  results,
  columns,
  chartConfig,
}: {
  results: Result[];
  columns: string[];
  chartConfig: Config | null;
}) => {
  const formatColumnTitle = (title: string) => {
    return title
      .split('_')
      .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
      .join(' ');
  };

  const formatCellValue = (column: string, value: unknown) => {
    if (column.toLowerCase().includes('valuation')) {
      const parsedValue = parseFloat(value as string);
      if (isNaN(parsedValue)) {
        return '';
      }
      const formattedValue = parsedValue.toFixed(2);
      const trimmedValue = formattedValue.replace(/\.?0+$/, '');
      return `$${trimmedValue}B`;
    }
    if (column.toLowerCase().includes('rate')) {
      const parsedValue = parseFloat(value as string);
      if (isNaN(parsedValue)) {
        return '';
      }
      const percentage = (parsedValue * 100).toFixed(2);
      return `${percentage}%`;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  return (
    <div className="flex flex-grow flex-col">
      <Tabs defaultValue="table" className="flex w-full flex-grow flex-col">
        <TabsList className="flex h-fit flex-col">
          <TabsTrigger className="w-full" value="table">
            Table
          </TabsTrigger>
          <TabsTrigger
            className="w-full"
            value="charts"
            disabled={Object.keys(results[0] || {}).length <= 1 || results.length < 2}
          >
            Chart
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="flex flex-grow">
          <div className="relative w-full overflow-x-scroll sm:min-h-[10px]">
            <Table className="divide-border min-w-full divide-y">
              <TableHeader className="bg-secondary sticky top-0 shadow-sm">
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={index}
                      className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      {formatColumnTitle(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card divide-border divide-y">
                {results.map((company, index) => (
                  <TableRow key={index} className="hover:bg-muted">
                    {columns.map((column, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className="text-foreground whitespace-nowrap px-6 py-4 text-sm"
                      >
                        {formatCellValue(column, company[column as keyof Unicorn])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="charts" className="flex-grow overflow-auto">
          <div className="mt-4">
            {chartConfig && results.length > 0 ? (
              <DynamicChart chartData={results} chartConfig={chartConfig} />
            ) : (
              <SkeletonCard />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
