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

        public IEnumerable<Book> Get()
        {
            var something = _bookcontext.Books.ToList();
            return something;

        }


    }
}
