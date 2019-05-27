import React, {Component} from "react";
import Cookies from "universal-cookie";
import {Redirect} from "react-router-dom";
import Authentication from "./Authentication";
import {cookies} from "./App";


class SignOut extends Component {
    constructor(props) {
        super(props);
        this.redirectPath = this.props.redirectPath;
    }

    render() {
        Authentication.signOut();
        return <Redirect to={this.redirectPath}/>
    }
}

export default SignOut;