#ifndef __TIME_HPP__
#define __TIME_HPP__

#include <Arduino.h>
#include <DS1302.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

extern bool request_sync_ntp;

extern const String DAY[];
extern const String MONTH[];

extern DS1302 _rtc;

String dayAsString(Time::Day day);
String monthAsString(uint8_t mon);

namespace rtc {
    void init();
    void update();

    void sync_ntp();
};

#endif /* __TIME_HPP__ */