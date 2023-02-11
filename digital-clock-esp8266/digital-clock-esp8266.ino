// arduino digital clock

#include <Arduino.h>

#include "time.hpp"
#include "display.hpp"
#include "wifi.hpp"
#include "server.hpp"
#include "sensor.hpp"

void setup() {
    Serial.begin(115200);

    pinMode(A0, INPUT);

    display::init();
    sensor::init();
};

void loop() {
};
