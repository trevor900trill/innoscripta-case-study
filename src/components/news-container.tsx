'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Article } from '@/lib/news-data';
import { FilterPanel } from '@/components/filter-panel';
import { ArticleCard } from '@/components/article-card';
import {
  Sidebar,
  SidebarInset,
  SidebarContent,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NewsContainer({ allArticles }: { allArticles: Article[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const filteredArticles = useMemo(() => {
    let articles = allArticles
      .slice()
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

    if (searchQuery) {
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      articles = articles.filter((article) =>
        selectedCategories.includes(article.category)
      );
    }

    if (selectedSources.length > 0) {
      articles = articles.filter((article) =>
        selectedSources.includes(article.source)
      );
    }

    return articles;
  }, [allArticles, searchQuery, selectedCategories, selectedSources]);

  return (
    <>
      <Sidebar className="border-r bg-sidebar" collapsible="icon">
        <SidebarContent>
          <ScrollArea className="h-full">
            <FilterPanel
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategories={selectedCategories}
              handleCategoryChange={handleCategoryChange}
              selectedSources={selectedSources}
              handleSourceChange={handleSourceChange}
            />
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <ScrollArea className="h-full">
          <main className="p-4 md:p-6">
            {isClient && filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : isClient ? (
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
            ) : null}
          </main>
        </ScrollArea>
      </SidebarInset>
    </>
  );
}
