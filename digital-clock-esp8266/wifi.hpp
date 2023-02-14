#ifndef __WIFI_HPP__
#define __WIFI_HPP__

#include <Arduino.h>
#include <ESP8266WiFi.h>

namespace wifi {
    void update();
    void init();

    void sta_reconnect(uint8_t *status);
    void sta_enable();
    void sta_disable();
    void ap_enable();
    void ap_disable();
};

#endif /* __WIFI_HPP__ */