#include "time.hpp"
#include "wifi.hpp"
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

void rtc::sync_ntp() {
    char ntp1[64];
    char ntp2[64];
    config.time_ntp_server_1.toCharArray(ntp1, 64);
    config.time_ntp_server_2.toCharArray(ntp2, 64);
    configTime(config.time_utc_offset, 0, ntp1, ntp2);
    time_t time_now = time(nullptr);
    struct tm* dt = localtime(&time_now);
    Serial.printf("%d %d %d %d %d %d %d\n", dt->tm_year, dt->tm_mon, dt->tm_mday, dt->tm_hour, dt->tm_min, dt->tm_sec, dt->tm_wday);
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
