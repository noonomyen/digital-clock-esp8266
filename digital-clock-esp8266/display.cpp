#include "display.hpp"
#include "config.hpp"
#include "time.hpp"
#include "sensor.hpp"

time_t display_t;

void display::init() {
    _lcd2004.init();
    _lcd2004.clear();
    _lcd2004.backlight();

    uint8_t custom_char_len = sizeof(custom_char) / (sizeof(char) * 8);
    for (uint8_t i = 0; i < custom_char_len; i++) {
        _lcd2004.createChar(i, custom_char[i]);
    };

    _lcd2004.setCursor(0, 0);
    display_t = millis();
};

void display::update() {
    if ((millis() - display_t) > 1000) {
        display_t = millis();
        Time t = _rtc.time();
        String day = dayAsString(t.day);
        _lcd2004.setCursor(0, 0);
        _lcd2004.printf("%02d:%02d:%02d ^_^", t.hr, t.min, t.sec);
        _lcd2004.setCursor(0, 2);
        _lcd2004.printf("%s, %s %d, %04d", dayAsString(t.day), monthAsString(t.mon), t.date, t.yr);
        _lcd2004.setCursor(0, 3);
        // _lcd2004.printf("Temp %s", sensor::celsius_temperature_fill_str());
        // _lcd2004.write(0);
        // _lcd2004.printf("C Humi %s", sensor::humidity_fill_str());
        // _lcd2004.print("%");
    };
};
