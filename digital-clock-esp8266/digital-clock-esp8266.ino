// arduino digital clock

#include <Arduino.h>

#include "time.hpp"
#include "display.hpp"
#include "wifi.hpp"
#include "server.hpp"
#include "sensor.hpp"

LiquidCrystal_I2C lcd2004(0x27, 20, 4);

time_t A0_T;
bool D4_SET = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("starting");
    pinMode(A0, INPUT);

    display::init();
    sensor::init();

    Serial.println("started");
};


 
void loop() {
};
