// Updated BookController.cs to support category filtering
using BookstoreProject.API.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

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
    }
}