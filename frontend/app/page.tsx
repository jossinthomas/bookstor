import styles from './page.module.css';
import styles from './page.module.css';
'use client'; import styles from './page.module.css';
import Link from "next/link"; import { Button } from "@/components/ui/button"; import { Card, CardContent, CardTitle } from "@/components/ui/card"; import { BookOpen, Star, TrendingUp } from "lucide-react"; import { useEffect, useState, useContext } from 'react'; import { CartContext } from '../../context/CartContext';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBooks(data);
      } catch (error: any) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);


  if (loading) return <p>Loading books...</p>;
  if (error) return <p>Error loading books: {error.message}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Books</h1>
      {/* Books grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book: any) => (
          <Card key={book._id} className={`overflow-hidden ${styles.bookItem}`}>
            <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
              {/* Placeholder for image */}
              {/* You can add book.image here if your backend provides it */}
            </div>
            <CardContent className="p-4">
              <Link href={`/books/${book._id}`} className="hover:underline">
                <h3 className="font-bold text-lg mb-1">{book.title}</h3>
              </Link>
              <p className="text-gray-600 mb-2">{book.author}</p>
              <p className="font-medium mb-4">${book.price.toFixed(2)}</p>
              <Button onClick={() => addToCart(book)} className="w-full bg-gray-800 hover:bg-gray-700">
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
