import React, { Component } from 'react'
import MainWeatherBlock from '../MainWeatherBlock/MainWeatherBlock'
import FourDaysWeatherBlock from '../FourDaysWeatherBlock/FourDaysWeatherBlock'

import './App.css'

const ONE_DAY_API = "https://api.openweathermap.org/data/2.5/weather"
const FOUR_DAYS_API = "https://api.openweathermap.org/data/2.5/forecast"
const ICON_API = "http://openweathermap.org/img/w/"
const CITY = "Minsk"
const APPID = "a94d0a5ac08570add4b47b8da933f247";


export let tempCelsiusToString = function (temp) {
    return temp > 0 ? `+${Math.round(temp)}` : `${Math.round(temp)}`
}

class App extends Component {
    render() {
        return (
            <div className="container">
                <MainWeatherBlock
                    api={ONE_DAY_API}
                    iconApiTemplate={ICON_API}
                    city={CITY}
                    appid={APPID} />

                <FourDaysWeatherBlock
                    api={FOUR_DAYS_API}
                    iconApiTemplate={ICON_API}
                    city={CITY}
                    appid={APPID} />
            </div>
        )
    }
}

export default App
