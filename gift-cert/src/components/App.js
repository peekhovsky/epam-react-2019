import React, {Component} from 'react';
import {Router, Link, Route} from "react-router-dom";
import '../styles/App.css'
import {createBrowserHistory} from 'history';

import Home from "./Home";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import "../styles/App.css";
import FormLabel from "react-bootstrap/FormLabel";
import Media from "react-bootstrap/Media";
import NavLink from "react-bootstrap/NavLink";
import Cookies from "universal-cookie";
import Navigation from "./Navigation";
import SignOut from "./SignOut";
import jwt_decode from 'jwt-decode';
import base64 from "base-64";

const browserHistory = createBrowserHistory();
const APP_NAME = "Gift certificates";
const HOME_LOCATION = "/";
const SIGN_IN_LOCATION = "/signin";
const SIGN_UP_LOCATION = "/signup";
const SIGN_OUT_LOCATION = "/signout";
const CLIENT_ID = "client-id";
const CLIENT_SECRET = "secret";

const cookies = new Cookies();


class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let signInComponent = (<SignIn domain="http://localhost:8085"
                                       clientId={CLIENT_ID}
                                       clientSecret={CLIENT_SECRET}/>);
        let signUpComponent = (<SignUp domain="http://localhost:8085"
                                       clientId={CLIENT_ID}
                                       clientSecret={CLIENT_SECRET}/>);
        let signOutComponent = (<SignOut domain="http://localhost:8085"
                                         redirectPath={"/signin"}/>);

        let homeComponent = (<Home domain="http://localhost:8085"/>);

        return (
            <div>
                <Navigation domain="http://localhost:8085"
                            appName={APP_NAME}/>
                <Router history={createBrowserHistory()} className="router">
                    <Route exact path={HOME_LOCATION} component={() => homeComponent}/>
                    <Route path={SIGN_IN_LOCATION} component={() => signInComponent}/>
                    <Route path={SIGN_UP_LOCATION} component={() => signUpComponent}/>
                    <Route path={SIGN_OUT_LOCATION} component={() => signOutComponent}/>
                </Router>
            </div>
        )
    }
}

export default App;
export {cookies};