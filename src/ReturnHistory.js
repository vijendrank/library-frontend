import React from "react";
import axios from 'axios';
import Modal from './Modal';
import './ReturnHistory.css';


class ReturnHistory extends React.Component {

    constructor(props) {
        super(props);
        let url = require('./properties.json');

        this.state = {
            return_history: [],
            URL: url.REST_API_URL,
            done: false
        }

    }

    componentDidMount() {

        axios.get(this.state.URL + "/returnHistory/displayAll")
            .then(response => response.data)
            .then((data) => {
                this.setState({
                    return_history: data,
                    done: true
                });
            });

    }


    render() {

        if (!this.state.done) {
            return (
                <div>
                    Return History is Loading
                </div>
            )
        } else {

            return (

                <div>

                    <div>
                        Reservation: {this.state.return_history.length}
                        <table id='books'>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Book</th>
                                    <th>User</th>
                                    <th>Return Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.return_history.map((returnHistory) => (
                                        <tr key={returnHistory.id}>
                                            <td>{returnHistory.id}</td>
                                <td>{returnHistory.book.name}</td>
                                <td>{returnHistory.user.name}</td>
                                                                <td>{returnHistory.returnDate}</td>
                                

                                

                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                </div>
                </div >
            )

        }
    }
}

export default ReturnHistory;