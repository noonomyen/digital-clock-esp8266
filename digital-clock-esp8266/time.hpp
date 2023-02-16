#ifndef __TIME_HPP__
#define __TIME_HPP__

#include <Arduino.h>
#include <time.h>
#include <DS1302.h>

extern bool request_sync_ntp;

extern const String DAY[];
extern const String MONTH[];

extern DS1302 _rtc;

extern String get_datetime();
extern String get_timestamp();
extern String get_utc_offset();

String dayAsString(Time::Day day);
String monthAsString(uint8_t mon);

namespace rtc {
    void init();
    void update();

    void sync_ntp();
};

#endif /* __TIME_HPP__ */