import React, {Component} from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import TextareaAutosize from 'react-autosize-textarea';
import './Note.css'


class Note extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            index: props.index,
            text: props.text,
            editedText: "",
            isEdit: false,
            colour: props.colour,
            onChangeText: props.onChangeText,
            onDelete: props.onDelete
        }
    }

    render() {
        if (this.state.isEdit) {
            return (
                <form onSubmit={this.handleSaveButton}>
                    <Card style={{width: '22rem'}} className="card">
                        <Card.Body className="card-body" style={{backgroundColor: this.state.colour}}>
                            <Card.Text>
                                <InputGroup>
                                    <TextareaAutosize className="textarea" value={this.state.editedText}
                                                      onChange={this.handleChangeTextarea}/>
                                </InputGroup>
                            </Card.Text>
                        </Card.Body>
                        <Row className="button-row">
                            <Col>
                                <Button type="submit" variant="success">Save</Button>
                            </Col>
                            <Col>
                                <Button variant="primary" onClick={this.handleDeclineButton}>Decline</Button>
                            </Col>
                        </Row>
                    </Card>
                </form>)

        } else {
            console.log("colour: ", this.colour)
            return (<Card style={{width: '22rem'}} className="card">
                <Card.Body className="card-body" style={{backgroundColor: this.state.colour}}>
                    <Card.Text>
                        {this.state.text}
                    </Card.Text>
                </Card.Body>

                <Row className="button-row">
                    <Col>
                        <Button variant="warning" onClick={this.handleEditButton}>Edit</Button>
                    </Col>
                    <Col>
                        <Button variant="danger" onClick={this.handleDeleteButton}>Delete</Button>
                    </Col>
                </Row>
            </Card>)

        }
    }

    handleEditButton = () => {
        this.setState({
            isEdit: true,
            editedText: this.state.text
        })
    }

    handleDeclineButton = () => {
        this.setState({
            isEdit: false,
            editedText: ""
        })
    }

    handleChangeTextarea = (e) => {
        this.setState({
            editedText: e.target.value
        })
    }

    handleSaveButton = () => {
        this.state.onChangeText(this.state.id, this.state.editedText)
    }

    handleDeleteButton = () => {
        this.state.onDelete(this.state.id)
    }
}

export default Note