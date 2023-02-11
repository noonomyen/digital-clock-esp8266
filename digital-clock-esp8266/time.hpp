#ifndef __TIME_HPP__
#define __TIME_HPP__

#include <Arduino.h>
#include <time.h>
#include <DS1302.h>

namespace RTC {
    void init();
    void setTime(uint64_t timestamp);
    void setTime_from_NTP();
};

namespace NTP {
};

#endif /* __TIME_HPP__ */