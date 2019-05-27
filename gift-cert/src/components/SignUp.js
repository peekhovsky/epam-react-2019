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
import "babel-polyfill";

import img from "../images/sign-pic.jpg";
import Alert from "react-bootstrap/Alert";
import "../styles/SignIn.css";

import {cookies} from "./App";
import Authentication from "./Authentication";

const USER_API = "/api/v2/users";

const EMAIL_REGEX = /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;


import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en: {
        signUpLabel: "Sign Up",
        loginLabel: "Email",
        passwordLabel: "Password",
        repeatPasswordLabel: "Repeat password",
        firstNameLabel: "First name",
        lastNameLabel: "Last name",
        signUpButton: "Sign Up",
        cancelButton: "Cancel",

        errorEmptyEmail: "Email is required",
        errorNotValidEmail: "Email is not valid",
        errorEmailExists: "Email exists",
        errorEmptyPassword: "Password is required",
        errorPasswordsDoNotMatch: "Passwords do not match",
        errorEmptyFirstName: "First name is required",
        errorEmptyLastName: "Last name is required"
    },
    ru: {
        signUpLabel: "Регистрация",
        loginLabel: "Почта",
        passwordLabel: "Пароль",
        repeatPasswordLabel: "Повторить пароль",
        firstNameLabel: "Имя",
        lastNameLabel: "Фамилия",
        signUpButton: "Регистрация",
        cancelButton: "Отмена",

        errorEmptyEmail: "Обязательное поле",
        errorNotValidEmail: "Неправильный формат",
        errorEmailExists: "Пользователь с такой почтой уже существует",
        errorEmptyPassword: "Обязательно",
        errorPasswordsDoNotMatch: "Пароли не совпадают",
        errorEmptyFirstName: "Обязательное поле",
        errorEmptyLastName: "Обязательное поле"
    }
});

function setLanguage() {
    if (cookies.get("lang")) {
        strings.setLanguage(cookies.get("lang"));
        console.log(cookies.get("lang"));
    }
}


class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formEmail: "",
            formPassword: "",
            formRepeatPassword: "",
            formFirstName: "",
            formLastName: "",
            isSignedUp: false,
            errorMessage: "",
            validated: false,
            isEmailValid: false,
            isPasswordValid: false,
            isRepeatPasswordValid: false,
            isFirstNameValid: false,
            isLastNameValid: false,
            emailErrorMessage: "",
            passwordErrorMessage: "",
            repeatPasswordErrorMessage: "",
            firstNameErrorMessage: "",
            lastNameErrorMessage: ""
        };

        this.domain = props.domain;
        this.clientId = props.clientId;
        this.clientSecret = props.clientSecret;
        this.authHeader = '';
    }

    async checkAuth() {
        if (!Authentication.checkToken()) {
            await Authentication.signInGuest().then().catch(e => {
                throw e;
            })
        }
        this.authHeader = `Bearer ${cookies.get("access_token")}`;
        console.log(this.authHeader);
    }

    signUp(email, password, firstName, lastName) {
        console.log(JSON.stringify({
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "newPassword": password
        }));
        fetch(this.domain + USER_API, {
                method: "POST",
                headers: {
                    'Authorization': this.authHeader,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; ; charset=UTF-8'
                },
                body: JSON.stringify({
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "newPassword": password
                })
            }
        ).then(response => {
            if (!response.ok) {
                throw response;
            }
        })
            .then(() =>
                this.setState({
                    isSignedUp: true
                })
            )
            .catch((error) => {
                this.handleError(error);
            })
    }

    handleError(error) {
        let errorMessage = "";
        switch (error.status) {
            case 400:
            case 401:
                errorMessage = "Data is not valid.";
                break;
            case 409:
                errorMessage = "This email already exists.";
                this.setState({
                    isEmailValid: false
                });
                break;
        }
        console.log(error.json());
        this.setState({
            errorMessage: errorMessage
        });
        console.log(error);
    }

    async validateForm() {
        await this.validateEmail(this.state.formEmail).then(() => {
            this.validatePassword(this.state.formPassword);
            this.validateRepeatPassword(this.state.formRepeatPassword);
            this.validateFirstName(this.state.formFirstName);
            this.validateLastName(this.state.formLastName);
            if (!this.checkIsFormValid()) {
                throw "Invalid form";
            }
        });
    }

    checkIsFormValid() {
        return this.state.isEmailValid
            && this.state.isPasswordValid
            && this.state.isRepeatPasswordValid
            && this.state.isFirstNameValid
            && this.state.isLastNameValid;
    }

    async validateEmail(email) {
        let message = "";

        if (email === '') {
            message = strings.errorEmptyEmail;

        } else if (!email.match(EMAIL_REGEX)) {
            message = strings.errorNotValidEmail;

        } else {
            await Authentication.checkUniqueEmail(email)
                .then(isUnique => {
                    if (!isUnique) {
                        message = strings.errorEmailExists;
                    }
                })
        }

        this.setState({
            emailErrorMessage: message,
            isEmailValid: message === ""
        });

        return message;
    }

    validatePassword(password) {
        let message = "";

        if (password === '') {
            message = strings.errorEmptyPassword;
        }
        this.setState({
            passwordErrorMessage: message,
            isRepeatPasswordValid: false,
            repeatPasswordErrorMessage: "",
            isPasswordValid: message === ""
        });
        return message;
    }

    validateRepeatPassword(password) {
        let message = "";

        if (password !== this.state.formPassword) {
            message = strings.errorPasswordsDoNotMatch;
        }
        this.setState({
            repeatPasswordErrorMessage: message,
            isRepeatPasswordValid: message === ""
        });
        return message;
    }

    validateFirstName(firstName) {
        let message = "";

        if (firstName === '') {
            message = strings.errorEmptyFirstName;
        }
        this.setState({
            firstNameErrorMessage: message,
            isFirstNameValid: message === ""
        });
        return message;
    }

    validateLastName(lastName) {
        let message = "";

        if (lastName === '') {
            message = strings.errorEmptyLastName;
        }
        this.setState({
            lastNameErrorMessage: message,
            isLastNameValid: message === ""
        });
        return message;
    }

    componentWillMount() {
        setLanguage();
    }

    componentDidMount() {
        this.checkAuth().then().catch(e => {
            console.log(e);
        });
    }

    render() {
        if (this.state.isSignedUp) {
            return (
                <Alert variant="success">
                    Your profile has been created. Use link above to sign in.
                </Alert>)

        } else {

            let warning;
            if (this.state.errorMessage) {
                warning = (
                    <Alert variant="warning">
                        {this.state.errorMessage}
                    </Alert>
                )
            }
            return (

                <Container>
                    {this.renderRedirectToSignIn()}
                    <Row id="sign-in-label">
                        <Col>
                            <h2>{strings.signUpLabel}</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {warning}
                            <Form noValidate onSubmit={this.handleSubmit}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>{strings.loginLabel}</Form.Label>
                                    <Form.Control isValid={this.state.isEmailValid}
                                                  isInvalid={this.state.emailErrorMessage !== ""}
                                                  type="email" placeholder={strings.loginLabel}
                                                  required onChange={this.handleEmailChange}/>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.emailErrorMessage}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>{strings.passwordLabel}</Form.Label>
                                    <Form.Control isValid={this.state.isPasswordValid}
                                                  isInvalid={this.state.passwordErrorMessage !== ""}
                                                  required type="password" placeholder={strings.passwordLabel}
                                                  onChange={this.handlePasswordChange}/>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.passwordErrorMessage}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="formRepeatPassword">
                                    <Form.Label>{strings.repeatPasswordLabel}</Form.Label>
                                    <Form.Control isValid={this.state.isRepeatPasswordValid}
                                                  isInvalid={this.state.repeatPasswordErrorMessage !== ""}
                                                  required type="password" placeholder={strings.repeatPasswordLabel}
                                                  onChange={this.handleRepeatPasswordChange}/>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.repeatPasswordErrorMessage}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="formFirstName">
                                    <Form.Label>{strings.firstNameLabel}</Form.Label>
                                    <Form.Control isValid={this.state.isFirstNameValid}
                                                  isInvalid={this.state.firstNameErrorMessage !== ""}
                                                  required type="text" placeholder={strings.firstNameLabel}
                                                  onChange={this.handleFirstNameChange}/>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.firstNameErrorMessage}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="formLastName">
                                    <Form.Label>{strings.lastNameLabel}</Form.Label>
                                    <Form.Control isValid={this.state.isLastNameValid}
                                                  isInvalid={this.state.lastNameErrorMessage !== ""}
                                                  required type="text" placeholder={strings.lastNameLabel}
                                                  onChange={this.handleLastNameChange}/>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.lastNameErrorMessage}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button variant="primary" type="submit" className="log-in-button">{strings.signUpButton}</Button>
                                <Button variant="secondary" href="/home" className="cancel-button">{strings.cancelButton}</Button>
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

    renderRedirectToSignIn() {
        if (this.state.isSignedUp) {
            return (<Redirect to={"/home"}/>);
        }
    }

    handleEmailChange = (e) => {
        this.setState({
            formEmail: e.target.value
        });
        this.validateEmail(e.target.value).then();
    };

    handlePasswordChange = (e) => {
        this.setState({
            formPassword: e.target.value
        });
        this.validatePassword(e.target.value);
    };

    handleRepeatPasswordChange = (e) => {
        this.setState({
            formRepeatPassword: e.target.value
        });
        this.validateRepeatPassword(e.target.value);
    };

    handleFirstNameChange = (e) => {
        this.setState({
            formFirstName: e.target.value
        });
        this.validateFirstName(e.target.value);
    };

    handleLastNameChange = (e) => {
        this.setState({
            formLastName: e.target.value
        });
        this.validateLastName(e.target.value);
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.validateForm().then(() => {
            this.signUp(this.state.formEmail, this.state.formPassword,
                this.state.formFirstName, this.state.formLastName);
        });
    };

}

export default SignUp;