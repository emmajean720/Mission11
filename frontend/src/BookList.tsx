import { useState, useEffect } from 'react';
import { Book } from './types/Book';
import 'bootstrap/dist/css/bootstrap.min.css';

function BookList() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage, setBooksPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Book; direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch('https://localhost:5000/book');
                const data = await response.json();
                setBooks(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching books:", error);
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    // Sorting function
    const requestSort = (key: keyof Book) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Apply sorting
    const sortedBooks = [...books];
    if (sortConfig !== null) {
        sortedBooks.sort((a, b) => {
            // Handle different data types
            if (typeof a[sortConfig.key] === 'number') {
                return sortConfig.direction === 'asc' 
                    ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
                    : (b[sortConfig.key] as number) - (a[sortConfig.key] as number);
            } else {
                const aValue = String(a[sortConfig.key]);
                const bValue = String(b[sortConfig.key]);
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        });
    }

    // Pagination logic
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="text-center mt-5">Loading books...</div>;
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Bookstore</h1>
            
            {/* Items per page selector */}
            <div className="row mb-3">
                <div className="col-md-3">
                    <label htmlFor="itemsPerPage" className="form-label">Items per page:</label>
                    <select
                        id="itemsPerPage"
                        className="form-select"
                        value={booksPerPage}
                        onChange={(e) => {
                            setBooksPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            {/* Sorting controls */}
            <div className="mb-3">
                <span className="me-2">Sort by:</span>
                <button 
                    onClick={() => requestSort('title')} 
                    className="btn btn-outline-primary btn-sm me-2"
                >
                    Title {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                    onClick={() => requestSort('author')} 
                    className="btn btn-outline-primary btn-sm me-2"
                >
                    Author {sortConfig?.key === 'author' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                    onClick={() => requestSort('price')} 
                    className="btn btn-outline-primary btn-sm"
                >
                    Price {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
            </div>

            {/* Book cards */}
            <div className="row">
                {currentBooks.length > 0 ? (
                    currentBooks.map((b) => (
                        <div key={b.bookID || b.isbn} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h3 className="card-title">{b.title}</h3>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item"><strong>Author:</strong> {b.author}</li>
                                        <li className="list-group-item"><strong>Publisher:</strong> {b.publisher}</li>
                                        <li className="list-group-item"><strong>ISBN:</strong> {b.isbn}</li>
                                        <li className="list-group-item"><strong>Classification:</strong> {b.classification}</li>
                                        <li className="list-group-item"><strong>Category:</strong> {b.category}</li>
                                        <li className="list-group-item"><strong>Pages:</strong> {b.pageCount}</li>
                                        <li className="list-group-item"><strong>Price:</strong> ${b.price?.toFixed(2)}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-info">No books found</div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                                onClick={() => paginate(currentPage - 1)} 
                                className="page-link"
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                <button onClick={() => paginate(number)} className="page-link">
                                    {number}
                                </button>
                            </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                                onClick={() => paginate(currentPage + 1)} 
                                className="page-link"
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default BookList;