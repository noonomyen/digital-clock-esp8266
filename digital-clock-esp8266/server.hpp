#ifndef __HTTP_HPP__
#define __HTTP_HPP__

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>

#include "server.web_page.hpp"

namespace server {
    void update();
    void init();
};

#endif /* __HTTP_HPP__ */