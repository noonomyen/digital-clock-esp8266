// arduino digital clock

#include <Arduino.h>

#include "time.hpp"
#include "display.hpp"
#include "wifi.hpp"
#include "server.hpp"
#include "sensor.hpp"
#include "config.hpp"

LiquidCrystal_I2C _lcd2004(0x27, 20, 4);
DS1302 _rtc(D7, D6, D5);
DHT _dht(D3, DHT11);

time_t btn_a0_t;
bool btn_a0 = false;
time_t btn_a0_t_reset;

void setup() {
    Serial.begin(115200);
    pinMode(A0, INPUT);
    pinMode(D4, OUTPUT);

    config.init();
    display::init();
    sensor::init();
    rtc::init();

    digitalWrite(D4, HIGH);
    btn_a0_t = millis();
    btn_a0_t_reset = millis();
};
 
void loop() {
    if ((millis() - btn_a0_t) > 250) {
        btn_a0_t = millis();
        if (analogRead(A0) > 767) {
            digitalWrite(D4, LOW);
            if (!btn_a0) {
                btn_a0_t_reset = millis();
            }
            btn_a0 = true;
        } else if (btn_a0) {
            digitalWrite(D4, HIGH);
            btn_a0 = false;
            if ((millis() - btn_a0_t_reset) > 10000) {
                config.reset();
                config.save();
                _lcd2004.clear();
                _lcd2004.print("RESET CONFIG ...");
                delay(1000);
                ESP.restart();
            };
        };
    };

    display::update();
};
