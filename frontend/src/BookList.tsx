import { useState, useEffect } from 'react';
import { Book } from './types/Book';
import baseUrl from './baseUrl';
import 'bootstrap/dist/css/bootstrap.min.css';

function BookList() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(() => parseInt(sessionStorage.getItem('currentPage') || '1'));
    const [booksPerPage, setBooksPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Book; direction: 'asc' | 'desc' } | null>(null);
    const [category, setCategory] = useState<string>(() => sessionStorage.getItem('category') || '');
    const [selectedCategory, setSelectedCategory] = useState<string>(() => sessionStorage.getItem('category') || '');
    const [cart, setCart] = useState<{ [bookID: number]: { book: Book; quantity: number } }>(() => {
        const stored = sessionStorage.getItem('cart');
        return stored ? JSON.parse(stored) : {};
    });
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        sessionStorage.setItem('category', category);
        sessionStorage.setItem('currentPage', currentPage.toString());
    }, [category, currentPage]);

    useEffect(() => {
        sessionStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const url = category ? `${baseUrl}/book?category=${encodeURIComponent(category)}` : `${baseUrl}/book`;
                const response = await fetch(url);
                const data = await response.json();
                setBooks(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching books:", error);
                setLoading(false);
            }
        };
        fetchBooks();
    }, [category]);

    const applyCategoryFilter = () => {
        setCategory(selectedCategory);
        setCurrentPage(1);
    };

    const requestSort = (key: keyof Book) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const addToCart = (book: Book) => {
        setCart(prevCart => {
            const existing = prevCart[book.bookID];
            const updated = {
                ...prevCart,
                [book.bookID]: {
                    book,
                    quantity: existing ? existing.quantity + 1 : 1
                }
            };
            return updated;
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const sortedBooks = [...books];
    if (sortConfig !== null) {
        sortedBooks.sort((a, b) => {
            if (typeof a[sortConfig.key] === 'string' && typeof b[sortConfig.key] === 'string') {
                return sortConfig.direction === 'asc'
                    ? (a[sortConfig.key] as string).localeCompare(b[sortConfig.key] as string)
                    : (b[sortConfig.key] as string).localeCompare(a[sortConfig.key] as string);
            } else if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
                return sortConfig.direction === 'asc'
                    ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
                    : (b[sortConfig.key] as number) - (a[sortConfig.key] as number);
            }
            return 0;
        });
    }

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

    const cartTotalItems = Object.values(cart).reduce((total, entry) => total + entry.quantity, 0);
    const cartTotalPrice = Object.values(cart).reduce((total, entry) => total + entry.book.price * entry.quantity, 0);

    const handleContinueShopping = () => {
        const savedCategory = sessionStorage.getItem('category') || '';
        const savedPage = parseInt(sessionStorage.getItem('currentPage') || '1');
        setCategory(savedCategory);
        setCurrentPage(savedPage);
    };

    return (
        <div className="container mt-4">
            <div className="row mb-3">
                <div className="col-md-4 d-flex gap-2">
                    <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="Classic">Classic</option>
                        <option value="Biography">Biography</option>
                        <option value="Historical">Historical</option>
                        <option value="Self-Help">Self-Help</option>
                        <option value="Business">Business</option>
                        <option value="Thrillers">Thrillers</option>
                        <option value="Christian Books">Christian Books</option>
                        <option value="Action">Action</option>
                        <option value="Health">Health</option>
                    </select>
                    <button className="btn btn-primary" onClick={applyCategoryFilter}>
                        Apply Filter
                    </button>
                </div>
                <div className="col-md-4 offset-md-4 text-end">
                    <button className="btn btn-outline-primary position-relative">
                        🛒 Cart
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {cartTotalItems}
                        </span>
                    </button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('title')}>Title</th>
                                <th onClick={() => requestSort('author')}>Author</th>
                                <th onClick={() => requestSort('price')}>Price</th>
                                <th>Category</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBooks.map(book => (
                                <tr key={book.bookID}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>${book.price.toFixed(2)}</td>
                                    <td>{book.category}</td>
                                    <td>
                                        <button className="btn btn-sm btn-success" onClick={() => addToCart(book)}>Add to Cart</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <nav>
                        <ul className="pagination">
                            {[...Array(totalPages)].map((_, index) => (
                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="mt-4">
                        <h5>Cart Summary</h5>
                        <ul className="list-group">
                            {Object.values(cart).map(({ book, quantity }) => (
                                <li key={book.bookID} className="list-group-item d-flex justify-content-between align-items-center">
                                    {book.title} x {quantity}
                                    <span>${(book.price * quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2 fw-bold text-end">
                            Total: ${cartTotalPrice.toFixed(2)}
                        </div>
                        <div className="text-end mt-2">
                            <button className="btn btn-secondary" onClick={handleContinueShopping}>Continue Shopping</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3">
                    <div className="toast show align-items-center text-bg-success border-0" role="alert">
                        <div className="d-flex">
                            <div className="toast-body">Book added to cart!</div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookList;
