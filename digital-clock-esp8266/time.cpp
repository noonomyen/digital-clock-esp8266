#include "time.hpp"
#include "wifi.hpp"
#include "config.hpp"

#include <NTPClient.h>
#include <WiFiUdp.h>

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

time_t auto_sync_t = 0;
bool request_sync_ntp = true;

void rtc::init() {
    _rtc.halt(false);
    _rtc.writeProtect(false);
};

String dayAsString(Time::Day day) {
    if ((day - 1) < 7) {
        return DAY[day - 1];
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

bool ConfigTimeWait() {
    if (time(nullptr) > 946688400) {
        return true;
    } else {
        return false;
    };
};

void rtc::sync_ntp() {
    char ntp1[64];
    char ntp2[64];
    config.time_ntp_server.toCharArray(ntp1, 64);
};

void rtc::update() {
    if (((millis() - auto_sync_t) > 3600000) || request_sync_ntp) {
        if (WiFi.status() == WL_CONNECTED) {
            sync_ntp();
            request_sync_ntp = false;
        } else {
            request_sync_ntp = true;
        };
        auto_sync_t = millis();
    };
};
