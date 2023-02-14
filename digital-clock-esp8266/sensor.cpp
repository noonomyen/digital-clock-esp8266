#include "sensor.hpp"
#include "config.hpp"

void sensor::init() {
    _dht.begin();
};

float sensor::celsius_temperature() {
    return _dht.readTemperature(false);
};

float sensor::fahrenheit_temperature() {
    return _dht.readTemperature(true);
};

float sensor::humidity() {
    return _dht.readHumidity();
};
