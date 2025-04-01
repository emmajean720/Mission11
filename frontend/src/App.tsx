import BookList from './BookList';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="bg-dark text-white p-4 mb-4">
                <div className="container">
                    <h1>Hilton's Bookstore</h1>
                    <p className="lead">An Amazon-like online bookstore</p>
                </div>
            </header>
            
            <main className="container">
                <BookList />
            </main>
            
            <footer className="bg-light p-4 mt-5">
                <div className="container text-center">
                    <p>© {new Date().getFullYear()} Hilton's Bookstore - Built with React & Bootstrap</p>
                </div>
            </footer>
        </div>
    );
}

export default App;