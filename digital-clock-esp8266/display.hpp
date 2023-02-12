#ifndef __DISPLAY_HPP__
#define __DISPLAY_HPP__

#include <Arduino.h>

#include <LiquidCrystal_I2C.h>

#include "display.custom_char.hpp"

extern LiquidCrystal_I2C lcd2004;

namespace display {
    void init();
    void refresh();

    namespace scene {
        void starting();

    };
};

#endif /* __DISPLAY_HPP__ */