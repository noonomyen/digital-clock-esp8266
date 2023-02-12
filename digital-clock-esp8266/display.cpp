#include "display.hpp"

void display::init() {
    lcd2004.init();
    lcd2004.clear();
    lcd2004.backlight();

    uint8_t custom_char_len = sizeof(custom_char) / (sizeof(char) * 8);
    for (uint8_t i = 0; i < custom_char_len; i++) {
        lcd2004.createChar(i, custom_char[i]);
    };

    lcd2004.setCursor(0, 0);
};
