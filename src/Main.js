import React from "react";
import {Route,NavLink,HashRouter} from "react-router-dom";
import Home from "./Home";
import User from "./User";
import Book from "./Book";
import Reservation from "./Reservation";
import ReturnHistory from "./ReturnHistory";

class Main extends React.Component {
    render() {
      return (
        <HashRouter>
          <div>
            <h1>Open Library System</h1>
            <ul className="header">
              <li><NavLink exact to="/">Home</NavLink></li>
              <li><NavLink to="/user">User</NavLink></li>
              <li><NavLink to="/book">Book</NavLink></li>
              <li><NavLink to="/reservation">Reservation</NavLink></li>
              <li><NavLink to="/returnHistory">Return History</NavLink></li>
            </ul>
            <div className="content">
              <Route exact path="/" component={Home}/>
              <Route path="/user" component={User}/>
              <Route path="/book" component={Book}/>
              <Route path="/reservation" component={Reservation}/>
              <Route path="/returnHistory" component={ReturnHistory}/>
            </div>
          </div>
        </HashRouter>
      );
    }
  }

export default Main;