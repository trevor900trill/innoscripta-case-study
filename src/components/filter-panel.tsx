'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Search, Calendar as CalendarIcon, X as ClearIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface FilterPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  handleCategoryChange: (category: string) => void;
  selectedSources: string[];
  handleSourceChange: (source: string) => void;
  categories: string[];
  sources: string[];
  dateRange?: DateRange;
  setDateRange: (date: DateRange | undefined) => void;
  onResetFilters: () => void;
}

export function FilterPanel({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  handleCategoryChange,
  selectedSources,
  handleSourceChange,
  categories,
  sources,
  dateRange,
  setDateRange,
  onResetFilters,
}: FilterPanelProps) {
  const areFiltersActive =
    searchQuery !== '' ||
    selectedCategories.length > 0 ||
    selectedSources.length > 0 ||
    dateRange !== undefined;

  return (
    <div className="p-4 space-y-6 lg:p-6">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-muted-foreground left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search articles..."
            className="pl-10 bg-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search articles"
          />
        </div>
        {areFiltersActive && (
          <Button variant="ghost" size="sm" onClick={onResetFilters} className="w-full justify-start text-muted-foreground hover:text-foreground">
            <ClearIcon className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Date Range
        </h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Categories
        </h3>
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category} className="flex items-center space-x-3">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                  aria-label={`Filter by ${category}`}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="font-normal cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {category}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No categories available.</p>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Sources
        </h3>
        <div className="space-y-3">
          {sources.length > 0 ? (
            sources.map((source) => (
              <div key={source} className="flex items-center space-x-3">
                <Checkbox
                  id={`source-${source}`}
                  checked={selectedSources.includes(source)}
                  onCheckedChange={() => handleSourceChange(source)}
                  aria-label={`Filter by ${source}`}
                />
                <Label
                  htmlFor={`source-${source}`}
                  className="font-normal cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {source}
                </Label>
              </div>
            ))
          ) : (
             <p className="text-sm text-muted-foreground">No sources available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
