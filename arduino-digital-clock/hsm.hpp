#ifndef __HSM_HPP__
#define __HSM_HPP__

#include <Arduino.h>

namespace HSM {
    void init();

    float celsius_temperature();
    float fahrenheit_temperature();
    float humidity();
};

#endif /* __HSM_HPP__ */