'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import type { Article } from '@/lib/news-data';
import { FilterPanel } from '@/components/filter-panel';
import { ArticleCard } from '@/components/article-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, Newspaper, Loader, AlertCircle } from 'lucide-react';
import { getNews, type NewsFilters } from '@/lib/news-api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { DateRange } from 'react-day-picker';
import { useDebounce } from '@/hooks/use-debounce';

export default function Home() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filters: NewsFilters = useMemo(() => ({
    searchQuery: debouncedSearchQuery,
    dateRange,
    categories: selectedCategories,
    sources: selectedSources,
  }), [debouncedSearchQuery, dateRange, selectedCategories, selectedSources]);

  const fetchNews = useCallback(async (pageNum: number, append: boolean, currentFilters: NewsFilters) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setAllArticles([]); // Clear articles when filters change
      setError(null);
    }

    try {
      const news = await getNews(pageNum, currentFilters);
      if (append) {
        setAllArticles((prev) => [...prev, ...news]);
      } else {
        setAllArticles(news);
      }
    } catch (error: any) {
      console.error('Failed to fetch news:', error);
      const errorMessage = error.message || 'There was a problem fetching news articles.';
      setError(errorMessage);
      if (!append) {
        toast({
          variant: 'destructive',
          title: 'Failed to Fetch News',
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast]);

  // Effect to fetch news when filters change
  useEffect(() => {
    setPage(1); // Reset page to 1 when filters change
    fetchNews(1, false, filters);
  }, [filters, fetchNews]);


  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage, true, filters);
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSourceChange = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSources([]);
    setDateRange(undefined);
  };

  const uniqueCategories = useMemo(() => {
    return ['Technology', 'Business', 'Sports', 'Politics', 'Entertainment', 'World', 'Science', 'General'];
  }, []);

  const uniqueSources = useMemo(() => {
    return ['BBC News', 'The Verge', 'TechCrunch', 'ESPN', 'Reuters', 'Associated Press', 'The Guardian'];
  }, []);
  
  const filterPanel = (
    <FilterPanel
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedCategories={selectedCategories}
      handleCategoryChange={handleCategoryChange}
      selectedSources={selectedSources}
      handleSourceChange={handleSourceChange}
      categories={uniqueCategories}
      sources={uniqueSources}
      dateRange={dateRange}
      setDateRange={setDateRange}
      onResetFilters={handleResetFilters}
    />
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-xl font-semibold text-foreground">
              Fetching latest news...
            </p>
          </div>
        </div>
      );
    }

    if (error && allArticles.length === 0) {
       return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)] p-4">
            <Alert variant="destructive" className="max-w-lg">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Error Fetching News</AlertTitle>
                <AlertDescription>
                   <p className="mb-2">{error}</p>
                </AlertDescription>
            </Alert>
        </div>
      );
    }

    if (allArticles.length > 0) {
        return (
             <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {allArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
              </div>
              <div className="flex justify-center mt-8">
                <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            </>
        )
    }

    return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
            <div className="text-center">
                <p className="text-xl font-semibold text-foreground">
                No Articles Found
                </p>
                <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filters.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header>
        <div className="md:hidden">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft className="w-6 h-6" />
                <span className="sr-only">Toggle Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
               <SheetHeader className="p-6 pb-0">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your news feed by searching, and selecting categories or sources.
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-full">
                <div className="p-6 pt-4">
                  {filterPanel}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </Header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 border-r md:block bg-card">
           <ScrollArea className="h-full">
            {filterPanel}
          </ScrollArea>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
