import React, {Component} from 'react'
import NoteList from '../NoteList/NoteList'
import './App.css'

const API = "https://api.chucknorris.io/jokes/random"

class App extends Component {

    render() {
        return (<NoteList api={API}/>)
    }
}

export default App
