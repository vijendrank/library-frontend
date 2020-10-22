import React from "react";
import axios from 'axios';
import Modal from './Modal';
import './Reservation.css';


class Reservation extends React.Component {

    constructor(props) {
        super(props);
        let url = require('./properties.json');

        this.state = {
            reservations: [],
            books: [],
            users: [],
            selected_book_id: '',
            selected_user_id: '',
            URL: url.REST_API_URL,
            show: false,
            isOpen: false,
            done: false
        }

        this.onBookSelect = this.onBookSelect.bind(this);
        this.onUserSelect = this.onUserSelect.bind(this);
        this.addReservation = this.addReservation.bind(this);
        this.renewReservation = this.renewReservation.bind(this);
        this.returnBook = this.returnBook.bind(this);

    }

    toggleModal() {
        console.log("toggleModal (isOpen): " + this.state.isOpen);
        this.setState({
            isOpen: !this.state.isOpen
        });
    }


    componentDidMount() {

        axios.get(this.state.URL + "/reservation/displayAll")
            .then(response => response.data)
            .then((data) => {
                this.setState({
                    reservations: data,
                    done: true
                });
            });

        axios.get(this.state.URL + "/book/displayAll")
            .then(response => response.data)
            .then((data) => {
                this.setState({
                    books: data
                });
            });

        axios.get(this.state.URL + "/user/displayAll")
            .then(response => response.data)
            .then((data) => {
                this.setState({
                    users: data
                });
            });
    }

    addReservation(e) {
        e.preventDefault();

        const data = new FormData(e.target);

        var selected_book_name = data.get('book');
        var selected_user_name = data.get('user');

        var bookId = this.state.selected_book_id;
        var userId = this.state.selected_user_id;

        if ((selected_book_name !== null && selected_book_name !== '') && bookId === "") {
            var selectedBookIndex = e.target.book.options.selectedIndex;
            bookId = e.target.book.options[selectedBookIndex].getAttribute('data-key');
        }

        if ((selected_user_name !== null && selected_user_name !== '') && userId === "") {
            var selectedUserIndex = e.target.user.options.selectedIndex;
            userId = e.target.user.options[selectedUserIndex].getAttribute('data-key');
        }

        if ((bookId === "") || (userId === "")) {
            alert("Dropdown is empty!");
            //reset the selection id
            this.setState({
                selected_book_id: '',
                selected_user_id: ''
            });
            return;
        }

        var json = JSON.stringify({
            bookId: bookId,
            userId: userId
        });

        axios.post(this.state.URL + "/reservation/create", json, {
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {

            //Get the old reservations
            var newReservations = this.state.reservations;

            //Add the new reservation created to the old reservations
            newReservations.push(response.data);

            //Set the table of books
            this.setState({
                reservations: newReservations,
                selected_book_id: '',
                selected_user_id: '',
                show: false,
                isOpen: false,
                done: true
            });

        })
            .catch(function (error) {
                console.log("add error response: " + error);
            });

        //Reset the form
        document.getElementById("add-reservation-form").reset();
    }

    //Reset the form
    resetButtonClick() {
        //reset the selection id
        this.setState({
            selected_book_id: '',
            selected_user_id: ''
        });
        document.getElementById("add-reservation-form").reset();
    }

    onBookSelect(e) {
        var selectedIndex = e.target.options.selectedIndex;
        var selectedBookId = e.target.options[selectedIndex].getAttribute('data-key');

        this.setState({
            selected_book_id: selectedBookId
        });
    }

    onUserSelect(e) {
        var selectedIndex = e.target.options.selectedIndex;
        var selectedUserId = e.target.options[selectedIndex].getAttribute('data-key');

        this.setState({
            selected_user_id: selectedUserId
        });
    }

    renewReservation(e, reservation) {

        //Default values
        var renewId = reservation.id;
        var renewBook = reservation.book.name;
        var renewUser = reservation.user.name;

        var json = JSON.stringify({
            reservationId: renewId
        });

        axios.put(this.state.URL + "/reservation/renew", json, {
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {

            var oldReservations = this.state.reservations;
            let updatedReservation = response.data;
            const elementsIndex = oldReservations.findIndex(element => element.id == renewId);
            let newArray = [...this.state.reservations];
            newArray[elementsIndex] = {
                ...newArray[elementsIndex],
                reserveDate: updatedReservation.reserveDate,
                returnDate: updatedReservation.returnDate,
                reserveCount: updatedReservation.reserveCount
            }

            this.setState({
                reservations: newArray,
            });


            alert("Renew done");
        })
            .catch(function (error) {
                console.log("Renew error response: " + error);
            });
    }

    returnBook(e, reservation) {
        console.log("Delete reservation: " + reservation.id +
            ", book: " + reservation.book.name +
            ", user: " + reservation.user.name);

        axios.delete(this.state.URL + "/reservation/delete/" + reservation.id)
            .then(response => {
                this.setState(previousState => {
                    return {
                        reservations: previousState.reservations.filter(u => u.id !== reservation.id)
                    };
                });
            })
            .catch(error => {
                console.log("Return error response: " + error);
            });
    }

    render() {

        // 1. Get all books and designate as non-reserved.
        // 2. Get the reserved books from the reservation.
        // 3. Remove reserved books from non-reserved so
        //    the book dropdown does not show reserved books.
        // 4. The reason is, once a book has been reserved,
        //    it is no longer available for reservation.
        let nonReservedBooks = this.state.books;
        this.state.reservations.map((reservation) => {
            nonReservedBooks = nonReservedBooks.filter(b => b.id !== reservation.book.id);
        }
        );

        let optionBooks = nonReservedBooks.map((book) =>
            <option key={book.id} data-key={book.id}>{book.name}</option>
        );

        let users = this.state.users;
        let optionUsers = users.map((user) =>
            <option key={user.id} data-key={user.id}>{user.name}</option>
        );

        if (!this.state.done) {
            return (
                <div>
                    Reservations are Loading
                </div>
            )
        } else {

            return (

                <div>

                    <div className="add-reservation-form">
                        <button onClick={e => this.toggleModal()}
                            className="action-add-btn">Click to do Reservation
                        </button>
                        <Modal show={this.state.isOpen} onClose={e => this.toggleModal()}>
                            <form id="add-reservation-form" onSubmit={this.addReservation}>
                                <table id='addForm'>
                                    <tbody>
                                        <tr>
                                            <td>Book Name</td>
                                            <td>
                                                <select id="book" name="book" onChange={this.onBookSelect}>
                                                    {optionBooks}
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>User Name</td>
                                            <td>
                                                <select id="user" name="user" onChange={this.onUserSelect}>
                                                    {optionUsers}
                                                </select>
                                            </td>

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
                        Reservation: {this.state.reservations.length}
                        <table id='books'>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Book</th>
                                    <th>User</th>
                                    <th>Reserve Date</th>
                                    <th>Return Date</th>
                                    <th>Renew Count</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.reservations.map((reservation) => (
                                        <tr key={reservation.id}>
                                            <td>{reservation.id}</td>
                                            <td>{reservation.book.name}</td>
                                            <td>{reservation.user.name}</td>
                                            <td>{reservation.reserveDate}</td>
                                            <td>{reservation.returnDate}</td>
                                            <td>{reservation.reserveCount}</td>

                                            <td>
                                                <button type="submit"
                                                    className="action-update-btn" onClick={e => this.renewReservation(e, reservation)}>Renew</button>

                                                <button type="submit"
                                                    className="action-update-btn" onClick={e => this.returnBook(e, reservation)}>Return</button>
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

export default Reservation;