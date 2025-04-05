using BookstoreProject.API.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookstoreProject.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private BookDbContext _bookcontext;
        public BookController(BookDbContext temp) => _bookcontext = temp;

        [HttpGet]
        public IEnumerable<Book> Get([FromQuery] string? category)
        {
            var books = _bookcontext.Books.AsQueryable();
            if (!string.IsNullOrEmpty(category))
            {
                books = books.Where(b => b.Category == category);
            }
            return books.ToList();
        }

        [HttpPost]
        public IActionResult Post([FromBody] Book book)
        {
            _bookcontext.Books.Add(book);
            _bookcontext.SaveChanges();
            return CreatedAtAction(nameof(Get), new { id = book.BookID }, book);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Book updatedBook)
        {
            var existing = _bookcontext.Books.FirstOrDefault(b => b.BookID == id);
            if (existing == null) return NotFound();

            existing.Title = updatedBook.Title;
            existing.Author = updatedBook.Author;
            existing.Category = updatedBook.Category;
            existing.Price = updatedBook.Price;

            _bookcontext.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var book = _bookcontext.Books.FirstOrDefault(b => b.BookID == id);
            if (book == null) return NotFound();

            _bookcontext.Books.Remove(book);
            _bookcontext.SaveChanges();
            return NoContent();
        }
    }
}
