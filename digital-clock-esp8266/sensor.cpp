#include "sensor.hpp"

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
