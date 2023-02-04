// arduino digital clock

#include <Arduino.h>

#include "ntp.hpp"
#include "control.hpp"
#include "rtc.hpp"
#include "display.hpp"
#include "wifi.hpp"
#include "hsm.hpp"
#include "http.hpp"
#include "ws.hpp"

void setup() {
    Serial.begin(115200);
    HSM::init();
};

void loop() {
};
