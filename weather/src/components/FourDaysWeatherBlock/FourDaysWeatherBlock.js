import React, {Component} from 'react'
import logo from '../../assets/load.gif'
import ListGroup from 'react-bootstrap/ListGroup';
import WeatherBlock from '../WeatherBlock/WeatherBlock'
import moment from 'moment'

import './FourDaysWeatherBlock.css'
import {tempCelsiusToString} from '../App/App'

class FourDaysWeatherBlock extends Component {

    NIGHT_TIME = "03:00:00"

    constructor(props) {
        super(props);
        this.state = {
            api: props.api,
            iconApiTemplate: props.iconApiTemplate,
            appid: props.appid,
            city: props.city,
            isLoaded: false,
            units: "metric",
            weatherInfo: null
        }
    }

    weatherInfoFromDateList(dataList) {
        let weatherInfo = []
        console.log(weatherInfo)
        for (let i = 0; i < dataList.length - 4; i++) {
            let weatherNight = dataList[i]
            let weatherDay = dataList[i + 4]
            let time = moment.unix(weatherNight.dt).local().format('HH:mm:ss');

            if (time === this.NIGHT_TIME) {
                weatherInfo.push({
                    date: moment.unix(weatherNight.dt).local().format('MM/DD'),
                    night: {
                        weather: weatherNight.weather[0],
                        temp: tempCelsiusToString(weatherNight.main.temp),
                        tempMin: tempCelsiusToString(weatherNight.main.temp_min),
                        tempMax: tempCelsiusToString(weatherNight.main.temp_max),
                        windSpeed: weatherNight.wind.speed,
                        clouds: weatherNight.clouds.all,
                        city: weatherNight.name,
                        icon: `${this.state.iconApiTemplate}${weatherNight.weather[0].icon}.png`
                    },
                    day: {
                        weather: weatherDay.weather[0],
                        temp: tempCelsiusToString(weatherDay.main.temp),
                        tempMin: tempCelsiusToString(weatherDay.main.temp_min),
                        tempMax: tempCelsiusToString(weatherDay.main.temp_max),
                        windSpeed: weatherDay.wind.speed,
                        clouds: weatherDay.clouds.all,
                        city: weatherDay.name,
                        icon: `${this.state.iconApiTemplate}${weatherDay.weather[0].icon}.png`
                    }
                })
            }
        }
        return weatherInfo
    }

    loadWeather() {
        let url = `${this.state.api}?units=${this.state.units}&q=${this.state.city}&appid=${this.state.appid}`
        console.log(`Url: ${url}`)

        fetch(url)
            .then(response => response.json())
            .then(data => {
                let dateList = this.weatherInfoFromDateList(data.list)
                this.setState({
                    isLoaded: true,
                    weatherInfo: dateList
                })
            }).catch((e) => {
            console.log(`${e}`);
        })
    }

    componentDidMount() {
        this.loadWeather();
    }

    render() {
        if (this.state.isLoaded) {
            let components = this.state.weatherInfo.map(wi =>
                <ListGroup.Item key={wi.date}>
                    <WeatherBlock weatherInfo={wi}/>
                </ListGroup.Item>
            )
            return (
                <ListGroup variant="flush" className="list-group">
                    {components}
                </ListGroup>
            )

        } else {
            return (
                <div className="card mx-auto" style={{width: '50%'}}>
                    <img src={logo} alt="weather_icon" style={{width: '150px'}}/>
                </div>
            )
        }
    }

}

export default FourDaysWeatherBlock