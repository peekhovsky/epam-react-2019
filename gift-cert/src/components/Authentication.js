import base64 from "base-64";
import {cookies} from "./App";
import "babel-polyfill";

const DOMAIN = "http://localhost:8085";
const TOKEN_PATH = "/oauth/token";
const CLIENT_ID = "client-id";
const CLIENT_SECRET = "secret";
const USERS_API = "/api/v2/users";


class Authentication {
    static async signIn(login, password) {
        let authHeader = 'Basic ' + base64.encode(CLIENT_ID + ":" + CLIENT_SECRET);
        await fetch(DOMAIN + TOKEN_PATH, {
                method: "POST",
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                body: new URLSearchParams({
                    'username': login,
                    'password': password,
                    'grant_type': 'password',
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET
                }),
            }
        ).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw response;
            }
        })
            .then(data => {
                cookies.set('access_token', data.access_token);
                cookies.set('refresh_token', data.refresh_token);
            })
            .catch((error) => {
                console.log(error);
                throw "Auth failed. ";
            });
    }

    static async signInGuest() {
        let authHeader = 'Basic ' + base64.encode(CLIENT_ID + ":" + CLIENT_SECRET);
        await fetch(DOMAIN + TOKEN_PATH, {
                method: "POST",
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                body: new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET
                }),
            }
        ).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                throw response;
            }
        })
            .then(data => {
                cookies.set('access_token', data.access_token);
                console.log("DATA: ");
                console.log(data);
            })
            .catch((error) => {
                console.log(error);
                throw error;
            });
    }

    static signOut() {
        cookies.remove('access_token');
        cookies.remove('refresh_token');
    }

    static checkLogged() {
        return this.userType() === "USER" || this.userType() === "ADMIN";
    }

    static checkToken() {
        return ((cookies.get('access_token') !== undefined)
            && (cookies.get('access_token') !== ""));
    }

    static async loadUser() {
        let authHeader;
        let user = null;
        if (Authentication.checkToken()) {
            authHeader = `Bearer ${cookies.get("access_token")}`;
        } else {
            throw "Unauthorized. ";
        }
        await fetch(DOMAIN + USERS_API, {
                method: "GET",
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }
        )
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw response;
                }
            })
            .then(u => {
                user = u;
            })
            .catch((error) => {
                console.log(error);
                throw "Auth failed. ";
            });
        return user;
    }

    static userType() {
        try {
            if (this.checkToken()) {
                let jwt = cookies.get('access_token');
                let jwtData = jwt.split('.')[1];
                let decodedJwtJsonData = window.atob(jwtData);
                let decodedJwtData = JSON.parse(decodedJwtJsonData);

                let authorities = decodedJwtData.authorities;
                if (authorities !== undefined) {
                    if (authorities.includes("ROLE_ADMIN")) {
                        return "ADMIN";
                    } else if (authorities.includes("ROLE_USER")) {
                        return "USER";
                    } else {
                        return "GUEST";
                    }
                } else {
                    return "GUEST";
                }
            } else {
                return "GUEST";
            }
        } catch (e) {
            console.log(e);
            this.signOut();
        }
    }

    static async checkUniqueEmail(email) {
        let res = false;
        let authHeader;
        if (Authentication.checkToken()) {
            authHeader = `Bearer ${cookies.get("access_token")}`;
        } else {
            throw "Unauthorized";
        }

        await fetch(DOMAIN + USERS_API + `/email-check-unique/${email}`, {
                method: "GET",
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; ; charset=UTF-8'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then((user) => {
                console.log(user);
                res = (user.email === null);

            }).catch((error) => {
                console.log(error);
            });
        return res;
    }
}

export default Authentication;