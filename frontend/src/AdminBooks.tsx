import { useEffect, useState } from 'react';
import { Book } from './types/Book';
import baseUrl from './baseUrl';

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [formData, setFormData] = useState<Partial<Book>>({});
  const [editingBookID, setEditingBookID] = useState<number | null>(null);

  const fetchBooks = async () => {
    const res = await fetch(`${baseUrl}/book`);
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
    const method = editingBookID ? 'PUT' : 'POST';
    const url = editingBookID
      ? `${baseUrl}/book/${editingBookID}`
      : `${baseUrl}/book`;

    const { bookID, ...bookData } = formData;

    console.log("Submitting book:", bookData);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend response:', errorText);
        alert('Failed to save book.');
        return;
      }

      setFormData({});
      setEditingBookID(null);
      fetchBooks();
    } catch (err) {
      console.error('Error submitting book:', err);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${baseUrl}/book/${id}`, { method: 'DELETE' });

    if (res.ok) {
      setTimeout(fetchBooks, 200);
    } else {
      alert('Failed to delete book.');
    }
  };

  const handleEdit = (book: Book) => {
    setFormData(book);
    setEditingBookID(book.bookID);
  };

  return (
    <div className="container mt-4">
      <h2>Admin Book Management</h2>

      <div className="mb-3">
        <input className="form-control mb-2" name="title" placeholder="Title" value={formData.title || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="author" placeholder="Author" value={formData.author || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="category" placeholder="Category" value={formData.category || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="price" placeholder="Price" type="number" value={formData.price || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="isbn" placeholder="ISBN" value={formData.isbn || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="publisher" placeholder="Publisher" value={formData.publisher || ''} onChange={handleInputChange} />
        <input className="form-control mb-2" name="classification" placeholder="Classification" value={formData.classification || ''} onChange={handleInputChange} />
        <button className="btn btn-primary" onClick={handleSubmit}>
          {editingBookID ? 'Update' : 'Add'} Book
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
