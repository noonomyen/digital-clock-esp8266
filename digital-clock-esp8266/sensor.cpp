#include "sensor.hpp"

#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

DHT dht(D3, DHT11);

void sensor::init() {
    dht.begin();
};

float sensor::celsius_temperature() {
    return dht.readTemperature(false);
};

float sensor::fahrenheit_temperature() {
    return dht.readTemperature(true);
};

float sensor::humidity() {
    return dht.readHumidity();
};
