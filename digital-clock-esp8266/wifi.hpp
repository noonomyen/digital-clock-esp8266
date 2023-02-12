#ifndef __WIFI_HPP__
#define __WIFI_HPP__

#include <Arduino.h>
#include <ESP8266WiFi.h>

namespace wifi {
    void update();
    void init();

    void reconnect(uint8_t *status);
};

#endif /* __WIFI_HPP__ */