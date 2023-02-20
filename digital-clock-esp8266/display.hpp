#ifndef __DISPLAY_HPP__
#define __DISPLAY_HPP__

#include <Arduino.h>
#include <LiquidCrystal_I2C.h>

extern LiquidCrystal_I2C _lcd2004;
extern bool DISPLAY_WIFI_STA_ON;
extern bool DISPLAY_AP_MODE_ON;

namespace display {
    void init();
    void refresh();
    void show_wifi_status();
    void update();
};

#endif /* __DISPLAY_HPP__ */