#ifndef __SENSOR_HPP__
#define __SENSOR_HPP__

#include <Arduino.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

extern DHT _dht;

namespace sensor {
    void init();

    float celsius_temperature();
    float fahrenheit_temperature();
    float humidity();
};

#endif /* __SENSOR_HPP__ */