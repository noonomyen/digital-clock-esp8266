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

bool ConfigTimeWait() {
    if (time(nullptr) > 946688400) {
        return true;
    } else {
        return false;
    };
};

void rtc::sync_ntp() {
    char ntp_server[64];
    config.time_ntp_server.toCharArray(ntp_server, 64);
    WiFiUDP ntpudp;
    NTPClient ntpc(ntpudp, ntp_server);
    ntpc.begin();
    ntpc.setTimeOffset(config.time_utc_offset);
    ntpc.update();
    time_t epochTime = ntpc.getEpochTime();
    struct tm *ptm = gmtime ((time_t *)&epochTime);
    Time::Day wday;
    if (ptm->tm_wday == 0) {
        wday = Time::kSunday;
    } else if (ptm->tm_wday == 1) {
        wday = Time::kMonday;
    } else if (ptm->tm_wday == 2) {
        wday = Time::kTuesday;
    } else if (ptm->tm_wday == 3) {
        wday = Time::kWednesday;
    } else if (ptm->tm_wday == 4) {
        wday = Time::kThursday;
    } else if (ptm->tm_wday == 5) {
        wday = Time::kFriday;
    } else if (ptm->tm_wday == 6) {
        wday = Time::kSaturday;
    };
    Time t(
        ptm->tm_year + 1900,
        ptm->tm_mon,
        ptm->tm_mday,
        ptm->tm_hour,
        ptm->tm_min,
        ptm->tm_sec,
        wday
    );
    _rtc.time(t);
};

void rtc::update() {
    if (((millis() - auto_sync_t) > 3600000) || request_sync_ntp) {
        if (WiFi.status() == WL_CONNECTED) {
            rtc::sync_ntp();
            request_sync_ntp = false;
        } else {
            request_sync_ntp = true;
        };
        auto_sync_t = millis();
    };
};
