import type { Article } from '@/lib/news-data';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out bg-card hover:shadow-xl hover:-translate-y-1">
        {article.imageUrl && (
          <div className="relative w-full aspect-video">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              data-ai-hint={article.imageHint || ''}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{article.source}</Badge>
            <Badge variant="outline">{article.category}</Badge>
            <span>
              {article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), {
                addSuffix: true,
              }) : 'Just now'}
            </span>
          </div>
          <CardTitle className="pt-2 text-base font-semibold leading-tight md:text-lg">
            {article.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
