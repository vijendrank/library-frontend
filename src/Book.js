import React from "react";
import axios from 'axios';
import Modal from './Modal';
import './Book.css';



class Book extends React.Component {

    constructor(props) {
        super(props);
        let url = require('./properties.json');
        this.state = {
            books: [],
            URL: url.REST_API_URL,
            update_name: '',
            update_author: '',
            update_isbn: '',
            show: false,
            isOpen: false,
            done: false
        }

        this.deleteBook = this.deleteBook.bind(this);
        this.addBook = this.addBook.bind(this);
        this.resetButtonClick = this.resetButtonClick.bind(this);
        this.updateBook = this.updateBook.bind(this);
        this.resetUpdateState = this.resetUpdateState.bind(this);

    }

    toggleModal() {
        console.log("toggleModal (isOpen): " + this.state.isOpen);
        this.setState({
            isOpen: !this.state.isOpen
        });
    }


    componentDidMount() {

        axios.get(this.state.URL + "/book/displayAll")
            .then(response => response.data)
            .then((data) => {
                this.setState({
                    books: data,
                    done: true
                });
            });
    }

    deleteBook(book) {
        console.log("Delete book: " + book.name + ", id: " + book.id);

        axios.delete(this.state.URL + "/book/delete/" + book.id)
            .then(response => {
                this.setState(previousState => {
                    return {
                        books: previousState.books.filter(u => u.id !== book.id)
                    };
                });
            })
            .catch(error => {
                console.log("delete error response: " + error);
            });
    }

    addBook(e) {
        e.preventDefault();

        const data = new FormData(e.target);

        if ((data.get('name').trim() === "") || (data.get('author').trim() === "") || data.get('isbn').trim() === "") {
            return;
        }

        var json = JSON.stringify({
            name: data.get('name'),
            author: data.get('author'),
            isbn: data.get('isbn')
        });

        axios.post(this.state.URL + "/book/add", json, {
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {

            //Get the old books
            var newBooks = this.state.books;

            //Add the new book created book to the old books
            newBooks.push(response.data);

            //Set the table of books
            this.setState({
                books: newBooks,
                show: false,
                isOpen: false,
                done: true
            });

        })
            .catch(function (error) {
                console.log("add error response: " + error);
            });

        //Reset the form
        document.getElementById("add-book-form").reset();
    }

    //Reset the form
    resetButtonClick() {
        document.getElementById("add-book-form").reset();
    }

    onChangeName = (e) => {
        this.setState({ update_name: e.target.value });
    }

    onChangeAuthor = (e) => {
        this.setState({ update_author: e.target.value });
    }

    onChangeIsbn = (e) => {
        this.setState({ update_isbn: e.target.value });
    }

    resetUpdateState() {
        this.setState({
            update_name: '',
            update_author: '',
            update_isbn: ''
        });
    }

    updateBook(e, book) {

        //Default values
        var updateName = book.name;
        var updateAuthor = book.author;
        var updateIsbn = book.isbn;

        if (this.state.update_name !== '') {
            updateName = this.state.update_name;
        }

        if (this.state.update_author !== '') {
            updateAuthor = this.state.update_author;
        }

        if (this.state.update_isbn !== '') {
            updateIsbn = this.state.update_isbn;
        }

        if (book.name === updateName && book.author === updateAuthor &&
            book.isbn === updateIsbn) {
            this.resetUpdateState();
            return;
        }

        var json = JSON.stringify({
            id: book.id,
            name: updateName,
            author: updateAuthor,
            isbn: updateIsbn
        });

        axios.put(this.state.URL + "/book/update", json, {
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            alert("Update done!");
        })
            .catch(function (error) {
                console.log("update error response: " + error);
            });

        this.resetUpdateState();

    }

    render() {
        if (!this.state.done) {
            return (
                <div>
                    Books are Loading
                </div>
            )
        } else {

            return (

                <div>

                    <div className="add-book-form">
                        <button onClick={e => this.toggleModal()}
                            className="action-add-btn">Click to Add New Book
                        </button>
                        <Modal show={this.state.isOpen} onClose={e => this.toggleModal()}>
                            <form id="add-book-form" onSubmit={this.addBook}>
                                <table id='addForm'>
                                    <tbody>
                                        <tr>
                                            <td>Name</td>
                                            <td><input id="name" name="name" type="text"></input></td>
                                        </tr>
                                        <tr>
                                            <td>Author</td>
                                            <td><input id="author" name="author" type="text"></input></td>
                                        </tr>
                                        <tr>
                                            <td>Isbn</td>
                                            <td><input id="isbn" name="isbn" type="text"></input></td>
                                        </tr>
                                        <tr><td></td>
                                            <td>
                                                <button className="action-submit-btn">Submit
                                            </button>
                                                <button className="action-reset-btn"
                                                    onClick={e => this.resetButtonClick()}>Reset
                                            </button>
                                                <button className="action-close-btn"
                                                    onClick={e => this.toggleModal()}>Close
                                            </button>
                                            </td>
                                        </tr>
                                    </tbody>

                                </table>
                            </form>

                        </Modal>
                    </div>





                    <div>
                        Users: {this.state.books.length}
                        <table id='books'>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Author</th>
                                    <th>ISBN</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.books.map((book) => (
                                        <tr key={book.id}>
                                            <td>{book.id}</td>
                                            <td>
                                                <input defaultValue={book.name} onChange={this.onChangeName} />
                                            </td>
                                            <td>
                                                <input defaultValue={book.author} onChange={this.onChangeAuthor} />
                                            </td>
                                            <td>
                                                <input defaultValue={book.isbn} onChange={this.onChangeIsbn} />
                                            </td>
                                            <td>
                                                <button type="submit" onClick={e => this.updateBook(e, book)}
                                                    className="action-update-btn">Update</button>

                                                <button type="submit" onClick={e => this.deleteBook(book)}
                                                    className="action-delete-btn">Delete</button>
                                            </td>

                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )

        }
    }
}

export default Book;