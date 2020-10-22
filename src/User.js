import React from 'react';
import axios from 'axios';
import Modal from './Modal';
import './User.css';

class User extends React.Component {

    constructor(props) {
        super(props);

        let url = require('./properties.json');
        this.state = {
            users: [],
            URL: url.REST_API_URL,
            update_name: '',
            update_email: '',
            update_role: '',
            show: false,
            isOpen: false,
            done: false
        }

        this.deleteUser = this.deleteUser.bind(this);
        this.addUser = this.addUser.bind(this);
        this.resetButtonClick = this.resetButtonClick.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.resetUpdateState = this.resetUpdateState.bind(this);
    }

    toggleModal() {
        console.log("toggleModal (isOpen): " + this.state.isOpen);
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    componentDidMount() {

        axios.get(this.state.URL + "/user/displayAll")
            .then(response => response.data)
            .then((data) => {
                this.setState({
                    users: data,
                    done: true
                });
            });
    }

    deleteUser(user) {
        console.log("Delete user: " + user.email + ", id: " + user.id);

        axios.delete(this.state.URL + "/user/delete/" + user.id)
            .then(response => {
                this.setState(previousState => {
                    return {
                        users: previousState.users.filter(u => u.id !== user.id)
                    };
                });
            })
            .catch(error => {
                console.log("delete error response: " + error);
            });
    }

    addUser(e) {
        e.preventDefault();

        const data = new FormData(e.target);
        var roleArray = data.get('role').split(',');

        if ((data.get('name').trim() === "") || (data.get('email').trim() === "") || data.get('role').trim() === "") {
            return;
        }

        var json = JSON.stringify({
            name: data.get('name'),
            email: data.get('email'),
            role: roleArray
        });

        axios.post(this.state.URL + "/user/add", json, {
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {

            //Get the old users
            var newUsers = this.state.users;

            //Add the new user created user to the old users
            newUsers.push(response.data);

            //Set the table of users
            this.setState({
                users: newUsers,
                show: false,
                isOpen: false,
                done: true
            });

        })
            .catch(function (error) {
                console.log("add error response: " + error);
            });

        //Reset the form
        document.getElementById("add-user-form").reset();
    }

    //Reset the form
    resetButtonClick() {
        document.getElementById("add-user-form").reset();
    }

    onChangeName = (e) => {
        this.setState({ update_name: e.target.value });
    }

    onChangeEmail = (e) => {
        this.setState({ update_email: e.target.value });
    }

    onChangeRole = (e) => {
        this.setState({ update_role: e.target.value });
    }

    resetUpdateState() {
        this.setState({
            update_name: '',
            update_email: '',
            update_role: ''
        });
    }

    updateUser(e, user) {

        //Default values
        var updateName = user.name;
        var updateEmail = user.email;
        var updateRoleArray = user.role;

        if (this.state.update_name !== '') {
            updateName = this.state.update_name;
        }

        if (this.state.update_email !== '') {
            updateEmail = this.state.update_email;
        }

        if (this.state.update_role !== '') {
            updateRoleArray = this.state.update_role.split(',');
        }

        if (user.name === updateName && user.email === updateEmail &&
            JSON.stringify(user.role) === JSON.stringify(updateRoleArray)) {
            this.resetUpdateState();
            return;
        }

        var json = JSON.stringify({
            id: user.id,
            name: updateName,
            email: updateEmail,
            role: updateRoleArray
        });

        axios.put(this.state.URL + "/user/update", json, {
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
                    Users Loading
                </div>
            )
        } else {

            return (
                <div>
                    <div className="add-user-form">
                        <button onClick={e => this.toggleModal()}
                            className="action-add-btn">Click to Add New User
                        </button>
                        <Modal show={this.state.isOpen} onClose={e => this.toggleModal()}>
                            <form id="add-user-form" onSubmit={this.addUser}>
                                <table id='addForm'>
                                    <tbody>
                                        <tr>
                                            <td>Name</td>
                                            <td><input id="name" name="name" type="text"></input></td>
                                        </tr>
                                        <tr>
                                            <td>Email</td>
                                            <td><input id="email" name="email" type="text"></input></td>
                                        </tr>
                                        <tr>
                                            <td>Role</td>
                                            <td><input id="role" name="role" type="text"></input></td>
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
                        Users: {this.state.users.length}
                        <table id='users'>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>
                                                <input defaultValue={user.name} onChange={this.onChangeName} />
                                            </td>
                                            <td>
                                                <input defaultValue={user.email} onChange={this.onChangeEmail} />
                                            </td>
                                            <td>
                                                <input defaultValue={user.role.toString()} onChange={this.onChangeRole} />
                                            </td>
                                            <td>
                                                <button type="submit" onClick={e => this.updateUser(e, user)}
                                                    className="action-update-btn">Update</button>

                                                <button type="submit" onClick={e => this.deleteUser(user)}
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

export default User;