#ifndef __SENSOR_HPP__
#define __SENSOR_HPP__

#include <Arduino.h>

namespace sensor {
    void init();

    float celsius_temperature();
    float fahrenheit_temperature();
    float humidity();
};

#endif /* __SENSOR_HPP__ */