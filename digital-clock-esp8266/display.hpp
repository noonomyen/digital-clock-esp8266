#ifndef __DISPLAY_HPP__
#define __DISPLAY_HPP__

#include <Arduino.h>
#include <LiquidCrystal_I2C.h>

extern LiquidCrystal_I2C _lcd2004;
extern bool WIFI_STA_CONNECTED;
extern bool AP_MODE_ENABLE;

namespace display {
    void init();
    void refresh();

    void update();
};

#endif /* __DISPLAY_HPP__ */