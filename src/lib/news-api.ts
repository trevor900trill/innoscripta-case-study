'use server';

import type { Article } from './news-data';
import { apiConfig } from '@/lib/api.config';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

//if testers env is not set use local variables
const NEWS_API_KEY = process.env.NEWS_API_KEY || apiConfig.newsApiKey;
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || apiConfig.guardianApiKey;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || apiConfig.gNewsApiKey;

export interface NewsFilters {
    searchQuery?: string;
    dateRange?: DateRange;
    categories?: string[];
    sources?: string[];
}

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

async function getNewsFromNewsAPI(page: number, filters: NewsFilters): Promise<Article[]> {
    if (!NEWS_API_KEY) {
        throw new Error('NewsAPI key is not configured.');
    }
    
    let url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('apiKey', NEWS_API_KEY);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('language', 'en');

    // NewsAPI's 'everything' endpoint requires a query
    url.searchParams.set('q', filters.searchQuery || '"world news"');

    if (filters.dateRange?.from) {
        url.searchParams.set('from', formatDate(filters.dateRange.from));
    }
    if (filters.dateRange?.to) {
        url.searchParams.set('to', formatDate(filters.dateRange.to));
    }
    
    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!response.ok) {
        const errorBody = await response.json();
        console.error('NewsAPI Error:', errorBody);
        return []; // Return empty array on error to not fail the entire fetch
    }
    const data = await response.json();
    return data.articles.map((item: any, index: number): Article => {
        return {
            id: item.url + index + page,
            title: item.title,
            source: item.source.name,
            category: 'General', // NewsAPI /everything doesn't provide consistent categories
            publishedAt: item.publishedAt,
            url: item.url,
            imageUrl: item.urlToImage,
            imageHint: item.urlToImage ? (item.title.split(' ').slice(0, 2).join(' ') || 'news article') : null,
            description: item.description || 'No description available.',
        };
    }).filter((article: Article) => article.title !== '[Removed]' && article.imageUrl);
}

async function getNewsFromTheGuardian(page: number, filters: NewsFilters): Promise<Article[]> {
    if (!GUARDIAN_API_KEY) {
        throw new Error('The Guardian API key is not configured.');
    }
    let url = new URL('https://content.guardianapis.com/search');
    url.searchParams.set('api-key', GUARDIAN_API_KEY);
    url.searchParams.set('show-fields', 'thumbnail,trailText');
    url.searchParams.set('page', page.toString());
    url.searchParams.set('page-size', '20');

    if (filters.searchQuery) {
        url.searchParams.set('q', filters.searchQuery);
    }
     if (filters.dateRange?.from) {
        url.searchParams.set('from-date', formatDate(filters.dateRange.from));
    }
    if (filters.dateRange?.to) {
        url.searchParams.set('to-date', formatDate(filters.dateRange.to));
    }

    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('The Guardian API Error:', errorBody);
        return [];
    }
    const data = await response.json();
    return data.response.results.map((item: any): Article => {
        const categoryMap: { [key:string]: Article['category']} = {
            technology: 'Technology',
            business: 'Business',
            sport: 'Sports',
            politics: 'Politics',
            entertainment: 'Entertainment',
            world: 'World',
            science: 'Science',
        }
        const category = categoryMap[item.sectionId] || 'General';

        return {
            id: item.id,
            title: item.webTitle,
            source: 'The Guardian',
            category: category,
            publishedAt: item.webPublicationDate,
            url: item.webUrl,
            imageUrl: item.fields?.thumbnail,
            imageHint: item.fields?.thumbnail ? (item.webTitle.split(' ').slice(0, 2).join(' ') || 'news article') : null,
            description: item.fields?.trailText || 'No description available.',
        };
    }).filter((article: Article) => article.imageUrl);
}

async function getNewsFromGNews(page: number, filters: NewsFilters): Promise<Article[]> {
    if (!GNEWS_API_KEY) {
        throw new Error('GNews API key is not configured.');
    }
    let url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('apikey', GNEWS_API_KEY);
    url.searchParams.set('lang', 'en');
    url.searchParams.set('max', '10');
    url.searchParams.set('page', page.toString());
    url.searchParams.set('q', filters.searchQuery || 'world news');

     if (filters.dateRange?.from) {
        url.searchParams.set('from', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
        url.searchParams.set('to', filters.dateRange.to.toISOString());
    }

    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
     if (!response.ok) {
        const errorBody = await response.json();
        console.error('GNews API Error:', errorBody);
        return [];
    }
    const data = await response.json();
    return data.articles.map((item: any): Article => {
        return {
            id: item.url,
            title: item.title,
            source: item.source.name,
            category: 'General',
            publishedAt: item.publishedAt,
            url: item.url,
            imageUrl: item.image,
            imageHint: item.image ? (item.title.split(' ').slice(0, 2).join(' ') || 'news article') : null,
            description: item.description || 'No description available.',
        };
    }).filter((article: Article) => article.imageUrl);
}

export async function getNews(page: number = 1, filters: NewsFilters = {}): Promise<Article[]> {
    const apiFetchers = [
        () => getNewsFromNewsAPI(page, filters),
        () => getNewsFromTheGuardian(page, filters),
        () => getNewsFromGNews(page, filters),
    ];
    
    const errorMessages: string[] = [];
    let allArticles: Article[] = [];

    const results = await Promise.allSettled(apiFetchers.map(fetcher => fetcher()));

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles = allArticles.concat(result.value);
        } else {
            if (page === 1) {
                errorMessages.push(result.reason.message);
            }
        }
    });
    
    // Throw only if all sources fail on the first page load.
    if (page === 1 && errorMessages.length === apiFetchers.length) {
        throw new Error('Failed to fetch news from all sources');
    } else if (page === 1 && errorMessages.length > 0) {
        console.warn('Partially failed to fetch news');
    }

    // Filter by source and category before returning
    let filteredArticles = allArticles;
    if (filters.sources && filters.sources.length > 0) {
      filteredArticles = filteredArticles.filter(article => filters.sources?.includes(article.source));
    }
    if (filters.categories && filters.categories.length > 0) {
      filteredArticles = filteredArticles.filter(article => filters.categories?.includes(article.category));
    }

    // Sort articles by published date
    filteredArticles.sort((a, b) => {
        if (!a.publishedAt || !b.publishedAt) return 0;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return filteredArticles;
}
