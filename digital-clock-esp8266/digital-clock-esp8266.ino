// arduino digital clock

#include <Arduino.h>
#include <EEPROM.h>

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
bool ap_mode;

void setup() {
    Serial.begin(115200);
    pinMode(A0, INPUT);
    pinMode(D4, OUTPUT);

    sensor::init();
    rtc::init();
    display::init();
    config.init();
    wifi::init();
    server_init();

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
            } else if ((millis() - btn_a0_t_reset) > 10000) {
                config.reset();
                config.save();
                _lcd2004.clear();
                _lcd2004.print("Reset...");
                delay(1000);
                ESP.restart();
            };
            btn_a0 = true;
        } else if (btn_a0) {
            if ((millis() - btn_a0_t_reset) > 3000) {
                if (ap_mode) {
                    _lcd2004.clear();
                    _lcd2004.setCursor(0, 0);
                    _lcd2004.print("AP mode disable");
                    ap_mode = false;
                    wifi::ap_disable();
                } else {
                    _lcd2004.clear();
                    _lcd2004.setCursor(0, 0);
                    _lcd2004.print("AP mode enable");
                    ap_mode = true;
                    wifi::ap_enable();
                };
                delay(1000);
            } else {
                display::show_wifi_status();
            };
            digitalWrite(D4, HIGH);
            btn_a0 = false;
        };
    };

    display::update(); 
    rtc::update();
    wifi::update();
    server_update();
};
