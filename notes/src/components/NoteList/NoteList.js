import React, {Component} from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import './NoteList.css'
import Note from '../Note/Note'
import Panel from '../Panel/Panel';
import axios from 'axios'


class NoteList extends Component {

    constructor(props) {
        super(props);
        this.DATA_FILE_NAME = "data"

        this.state = {
            api: props.api,
            id: "",
            text: "",
            notes: [],
            searchQuery: ""
        }
    }

    static createIntRandom(min, max) {
        return Math.floor((Math.random() * (max - min)) + min)
    }

    static randomRgb() {
        //rgb(0, 0, 0)
        const r = NoteList.createIntRandom(150, 255)
        const g = NoteList.createIntRandom(100, 255)
        const b = NoteList.createIntRandom(130, 255)
        const res = `rgb(${r}, ${g}, ${b})`
        console.log("rgb:", res)
        return res
    }

// ------ random int ------- //


    static noteContains(note, searchQuery) {
        if (searchQuery !== "") {
            return note.text.toLowerCase()
                .includes(searchQuery.toLowerCase())
        } else {
            return true;
        }
    }


    loadNote() {
        const api = this.state.api
        axios.get(api)
            .then(resp => {
                this.addNote(resp.data.id, resp.data.value)
            })
    }

    addNote(id, value) {
        const node = {
            key: id,
            id: id,
            text: value,
            colour: NoteList.randomRgb()
        }
        this.setState({
            searchQuery: "",
            notes: this.state.notes.concat([node])
        })

        this.saveList()
    }

    setNote(id, text) {
        this.setState({
            notes: this.state.notes.map((note) => {
                if (note.id === id) {
                    note.text = text
                }
                return note
            })
        }, () => this.saveList())
    }

    removeNote(id) {
        this.setState({
            notes: this.state.notes.filter(note => {
                console.log("index1:", id)
                return (note.id !== id)
            })
        }, () => this.saveList())
    }

    removeAllNotes() {
        this.setState({
            notes: []
        }, () => this.saveList())
    }

    saveList() {
        const json = JSON.stringify(this.state.notes)
        console.log("notes:", this.state.notes)
        localStorage.removeItem(this.DATA_FILE_NAME)
        localStorage.clear()
        localStorage.setItem(this.DATA_FILE_NAME, json)
    }

    loadList() {
        const json = localStorage.getItem(this.DATA_FILE_NAME)
        if (json) {
            let notes = JSON.parse(json);
            this.setState({
                notes: notes
            })
        }
    }

    componentDidMount() {
        this.loadList()
    }

    componentWillUnmount() {
        this.saveList()
    }

    render() {
        return (
            <div className="container">
                <Panel whenAddClicked={this.handleAddClick}
                       whenRemoveAllClicked={this.handleRemoveAllClick}
                       onSearchChange={this.handleSearchChange}/>
                <Container>
                    <Row> {
                        this.state.notes
                            .filter(note => NoteList.noteContains(note, this.state.searchQuery))
                            .map((note, i) => {
                                return (
                                    <Note index={i} key={note.key} id={note.id} text={note.text} colour={note.colour}
                                          onChangeText={this.handleNoteChangeText} onDelete={this.handleNoteDelete}/>
                                )
                            })
                    }
                    </Row>
                </Container>
            </div>
        )
    }


    handleNoteChangeText = (id, text) => {
        this.setNote(id, text)
    }

    handleNoteDelete = (id) => {
        this.removeNote(id)
    }

    handleSearchChange = (searchQuery) => {
        this.setState({
            searchQuery: searchQuery
        })
    }

    handleAddClick = () => {
        this.loadNote()
    }

    handleRemoveAllClick = () => {
        this.removeAllNotes()
    }
}


export default NoteList