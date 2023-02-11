#include "sensor.hpp"

#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

DHT dht(D3, DHT11);

void SENSOR::init() {
    dht.begin();
};

float SENSOR::celsius_temperature() {
    return dht.readTemperature(false);
};

float SENSOR::fahrenheit_temperature() {
    return dht.readTemperature(true);
};

float SENSOR::humidity() {
    return dht.readHumidity();
};
