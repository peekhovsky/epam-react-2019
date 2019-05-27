import "babel-polyfill";
import React, {Component} from 'react';
import Button from "react-bootstrap/Button";

import {cookies} from "./App";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/es/FormControl";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ListGroup from "react-bootstrap/ListGroup";

import "../styles/Home.css";
import Card from "react-bootstrap/Card";
import Pagination from "react-bootstrap/Pagination";
import Authentication from "./Authentication";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import CardDeck from "react-bootstrap/CardDeck";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Spinner from "react-bootstrap/Spinner";
import {Redirect} from "react-router";
import Alert from "react-bootstrap/Alert";
import TextareaAutosize from 'react-autosize-textarea';
import Form from "react-bootstrap/Form";
import LocalizedStrings from 'react-localization';

const ITEMS_ON_PAGE_DEF = 10;
const GIFT_CERT_API = "/api/v2/certificates";
const ORDERS_API = "/api/v2/users/orders";
const USERS_API = "/api/v2/users";


let strings = new LocalizedStrings({
    en: {
        gift: "Gift",
        certificates: "Certificates",
        addNewButton: "Add new certificate",
        allCertButton: "All",
        mineCertButton: "Mine",
        balance: "Balance",
        searchButton: "Search",
        addCertMessage: "",
        removeCertMessage: "",
        buyButton: "Buy",
        editButton: "Edit",
        addButton: "Add",
        deleteButton: "Delete",
        saveButton: "Save",
        cancelButton: "Cancel",
        addTagButton: "Add",
        searchControl: "Certificate name + #(tag) + sort(field)"
    },
    ru: {
        gift: "Подарочные",
        certificates: "Сертификаты",
        addNewButton: "Добавить новый сертификат",
        allCertButton: "Все",
        mineCertButton: "Мои",
        balance: "Баланс",
        searchButton: "Поиск",
        addCertMessage: "",
        removeCertMessage: "",
        buyButton: "Купить",
        editButton: "Изменить",
        addButton: "Добавить",
        deleteButton: "Удалить",
        saveButton: "Сохранить",
        cancelButton: "Отмена",
        addTagButton: "Добавить",
        searchControl: "Имя + #(тэг) + sort(поле)",
    }
});

function setLanguage() {
    if (cookies.get("lang")) {
        strings.setLanguage(cookies.get("lang"));
    }
}


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "all",
            giftCerts: [],
            giftCertLoadingIds: [],
            orders: [],
            searchName: "",
            searchDesc: "",
            isLogged: false,
            isRedirect: false,
            editGiftCertId: undefined,
            message: undefined,
            messageType: undefined,
            user: undefined,
            editedDescription: "",
            editedName: "",
            editedPrice: undefined,
            editNewTag: "",
            searchField: "",
            isAddNewGiftCert: false,
            totalNumOfPages: 0,
            isPriceValid: false,
            priceErrorMessage: '',
            isNameValid: false,
            nameErrorMessage: '',
            isDescValid: false,
            descErrorMessage: '',
            isTagValid: false,
            tagErrorMessage: ''
        };

        this.authHeader = "";
        this.searchQuery = "";
        this.searchTags = [];
        this.sortFields = [];
        this.pageSize = parseInt(cookies.get("pageSize")) ? parseInt(cookies.get("pageSize")) : ITEMS_ON_PAGE_DEF;
        this.pageNum = parseInt(cookies.get("pageNum")) ? parseInt(cookies.get("pageNum")) : 0;
        this.pageNumOrders = 0;
    }

    async checkAuth() {
        if (!Authentication.checkToken()) {
            await Authentication.signInGuest().then(() => {
                    this.authHeader = `Bearer ${cookies.get("access_token")}`;
                }
            ).catch(e => {
                throw e;
            })
        }
        this.authHeader = `Bearer ${cookies.get("access_token")}`;
    }

    checkAuthError(error) {
        if (error.status === 401) {
            Authentication.signOut();
            this.checkAuth().then().catch(e => {
                console.log(e);
            })
        }
    }

    loadGiftCert() {
        this.setState({
            giftCerts: [],
            isLoading: true
        });

        let searchQuery = (this.searchQuery !== '') ? (`&partOfName=${this.searchQuery}`) : '';

        console.log(" " + this.searchTags.map(tagName => ("&tagName=" + tagName)));
        console.log(this.pageSize);
        let url = `${this.props.domain}${GIFT_CERT_API}`
            + `?pageNum=${this.pageNum.toString()}`
            + `&pageSize=${this.pageSize.toString()}`
            + this.sortFields.map(sortField => "&sortField=" + sortField)
            + this.searchTags.map(tagName => ("&tagName=" + tagName)).join("")
            + `&sortField=dateTimeOfModification-`
            + searchQuery.toString();

        console.log(`URL: ${url}`);

        fetch(url, {
            method: "GET",
            mode: "cors",
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        })
            .then(response => {
                if (response.ok) {
                    this.setTotalNumOfPages(response.headers.get('X-Total-Count'));
                    console.log(parseInt(response.headers.get('X-Total-Count')));
                    return response.json()
                } else {
                    throw response;
                }
            })
            .then(giftCerts => {
                console.log(giftCerts);
                this.setState({
                    giftCerts: giftCerts,
                    isLoading: false
                })
            })
            .catch((error) => {
                this.checkAuthError(error);
                if (error.status === 404) {
                    this.setTotalNumOfPages(0);
                    this.setState({
                        giftCerts: [],
                        isLoading: false
                    })
                }
                console.log(error);
            })
    }

    setTotalNumOfPages(totalNumOfPages) {
        if (this.pageNum > totalNumOfPages) {
            this.pageNum = totalNumOfPages;
            this.loadGiftCert();
        }
        this.setState({
            totalNumOfPages: totalNumOfPages
        });
    }

    setTotalNumOfPagesOrders(totalNumOfPages) {
        if (this.pageNumOrders > totalNumOfPages) {
            this.pageNumOrders = totalNumOfPages;
            this.loadOrders();
        }
        this.setState({
            totalNumOfPages: totalNumOfPages
        });
    }

    saveGiftCert() {
        let id = this.state.editGiftCertId;
        let url = `${this.props.domain}${GIFT_CERT_API}/${id}`;
        console.log(`URL: ${url}`);

        fetch(url, {
            method: "PUT",
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                name: this.state.editedName,
                description: this.state.editedDescription,
                price: this.state.editedPrice,
                tags: this.state.editedTags
            })
        })
            .then(response => {
                if (response.ok) {
                    this.stopEditing();
                    this.loadGiftCert();
                } else {
                    throw response;
                }
            })
            .catch((error) => {
                this.checkAuthError(error);
                console.log(error);
            });
    }

    createGiftCert() {
        let url = `${this.props.domain}${GIFT_CERT_API}`;
        console.log(`URL: ${url}`);

        fetch(url, {
            method: "POST",
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                name: this.state.editedName,
                description: this.state.editedDescription,
                price: this.state.editedPrice,
                tags: this.state.editedTags
            })
        })
            .then(response => {
                if (response.ok) {
                    this.stopAdding();
                    this.pageNum = 0;
                    this.loadGiftCert();
                    this.setState({
                        message: "Gift certificate has been created",
                        messageType: "success"
                    });
                } else {
                    throw response;
                }
            })
            .catch((error) => {
                this.checkAuthError(error);
                console.log(error);
            });
    }

    deleteGiftCert(id) {
        let url = `${this.props.domain}${GIFT_CERT_API}/${id}`;
        console.log(`URL: ${url}`);

        fetch(url, {
            method: "DELETE",
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        })
            .then(response => {
                if (response.ok) {
                    this.loadGiftCert();
                    this.state.message = "Gift certificate has been removed. ";
                    this.state.messageType = "info";
                } else {
                    throw response;
                }
            })
            .catch((error) => {
                this.checkAuthError(error);
                console.log(error);
            });
    }


    loadOrders() {
        this.setState({
            giftCerts: [],
            isLoading: true
        });
        let url = `${this.props.domain}${ORDERS_API}?pageNumOrders=${this.pageNum}&pageSize=${this.pageSize}`;
        console.log(`URL: ${url}`);

        fetch(url, {
            method: "GET",
            mode: "cors",
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        })
            .then(response => {
                if (response.ok) {
                    this.setTotalNumOfPagesOrders(response.headers.get('X-Total-Count'));
                    return response.json()
                } else {
                    throw response;
                }
            })
            .then(orders => {
                console.log(orders);
                this.setState({
                    orders: orders,
                    isLoading: false
                })
            })
            .catch((error) => {
                this.checkAuthError(error);
                console.log(error);
            })
    }

    loadUser() {
        Authentication.loadUser().then(user =>
            this.setState({
                user: user
            })
        ).catch()
    }

    buyGiftCert(id) {
        let url = `${this.props.domain}${USERS_API}/certificates`;
        console.log(`URL: ${url}`);

        fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                'Authorization': this.authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                id: id
            })
        })
            .then(response => {
                if (response.ok) {
                    this.setState({
                        message: "Gift certificate has been added to your certificates",
                        messageType: "success"
                    });
                    this.loadUser();
                } else {
                    throw response;
                }
            })
            .catch((error) => {
                console.log(error);
                if (error.status === 403) {
                    this.setState({
                        message: "Low balance",
                        messageType: "danger"
                    })
                } else {
                    this.checkAuthError(error);
                    console.log(error);
                    this.setState({
                        message: error.message,
                        messageType: "danger"
                    })
                }
            })
    }


    parseSearchQuery(searchField) {
        let searchQuery = "";
        let searchTags = [];
        let sortFields = [];
        let tagRegex = /^#[(][A-Za-z]+[)]$/;
        let sortFieldRegex = /^sort[(][A-Za-z]+[\-]?[)]$/;
        let words = searchField.split(" ");
        console.log(words);
        words.forEach(word => {
            if (word.match(tagRegex)) {
                searchTags.push(word.substring(2, word.length - 1));
            } else if (word.match(sortFieldRegex)) {
                sortFields.push(word.substring(5, word.length - 1));
            } else {
                searchQuery = searchQuery.concat(word + " ");
            }
        });
        this.searchQuery = searchQuery.substring(0, searchQuery.length - 1);
        this.searchTags = searchTags;
        this.sortFields = sortFields;
    }

    stopEditing() {
        this.setState({
            editGiftCertId: undefined,
            editedName: "",
            editedDescription: "",
            editedPrice: undefined,
            editedTags: undefined,
            isAddNewGiftCert: false
        })
    }

    stopAdding() {
        this.setState({
            isAddNewGiftCert: false
        });
        this.stopEditing();
    }

    validateForm() {
        this.validatePrice(this.state.editedPrice);
        this.validateName(this.state.editedName);
        return this.isFormValid();
    }

    isFormValid() {
        console.log(this.state.isPriceValid);
        console.log(this.state.isNameValid);
        return this.state.isPriceValid && this.state.isNameValid;
    }

    validatePrice(price) {
        let message = '';
        if (price < 0) {
            message = 'Price must be greater than 0';
        }
        let priceParts = price.toString().split('.');
        if (priceParts[1]) {
            if (priceParts[1].length > 2) {
                message = 'Price must have only 2 digits after point';
            }
        }
        if (!price.match(/^\d+(.\d{1,2})?$/)) {
            message = 'Invalid price';
        }
        this.setState({
            priceErrorMessage: message,
            isPriceValid: (message === '')
        });
        console.log(message.length);
        console.log("N: " + (message === ''));
    }

    validateName(name) {
        let message = '';

        if (name === '') {
            message = 'Name must not be empty';
        } else if (name.length > 30) {
            message = 'Name size must be lower that 30 chars.';
        }

        this.setState({
            nameErrorMessage: message,
            isNameValid: message === ''
        })
    }

    validateTag(tag) {
        let message = '';

        if (tag === '') {
            message = 'Tag must not be empty';
        } else if (tag.length > 30) {
            message = 'Tag size must be lower that 30 chars.';
        }
        console.log(message);

        this.setState({
            tagErrorMessage: message,
            isTagValid: message === ''
        })
    }

    componentWillMount() {
        setLanguage();
    }

    componentDidMount() {
        this.checkAuth().then(() => {
            this.loadGiftCert();
            if (Authentication.userType() !== "GUEST") {
                this.loadUser();
            }
        }).catch(e => {
            console.log(e);
        });
    }

    static dateToString(date) {
        return `${date.toLocaleString('en-us', {month: 'long'})} ${date.getDay()}, ${date.getFullYear()}`;
    }

    renderMineGiftCertCards() {
        return this.state.orders.map((order, key) => {
            let giftCert = order.giftCertificate;
            let date = new Date(giftCert.dateTimeOfCreation);
            return (
                <Card key={key} className="gift-cert-card mb-4">
                    <Card.Header>
                        <Row>
                            <Col>
                            </Col>
                            <Col>
                                <h5>{
                                    Home.dateToString(date)
                                }</h5>
                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body>
                        <Card.Title>S{giftCert.name}</Card.Title>
                        <Card.Subtitle>
                            {giftCert.tags.map((tag, key) =>
                                (
                                    <Badge key={key} variant="success"
                                           className="tag-badge">{tag.tagName}</Badge>
                                )
                            )}
                        </Card.Subtitle>
                        <Card.Text>
                            {giftCert.description}
                        </Card.Text>
                    </Card.Body>
                </Card>
            )
        });
    }


    renderEditCardAdmin(giftCert, key) {
        let date = new Date(giftCert.dateTimeOfCreation);
        return (
            <Card key={key} className="gift-cert-card mb-4">
                <Form noValidate onSubmit={this.handleEditFormSubmit}>
                    <Card.Header>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>$</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control isInvalid={this.state.priceErrorMessage !== ''}
                                                      value={this.state.editedPrice} type="number" min="0" step="0.01"
                                                      onChange={this.handleChangePrice}/>
                                    </InputGroup>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.priceErrorMessage}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                                <h6>{
                                    Home.dateToString(date)
                                }</h6>
                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body>
                        <Card.Title>
                            <Form.Group>
                                <InputGroup className="mb-3">
                                    <Form.Control isInvalid={this.state.nameErrorMessage !== ''}
                                                  type="text" value={this.state.editedName}
                                                  onChange={this.handleChangeName}/>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {this.state.nameErrorMessage}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Card.Title>
                        <Card.Subtitle>
                            <Row>
                                <Col>{
                                    this.state.editedTags.map((tag, key) =>
                                        (
                                            <React.Fragment key={key}>
                                            <span className="tag-edit-frag">
                                            <Badge variant="danger" className="tag-del-badge" href="/">
                                                <div className="button-x">x</div>
                                                <Button variant="danger" size="sm" className="tag-del-button"
                                                        onClick={() => this.handleDeleteTag(tag)}/>
                                            </Badge>
                                            <Badge variant="success" className="tag-badge">{tag.tagName}</Badge>
                                            </span>
                                            </React.Fragment>
                                        )
                                    )
                                }
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <InputGroup className="mb-3">
                                            <Form.Control isInvalid={this.state.tagErrorMessage !== ''} type="text"
                                                          className="add-tag-form-control" size="sm"
                                                          value={this.state.editNewTag}
                                                          onChange={this.handleChangeNewTag}/>
                                            <Button disabled={!this.state.isTagValid} className="add-tag-button"
                                                    size="sm" variant="info"
                                                    onClick={this.handleAddNewTag}>{strings.addTagButton}</Button>
                                        </InputGroup>
                                        <Form.Control.Feedback type="invalid">
                                            {this.state.tagErrorMessage}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Subtitle>
                        <Card.Text>
                            <Form.Group>
                                <InputGroup>
                                    <TextareaAutosize className="textarea" value={this.state.editedDescription}
                                                      onChange={this.handleChangeDescription}/>
                                </InputGroup>
                            </Form.Group>
                        </Card.Text>
                        <ButtonToolbar className="btn-toolbar" aria-label="Toolbar with button groups">
                            <ButtonGroup className="mr-2" aria-label="Admin group">
                                <Button variant="success" onClick={this.handleSave}>{strings.saveButton}</Button>
                            </ButtonGroup>
                            <ButtonGroup className="float-right" aria-label="User group">
                                <Button variant="secondary" onClick={this.handleCancel}>{strings.cancelButton}</Button>
                            </ButtonGroup>
                        </ButtonToolbar>
                    </Card.Body>
                </Form>
            </Card>
        )
    }

    renderAddCardAdmin(giftCert, key) {
        return (
            <Card key={key} className="gift-cert-card mb-4">
                <Form noValidate onSubmit={this.handleEditFormSubmit}>
                    <Card.Header>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>$</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control isInvalid={this.state.priceErrorMessage !== ''}
                                                      value={this.state.editedPrice} type="number" min="0" step="0.01"
                                                      onChange={this.handleChangePrice}/>
                                    </InputGroup>
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.priceErrorMessage}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body>
                        <Card.Title>
                            <Form.Group>
                                <InputGroup className="mb-3">
                                    <Form.Control isInvalid={this.state.nameErrorMessage !== ''}
                                                  type="text" value={this.state.editedName}
                                                  placeholder="Name"
                                                  onChange={this.handleChangeName}/>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {this.state.nameErrorMessage}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Card.Title>
                        <Card.Subtitle>
                            <Row>
                                <Col>{
                                    this.state.editedTags.map((tag, key) =>
                                        (
                                            <React.Fragment key={key}>
                                            <span className="tag-edit-frag">
                                            <Badge variant="danger" className="tag-del-badge" href="/">
                                                <div className="button-x">x</div>
                                                <Button variant="danger" size="sm" className="tag-del-button"
                                                        onClick={() => this.handleDeleteTag(tag)}/>
                                            </Badge>
                                            <Badge variant="success" className="tag-badge">{tag.tagName}</Badge>
                                            </span>
                                            </React.Fragment>
                                        )
                                    )
                                }
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <InputGroup className="mb-3">
                                            <Form.Control isInvalid={this.state.tagErrorMessage !== ''} type="text"
                                                          className="add-tag-form-control" size="sm"
                                                          value={this.state.editNewTag}
                                                          placeholder="Tag name"
                                                          onChange={this.handleChangeNewTag}/>
                                            <Button disabled={!this.state.isTagValid} className="add-tag-button"
                                                    size="sm" variant="info"
                                                    onClick={this.handleAddNewTag}>{strings.addTagButton}</Button>
                                        </InputGroup>
                                        <Form.Control.Feedback type="invalid">
                                            {this.state.tagErrorMessage}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Subtitle>
                        <Card.Text>
                            <Form.Group>
                                <InputGroup>
                                    <TextareaAutosize className="textarea"
                                                      placeholder="Description"
                                                      value={this.state.editedDescription}
                                                      onChange={this.handleChangeDescription}/>
                                </InputGroup>
                            </Form.Group>
                        </Card.Text>
                        <ButtonToolbar className="btn-toolbar" aria-label="Toolbar with button groups">
                            <ButtonGroup className="mr-2" aria-label="Admin group">
                                <Button variant="success" onClick={this.handleCreate}>{strings.addButton}</Button>
                            </ButtonGroup>
                            <ButtonGroup className="float-right" aria-label="User group">
                                <Button variant="secondary" onClick={this.handleCancel}>{strings.cancelButton}</Button>
                            </ButtonGroup>
                        </ButtonToolbar>
                    </Card.Body>
                </Form>
            </Card>
        )
    }

    renderCardAdmin(giftCert, key) {
        let date = new Date(giftCert.dateTimeOfCreation);
        return (
            <Card key={key} className="gift-cert-card mb-4">
                <Card.Header>
                    <Row>
                        <Col>
                            <h5 className="price">{"$"}{giftCert.price}</h5>
                        </Col>
                        <Col>
                            <h6>{
                                Home.dateToString(date)
                            }</h6>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body>
                    <Card.Title>{giftCert.name}</Card.Title>
                    <Card.Subtitle>{
                        giftCert.tags.map((tag, key) =>
                            (
                                <Badge key={key} variant="success"
                                       className="tag-badge">{tag.tagName}</Badge>
                            )
                        )
                    }
                    </Card.Subtitle>
                    <Card.Text>
                        {giftCert.description}
                    </Card.Text>
                    <ButtonToolbar className="btn-toolbar" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-2" aria-label="Admin group">
                            <Button variant="outline-primary" onClick={() => this.handleEdit(giftCert)}>{strings.editButton}</Button>
                            <Button variant="outline-danger"
                                    onClick={() => this.handleDelete(giftCert.id)}>{strings.deleteButton}</Button>
                        </ButtonGroup>
                        <ButtonGroup className="float-right" aria-label="User group">
                            <Button onClick={() => this.handleBuy(giftCert.id)}>{strings.buyButton}</Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                </Card.Body>
            </Card>
        )
    }

    renderAllGiftCertCardsAdmin() {
        let giftCerts = (this.state.isAddNewGiftCert === true) ?
            (this.renderAddCardAdmin()) : " ";

        return (
            <React.Fragment>
                {giftCerts}
                {this.state.giftCerts.map((giftCert, key) => {
                    if (giftCert.id === this.state.editGiftCertId) {
                        return this.renderEditCardAdmin(giftCert, key);
                    } else {
                        if (giftCert) {
                            return this.renderCardAdmin(giftCert, key);
                        }
                    }
                })}
            </React.Fragment>
        )
    }

    renderAllGiftCertCardsUser() {
        return this.state.giftCerts.map((giftCert, key) => {
            let date = new Date(giftCert.dateTimeOfCreation);
            return (<Card key={key} className="gift-cert-card mb-4">
                <Card.Header>
                    <Row>
                        <Col>
                            <h5 className="price">{"$"}{giftCert.price}</h5>
                        </Col>
                        <Col>
                            <h6>{
                                Home.dateToString(date)
                            }</h6>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body>
                    <Card.Title>{giftCert.name}</Card.Title>
                    <Card.Subtitle>
                        {giftCert.tags.map((tag, key) =>
                            (
                                <Badge key={key} variant="success"
                                       className="tag-badge">{tag.tagName}</Badge>
                            )
                        )}
                    </Card.Subtitle>
                    <Card.Text>
                        {giftCert.description}
                    </Card.Text>
                    <ButtonToolbar className="btn-toolbar" aria-label="Toolbar with button groups">
                        <ButtonGroup className="float-right" aria-label="User group">
                            <Button onClick={() => this.handleBuy(giftCert.id)}>{strings.buyButton}</Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                </Card.Body>
            </Card>)
        });
    }

    renderAllGiftCertCardsGuest() {
        return this.state.giftCerts.map((giftCert, key) => {
            let date = new Date(giftCert.dateTimeOfCreation);
            return (<Card key={key} className="gift-cert-card mb-4">
                <Card.Header>
                    <Row>
                        <Col>
                            <h5 className="price">{"$"}{giftCert.price}</h5>
                        </Col>
                        <Col>
                            <h6>{
                                Home.dateToString(date)
                            }</h6>
                        </Col>
                    </Row>
                </Card.Header>

                <Card.Body>
                    <Card.Title>{giftCert.name}</Card.Title>
                    <Card.Subtitle>
                        {giftCert.tags.map(tag =>
                            (
                                <Badge key={tag.id} variant="success"
                                       className="tag-badge">{tag.tagName}</Badge>
                            )
                        )}
                    </Card.Subtitle>
                    <Card.Text>
                        {giftCert.description}
                    </Card.Text>
                </Card.Body>
            </Card>)
        });
    }

    renderGiftCertCards() {
        let giftCertCards;

        if (this.state.isLoading) {
            giftCertCards = (
                <Card className="gift-cert-card mb-4">
                    <Card.Body className="spinner-card">
                        <Spinner className="spinner-gift-cert" animation="border" variant="primary"/>
                    </Card.Body>
                </Card>
            )
        } else {

            if (this.state.view === "mine") {
                giftCertCards = this.renderMineGiftCertCards();

            } else {
                console.log(Authentication.userType());
                switch (Authentication.userType()) {
                    case "ADMIN":
                        giftCertCards = this.renderAllGiftCertCardsAdmin();
                        break;

                    case "USER":
                        giftCertCards = this.renderAllGiftCertCardsUser();
                        break;

                    case "GUEST":
                        giftCertCards = this.renderAllGiftCertCardsGuest();
                        break;
                }
            }
        }
        return giftCertCards;
    }

    renderPagination() {
        let pagination = [];

        if (this.state.view === "all") {
            let pageNum = parseInt(this.pageNum);
            for (let i = (pageNum - 5); i <= (pageNum + 5); i++) {
                if (i >= 0 && i <= this.state.totalNumOfPages) {
                    pagination.push(
                        <Pagination.Item key={i} active={pageNum === i}
                                         onClick={() => this.handleChangePage(i)}>
                            {i + 1}
                        </Pagination.Item>
                    );
                }
            }

            let firstPageArrow = (pageNum > 0) ?
                (<Pagination.First onClick={() => this.handleChangePage(0)}/>) : "";

            let lastPageArrow = (pageNum < this.state.totalNumOfPages) ?
                (<Pagination.Last onClick={() => this.handleChangePage(this.state.totalNumOfPages)}/>) : "";

            return (
                <Pagination className="pagination">
                    {firstPageArrow}
                    {pagination}
                    {lastPageArrow}
                </Pagination>
            );

        } else if (this.state.view === "mine") {
            let pageNum = parseInt(this.pageNumOrders);
            for (let i = pageNum - 5; i <= pageNum + 5; i++) {
                if (i >= 0 && i <= this.state.totalNumOfPages) {
                    pagination.push(
                        <Pagination.Item key={i} active={pageNum === i}
                                         onClick={() => this.handleChangePageOrders(i)}>
                            {i + 1}
                        </Pagination.Item>
                    );
                }
            }

            let firstPageArrow = (pageNum > 0) ?
                (<Pagination.First onClick={() => this.handleChangePageOrders(0)}/>) : "";

            let lastPageArrow = (pageNum < this.state.totalNumOfPages) ?
                (<Pagination.Last onClick={() => this.handleChangePageOrders(this.state.totalNumOfPages)}/>) : "";

            return (
                <Pagination className="pagination">
                    {firstPageArrow}
                    {pagination}
                    {lastPageArrow}
                </Pagination>
            );
        }
    }


    render() {
        let balance = this.state.user ? (
            <Col>
                <h3><Badge variant="light">{strings.balance}</Badge> {this.state.user.balance}</h3>
            </Col>
        ) : "";

        let message = this.state.message ? (
            <Row>
                <Col>
                    <Alert variant={this.state.messageType}>
                        {this.state.message}
                    </Alert>
                </Col>
            </Row>
        ) : "";

        let redirect = this.state.isRedirect ? (<Redirect to="/signin"/>) : "";

        let certSelect = (Authentication.userType() !== "GUEST") ? (
            <ListGroup as="ul" className="">
                <ListGroup.Item as="li" active={this.state.view === "all"}
                                onClick={() => this.handleChangeView("all")}>
                    {strings.allCertButton}
                </ListGroup.Item>
                <ListGroup.Item as="li" active={this.state.view === "mine"}
                                onClick={() => this.handleChangeView("mine")}>
                    {strings.mineCertButton}
                </ListGroup.Item>
            </ListGroup>
        ) : "";

        let addGiftCertButton = (Authentication.userType() === "ADMIN") ?
            (<Button variant="primary" className="mt-2"
                     onClick={this.handleAddGiftCertificate}>{strings.addNewButton}</Button>
            ) : "";

        let allGiftCertBlock = (this.state.view === "all") ? (
            <React.Fragment>
                <InputGroup>
                    <FormControl placeholder={strings.searchControl}
                                 onChange={this.handleChangeSearchField}/>
                    <InputGroup.Append>
                        <Button variant="outline-secondary" onClick={this.handleSearch}>
                            {strings.searchButton}
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
                {addGiftCertButton}
            </React.Fragment>
        ) : "";
        return (
            <div>
                {redirect}
                <Container>
                    <Row>
                        <Col>
                            <h2>{strings.gift} <Badge variant="secondary">{strings.certificates}</Badge></h2>
                        </Col>
                        {balance}
                    </Row>
                    {message}
                    <Row className="row-cert-search">
                        <Col className="col-cert-types">
                            {certSelect}
                        </Col>
                        <Col>
                            {allGiftCertBlock}
                        </Col>
                    </Row>
                    <Row className="row-cards">
                        <Col>
                            <CardDeck>
                                {this.renderGiftCertCards()}
                            </CardDeck>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DropdownButton className="page-size-dropdown-button" title={this.pageSize} id={1}>
                                <Dropdown.Item onClick={() => this.handleChangePageSize(10)}>10</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleChangePageSize(25)}>25</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleChangePageSize(50)}>50</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.handleChangePageSize(100)}>100</Dropdown.Item>
                            </DropdownButton>
                        </Col>
                        <Col>
                            {this.renderPagination()}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }

    handleChangePage = (newPageNum) => {
        console.log("New page num: " + newPageNum);
        this.pageNum = newPageNum;
        cookies.set("pageNum", newPageNum);
        window.scrollTo(0, 0);
        this.loadGiftCert();
    };

    handleChangePageSize = (pageSize) => {
        this.pageSize = pageSize;
        cookies.set("pageSize", pageSize);
        window.scrollTo(0, 0);
        if (this.state.view === "mine") {
            this.loadOrders()
        } else {
            this.loadGiftCert();
        }
    };

    handleChangePageOrders = (newPageNum) => {
        this.pageNumOrders = newPageNum;
        cookies.set("pageNumOrders", newPageNum);
        window.scrollTo(0, 0);
        this.loadOrders();
    };

    handleChangeView = (view) => {
        this.setState({
            view: view
        });

        if (view === "all") {
            this.loadGiftCert();

        } else {
            this.loadOrders();
        }
    };

    handleBuy = (id) => {
        window.scrollTo(0, 0);
        this.buyGiftCert(id);
    };

    handleEdit = (giftCert) => {
        this.setState({
            isAddNewGiftCert: false,
            editGiftCertId: giftCert.id,
            editedName: giftCert.name,
            editedDescription: giftCert.description,
            editedPrice: giftCert.price,
            editedTags: giftCert.tags
        })
    };

    handleDelete = (id) => {
        this.deleteGiftCert(id);
    };

    handleSave = () => {
        if (this.validateForm()) {
            this.saveGiftCert();
        }
    };

    handleCancel = () => {
        this.stopEditing();
    };

    handleChangeName = (e) => {
        this.validateName(e.target.value);
        this.setState({
            editedName: e.target.value
        })
    };

    handleChangeDescription = (e) => {
        this.setState({
            editedDescription: e.target.value
        })
    };

    handleChangePrice = (e) => {
        this.validatePrice(e.target.value);
        this.setState({
            editedPrice: e.target.value
        });
    };

    handleDeleteTag = (deletedTag) => {
        this.setState({
            editedTags: this.state.editedTags.filter(tag => tag !== deletedTag)
        })
    };

    handleChangeNewTag = (e) => {
        this.validateTag(e.target.value);
        this.setState({
            editNewTag: e.target.value
        })
    };

    handleAddNewTag = () => {
        if (this.state.isTagValid) {
            console.log("AA");
            this.setState({
                editNewTag: "",
                editedTags: [...this.state.editedTags, {tagName: this.state.editNewTag}]
            })
        }
    };

    handleChangeSearchField = (e) => {
        this.setState({
            searchField: e.target.value
        });
        if (e.target.value === "") {
            this.handleSearch();
        }
    };

    handleSearch = () => {
        this.parseSearchQuery(this.state.searchField);
        this.pageNum = 0;
        this.loadGiftCert();
    };

    handleAddGiftCertificate = () => {
        this.stopEditing();
        this.setState({
            isAddNewGiftCert: true,
            editedName: "",
            editedDescription: "",
            editedPrice: 0,
            editedTags: []
        });

    };

    handleCreate = () => {
        if (this.validateForm()) {
            console.log("AAA");
            this.createGiftCert();
        }
    };

    handleEditFormSubmit = () => {

    }
}

export default Home;