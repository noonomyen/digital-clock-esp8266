#include "hsm.hpp"

#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

DHT dht(D3, DHT11);

void HSM::init() {
    dht.begin();
};

float HSM::celsius_temperature() {
    return dht.readTemperature(false);
};

float HSM::fahrenheit_temperature() {
    return dht.readTemperature(true);
};

float HSM::humidity() {
    return dht.readHumidity();
};
