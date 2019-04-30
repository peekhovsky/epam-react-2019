import React, {Component} from 'react'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import './Panel.css'


class Panel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            whenAddClicked: props.whenAddClicked,
            whenRemoveAllClicked: props.whenRemoveAllClicked,
            onSearchChange: props.onSearchChange
        }
    }

    render() {
        return (
            <ButtonToolbar className="button-toolbar mb-3" aria-label="Toolbar with Button groups">
                <ButtonGroup className="mr-2" aria-label="First group">
                    <Button variant="success" onClick={this.props.whenAddClicked}>Add</Button>
                    <Button variant="danger" onClick={this.props.whenRemoveAllClicked}>Remove all</Button>
                </ButtonGroup>
                <InputGroup>
                    <FormControl
                        className="search-field"
                        type="text"
                        placeholder="Search (by text)"
                        aria-label="Search (by text)"
                        onChange={this.onSearchChangeHandle}
                    />
                </InputGroup>
            </ButtonToolbar>
        )
    }

    onSearchChangeHandle = (e) => {
        this.state.onSearchChange(e.target.value)
    }
}

export default Panel