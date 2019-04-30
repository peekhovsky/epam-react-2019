import React, {Component} from 'react'
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './WeatherBlock.css'


class WeatherBlock extends Component {

    constructor(props) {
        super(props);
        this.state = {
            weatherInfo: props.weatherInfo
        }
    }

    render() {
        return (
            <Card bg="dark" className="mt-4 weather-card" text="white">
                <Card.Header>{this.state.weatherInfo.date}</Card.Header>
                <Card.Body>
                    <Row className="weatherHeader">
                        <Col xs={6}>
                            <Card.Title className="card-title">
                                Day: <img src={this.state.weatherInfo.day.icon} alt="logo" width="40px"/>
                                {this.state.weatherInfo.day.temp}
                            </Card.Title>
                        </Col>
                        <Col xs={6}>
                            <Card.Title className="card-title">
                                Night:
                                <img src={this.state.weatherInfo.night.icon} alt="logo" width="40px"/>
                                {this.state.weatherInfo.night.temp}
                            </Card.Title>
                        </Col>
                    </Row>

                </Card.Body>
            </Card>
        )
    }
}

export default WeatherBlock