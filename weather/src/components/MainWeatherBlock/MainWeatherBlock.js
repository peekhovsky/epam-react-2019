import React, {Component} from 'react'
import logo from '../../assets/load.gif'
import ListGroup from 'react-bootstrap/ListGroup'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import './MainWeatherBlock.css'

import {tempCelsiusToString} from '../App/App'


class MainWeatherBlock extends Component {

    constructor(props) {
        super(props)
        this.state = {
            api: props.api,
            iconApiTemplate: props.iconApiTemplate,
            appid: props.appid,
            city: props.city,
            isLoaded: false,
            units: "metric"
        }
    }

    loadWeather() {
        const url = `${this.state.api}?units=${this.state.units}&q=${this.state.city}&appid=${this.state.appid}`
        console.log(`Url: ${url}`)

        fetch(url)
            .then(response => response.json())
            .then(data => {

                this.setState({
                    isLoaded: true,
                    weatherInfo: {
                        weather: data.weather[0],
                        temp: tempCelsiusToString(data.main.temp),
                        tempMin: tempCelsiusToString(data.main.temp_min),
                        tempMax: tempCelsiusToString(data.main.temp_max),
                        windSpeed: data.wind.speed,
                        clouds: data.clouds.all,
                        city: data.name,
                        icon: `${this.state.iconApiTemplate}${data.weather[0].icon}.png`
                    }
                })
            }).catch((e) => {
            console.log(`${e}`)
        })
    }

    componentDidMount() {
        this.loadWeather()
    }

    render() {
        if (this.state.isLoaded) {
            const weatherInfo = this.state.weatherInfo

            const header = (
                <Container>
                    <Row className="weather-header">
                        <Col className="mt-4 ml-2" xs={3}>
                            <h3>{weatherInfo.city}</h3>
                        </Col>
                        <Col className="mt-1" xs={3}>
                            <img src={weatherInfo.icon} alt="weather_icon" width="73px"/>
                        </Col>
                        <Col className="mt-3" xs={3}>
                            <h2>{weatherInfo.temp}</h2>
                            <p>{weatherInfo.weather.main}</p>
                        </Col>
                    </Row>
                </Container>
            )

            return (
                <ListGroup variant="flush" className="weather-param-list">
                    <ListGroup.Item>
                        {header}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        Min temperature: {weatherInfo.tempMin}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        Max temperature: {weatherInfo.tempMax}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        Wind: {weatherInfo.windSpeed} m/s
                    </ListGroup.Item>
                    <ListGroup.Item>
                        Clouds: {weatherInfo.clouds} %
                    </ListGroup.Item>
                </ListGroup>
            )
        } else {
            return (
                <div className="card mx-auto">
                    <img src={logo} alt="weather_icon" style={{width: '150px'}}/>
                </div>
            )
        }
    }
}

export default MainWeatherBlock