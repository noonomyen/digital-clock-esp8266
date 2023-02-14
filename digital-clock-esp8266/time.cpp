#include "time.hpp"
#include "config.hpp"

const String DAY[7] = {
    "Sun", // Sunday
    "Mon", // Monday
    "Tue", // Tuesday
    "Wed", // Wednesday
    "Thu", // Thursday
    "Fri", // Friday
    "Sat"  // Saturday
};

const String MONTH[12] = {
    "Jan", // January
    "Feb", // February
    "Mar", // March
    "Apr", // April
    "May", // May
    "Jun", // June
    "Jul", // July
    "Aug", // August
    "Sep", // September
    "Oct", // October
    "Nov", // November
    "Dec"  // December
};

void rtc::init() {
    _rtc.halt(false);
    _rtc.writeProtect(false);
};

void ntp::init() {
};

String dayAsString(Time::Day day) {
    if (day < 7) {
        return DAY[day];
    } else {
        return "ERR";
    };
};

String monthAsString(uint8_t mon) {
    if (mon < 7) {
        return MONTH[mon];
    } else {
        return "ERR";
    };
};
