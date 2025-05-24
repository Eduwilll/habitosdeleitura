import { GOOGLE_BOOKS_API_KEY } from '../constants/config';

const BASE_URL = 'https://www.googleapis.com/books/v1';

export interface Book {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  thumbnail?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
}

interface SearchResponse {
  items: Book[];
  totalItems: number;
}

export async function searchBooks(
  query: string,
  page: number = 1,
  language: string = 'pt-BR'
): Promise<SearchResponse> {
  try {
    const startIndex = (page - 1) * 20;
    const response = await fetch(
      `${BASE_URL}/volumes?q=${encodeURIComponent(
        query
      )}&langRestrict=${language}&startIndex=${startIndex}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    return {
      items: data.items?.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        description: item.volumeInfo.description,
        thumbnail: item.volumeInfo.imageLinks?.thumbnail,
        publishedDate: item.volumeInfo.publishedDate,
        pageCount: item.volumeInfo.pageCount,
        categories: item.volumeInfo.categories,
        averageRating: item.volumeInfo.averageRating,
      })) || [],
      totalItems: data.totalItems || 0,
    };
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
}

export const getBookById = async (bookId: string): Promise<Book> => {
  try {
    const response = await fetch(
      `${BASE_URL}/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }

    const data = await response.json();
    
    return {
      id: data.id,
      title: data.volumeInfo.title,
      authors: data.volumeInfo.authors,
      description: data.volumeInfo.description,
      thumbnail: data.volumeInfo.imageLinks?.thumbnail,
      publishedDate: data.volumeInfo.publishedDate,
      pageCount: data.volumeInfo.pageCount,
      categories: data.volumeInfo.categories,
      averageRating: data.volumeInfo.averageRating,
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}; 