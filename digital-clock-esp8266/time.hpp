#ifndef __TIME_HPP__
#define __TIME_HPP__

#include <Arduino.h>
#include <time.h>
#include <DS1302.h>

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
    void setTime(uint64_t timestamp);
    void setTime_from_NTP();
};

namespace ntp {
    void init();
    void sync();
    void setTime_from_RTC();
};

#endif /* __TIME_HPP__ */