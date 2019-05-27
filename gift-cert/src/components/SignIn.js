import React, {Component} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Cookies from "universal-cookie";
import base64 from "base-64";
import {Redirect} from "react-router-dom";

import img from "../images/sign-pic.jpg";
import Alert from "react-bootstrap/Alert";
import "../styles/SignIn.css";

import {cookies} from "./App";
import Authentication from "./Authentication";


import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en: {
        signInLabel: "Sign In",
        emailLabel: "Email",
        passwordLabel: "Password",
        emailPlaceholder: "Enter email",
        passwordPlaceholder: "Enter password",
        signInButton: "Sign in",
        cancelButton: "Cancel",
        errorCredNotValid: "Username or password is not valid"
    },
    ru: {
        signInLabel: "Войти",
        emailLabel: "Почта",
        passwordLabel: "Пароль",
        emailPlaceholder: "Введите почту",
        passwordPlaceholder: "Введите пароль",
        signInButton: "Войти",
        cancelButton: "Отмена",
        errorCredNotValid: "Логин и/или пароль неправильный"
    }
});

function setLanguage() {
    if (cookies.get("lang")) {
        strings.setLanguage(cookies.get("lang"));
    }
}

class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formLogin: "",
            formPassword: "",
            isLogged: false,
            loginErrorText: "",
            passwordErrorText: "",
            isAuthFailed: false
        };


        this.domain = props.domain;
        this.clientId = props.clientId;
        this.clientSecret = props.clientSecret;
    }


    componentDidMount() {
        if (Authentication.checkLogged()) {
            this.setState({
                isLogged: true
            })
        }
    }


    componentWillMount() {
        setLanguage();
    }

    render() {
        if (Authentication.checkLogged()) {
            return (<Redirect to="/"/>)
        } else {
            let warning;
            if (this.state.isAuthFailed) {
                warning = (
                    <Alert variant="warning">
                        {strings.errorCredNotValid}
                    </Alert>
                )
            }
            return (
                <Container>
                    <Row id="sign-in-label">
                        <Col>
                            <h2>{strings.signInLabel}</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {warning}
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Group controlId="formLogin">
                                    <Form.Label>{strings.emailLabel}</Form.Label>
                                    <Form.Control type="text" placeholder={strings.emailPlaceholder}
                                                  onChange={this.handleLoginChange}
                                                  aria-describedby="inputGroupPrepend"/>
                                    <Form.Text className="text-danger">{this.state.loginErrorText}</Form.Text>

                                </Form.Group>

                                <Form.Group controlId="formPassword">
                                    <Form.Label>{strings.passwordLabel}</Form.Label>
                                    <Form.Control type="password" placeholder={strings.passwordPlaceholder}
                                                  onChange={this.handlePasswordChange}/>
                                    <Form.Text className="text-danger">{this.state.passwordErrorText}</Form.Text>
                                </Form.Group>
                                <Button variant="primary" type="submit" className="log-in-button">{strings.signInButton}</Button>
                                <Button variant="secondary" href="/" className="cancel-button">{strings.cancelButton}</Button>
                            </Form>
                        </Col>
                        <Col>
                            <Image src={img} fluid/>
                        </Col>
                    </Row>
                </Container>
            )
        }
    }

    handleLoginChange = (e) => {
        this.setState({
            formLogin: e.target.value
        })
    };

    handlePasswordChange = (e) => {
        this.setState({
            formPassword: e.target.value
        })
    };

    handleSubmit = (e) => {
        e.preventDefault();
        Authentication.signIn(this.state.formLogin, this.state.formPassword)
            .then(() => {
                this.setState({
                    isLogged: true
                })
            })
            .catch((e) => {
                this.setState({
                    isAuthFailed: true
                });
                console.log(e);
            })
    };
}

export default SignIn;