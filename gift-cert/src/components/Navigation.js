import React, {Component} from 'react';
import '../styles/Navigation.css'
import Navbar from "react-bootstrap/Navbar";
import "../styles/Navigation.css";
import NavLink from "react-bootstrap/NavLink";
import Cookies from "universal-cookie";
import Nav from "react-bootstrap/Nav";

import {cookies} from "./App";
import Authentication from "./Authentication";
import LocalizedStrings from 'react-localization';

const USER_API = "/api/v2/users";


let strings = new LocalizedStrings({
    en: {
        giftCertLabel: "Gift certificates",
        signInLabel: "Sign In",
        signUpLabel: "Sign Up",
        signOutLabel: "Sign Out"
    },
    ru: {
        giftCertLabel: "Подарочные сертификаты",
        signInLabel: "Войти",
        signUpLabel: "Регистрация",
        signOutLabel: "Выйти"
    }
});

function setLanguage(lang) {
    cookies.set("lang", lang);
    window.location.reload();
}

function getCurrentLanguage() {
    return cookies.get("lang");
}


class Navigation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogged: false,
            user: undefined
        };
        console.log(this.state.isLogged);
        cookies.addChangeListener(this.cookieChangeListener);
    }

    static setLanguage() {
        if (cookies.get("lang")) {
            strings.setLanguage(cookies.get("lang"));
        }
    };


    cookieChangeListener = () => {
        console.log();
        this.loadUserData();
    };

    loadUserData() {
        let url = this.props.domain + USER_API;
        let authHeader = "Bearer " + cookies.get("access_token");
        fetch(url, {
                method: "GET",
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            }
        ).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw response;
            }
        })
            .then(user => {
                this.setState({
                    isLogged: true,
                    user: user
                })
            })
            .catch((error) => {
                this.setState({
                    isLogged: false,
                    user: undefined
                })
            })
    }

    componentWillMount() {
        Navigation.setLanguage();
        this.loadUserData();
    }

    render() {
        let signNavLinks = "";
        let userComponent = "";
        let userType = Authentication.userType();

        if (Authentication.checkLogged()) {
            signNavLinks = (
                <Nav>
                    <Nav.Item className="sign-out-button">
                        <NavLink className="sign-out-button" href="/signout">
                            {strings.signOutLabel}
                        </NavLink>
                    </Nav.Item>
                </Nav>
            );

            if (this.state.user) {
                userComponent = (
                    <Nav>
                        <Nav.Item>
                            <Navbar.Text>
                                <div className="user-name">
                                    {this.state.user.firstName}
                                </div>
                            </Navbar.Text>
                        </Nav.Item>
                        <Nav.Item className="mr-2">
                            <Navbar.Text>
                                <div className="user-type-text">
                                    {userType}
                                </div>
                            </Navbar.Text>
                        </Nav.Item>
                    </Nav>
                );
            }
        } else {
            signNavLinks = (
                <Nav>
                    <NavLink href="/signin">
                        {strings.signInLabel}
                    </NavLink>
                    <NavLink href="/signup">
                        {strings.signUpLabel}
                    </NavLink>
                </Nav>
            )
        }

        return (
            <Navbar bg="dark" variant="dark" className="navbar">
                <Navbar.Brand href="/">
                    {strings.giftCertLabel}
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Item>
                        <NavLink active={getCurrentLanguage() === "ru"} onClick={() => setLanguage("ru")}>RU</NavLink>
                    </Nav.Item>
                    <Nav.Item>
                        <Navbar.Text>/</Navbar.Text>
                    </Nav.Item>
                    <Nav.Item>
                        <NavLink active={getCurrentLanguage() === "en"} onClick={() => setLanguage("en")}>EN</NavLink>
                    </Nav.Item>
                </Nav>
                {signNavLinks}
                {userComponent}
            </Navbar>
        )
    }


}

export default Navigation;