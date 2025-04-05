import { useEffect, useState } from 'react';
import { Book } from './types/Book';

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [formData, setFormData] = useState<Partial<Book>>({});
  const [editingBookId, setEditingBookId] = useState<number | null>(null);

  const fetchBooks = async () => {
    const res = await fetch('https://localhost:5000/book');
    const data = await res.json();
    setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  };

  const handleSubmit = async () => {
    const method = editingBookId ? 'PUT' : 'POST';
    const url = editingBookId
      ? `https://localhost:5000/book/${editingBookId}`
      : 'https://localhost:5000/book';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({});
    setEditingBookId(null);
    fetchBooks();
  };

  const handleDelete = async (id: number) => {
    await fetch(`https://localhost:5000/book/${id}`, { method: 'DELETE' });
    fetchBooks();
  };

  const handleEdit = (book: Book) => {
    setFormData(book);
    setEditingBookId(book.bookID);
  };

  return (
    <div className="container mt-4">
      <h2>Admin Book Management</h2>

      <div className="mb-3">
        <input className="form-control mb-2" name="title" placeholder="Title" value={formData.title || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="author" placeholder="Author" value={formData.author || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="category" placeholder="Category" value={formData.category || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="price" placeholder="Price" type="number" value={formData.price || ''} onChange={handleInputChange} />
        <button className="btn btn-primary" onClick={handleSubmit}>
          {editingBookId ? 'Update' : 'Add'} Book
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.bookID}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>${book.price.toFixed(2)}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(book)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(book.bookID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminBooks;
