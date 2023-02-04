#ifndef __RTC_HPP__
#define __RTC_HPP__

#include <Arduino.h>
#include <time.h>
#include <DS1302.h>

namespace RTC {
    void init();
    void setTime(const uint16_t yr, const uint8_t mon, const uint8_t date, const uint8_t hr, const uint8_t min, const uint8_t sec, const Time::Day day);
    void setTime_from_NTP();
};

#endif /* __RTC_HPP__ */