#include "display.hpp"
#include "config.hpp"
#include "time.hpp"
#include "sensor.hpp"
#include "wifi.hpp"

time_t display_t;
bool DISPLAY_WIFI_STA_ON = false;
bool DISPLAY_AP_MODE_ON = false;

const char degree_symbol = char(176);
const char str_AP[] = "AP";
const char str_STA[] = "WIFI";

void remove_null_terminated(char *buffer, uint8_t len) {
    for (uint8_t i = 0; i < (len - 1); i++) {
        if (buffer[i] == 0) {
            buffer[i] = char(32);
        };
    };
    buffer[len - 1] = char(0);
};

void display::init() {
    _lcd2004.init();
    _lcd2004.clear();
    _lcd2004.backlight();

    _lcd2004.setCursor(0, 0);
    display_t = millis();
};

void display::update() {
    if ((millis() - display_t) > 250) {
        display_t = millis();

        char L0[21] = "                    ";
        char L1[21] = "                    ";
        char L2[21] = "                    ";
        char L3[21] = "                    ";

        Time t = _rtc.time();
        String day = dayAsString(t.day);

        char temp_type;
        bool sensor_err = false;
        float temp;
        float humi = sensor::humidity();
        if (config.sensor_temperature_type) {
            temp = sensor::celsius_temperature();
            temp_type = char(67);
        } else {
            temp = sensor::fahrenheit_temperature();
            temp_type = char(70);
        };

        if (isnan(humi) || humi > 99 || humi < 0) {
            sensor_err = true;
        };
        if (isnan(temp) || temp > 999 || temp < 0) {
            sensor_err = true;
        };

        bool rtc_err = false;

        if (t.date > 31 || t.date < 0) {
            rtc_err = true;
        } else if (t.day > 7 || t.day < 1) {
            rtc_err = true;
        } else if (t.mon > 11 || t.mon < 0) {
            rtc_err = true;
        } else if (t.hr > 59 || t.hr < 0) {
            rtc_err = true;
        } else if (t.min > 59 || t.min < 0) {
            rtc_err = true;
        } else if (t.sec > 59 || t.sec < 0) {
            rtc_err = true;
        } else if (t.yr > 2164 || t.yr < 2000) {
            rtc_err = true;
        };

        if (rtc_err) {
            sprintf(L1, "[!] RTC_ERROR");
        } else {
            sprintf(L0, "%02d:%02d:%02d ^_^", t.hr, t.min, t.sec);
            sprintf(L2, "%s, %s %d, %04d", dayAsString(t.day), monthAsString(t.mon), t.date, t.yr);
        };

        if (sensor_err) {
            sprintf(L3, "[!] SENSOR_ERROR");
        } else {
            if (temp > 100) {
                sprintf(L3, "Temp %.0f%c%c  Humi %.0f%%", roundf(temp), char(176), temp_type, roundf(humi));
            } else {
                sprintf(L3, "Temp %.1f%c%c Humi %.0f%%", roundf(temp * 10) / 10, char(176), temp_type, roundf(humi));
            };
        };

        if (DISPLAY_WIFI_STA_ON) {
            L0[19] = str_STA[3];
            L0[18] = str_STA[2];
            L0[17] = str_STA[1];
            L0[16] = str_STA[0];
        };

        if (DISPLAY_AP_MODE_ON) {
            L0[14] = str_AP[1];
            L0[13] = str_AP[0];
        };

        remove_null_terminated(L0, 21);
        remove_null_terminated(L1, 21);
        remove_null_terminated(L2, 21);
        remove_null_terminated(L3, 21);

        _lcd2004.setCursor(0, 0);
        _lcd2004.print(L0);
        _lcd2004.setCursor(0, 1);
        _lcd2004.print(L1);
        _lcd2004.setCursor(0, 2);
        _lcd2004.print(L2);
        _lcd2004.setCursor(0, 3);
        _lcd2004.print(L3);
    };
};

void display::show_wifi_status() {
    _lcd2004.clear();
    _lcd2004.setCursor(0, 0);
    if (wifi_on) {
        _lcd2004.print("WIFI: Enable");
    } else {
        _lcd2004.print("WIFI: Disable");
    };
    _lcd2004.setCursor(0, 1);
    _lcd2004.print("SSID: ");
    _lcd2004.print(config.wifi_ssid);
    _lcd2004.setCursor(0, 2);
    String _;
    if (wifi_status == WL_CONNECTED) {
        _ = "Connected";
    } else if (wifi_status == WL_WRONG_PASSWORD) {
        _ = "Incorrect";
    } else if (wifi_status == WL_CONNECT_FAILED) {
        _ = "Fail";
    } else if (wifi_status == WL_CONNECTION_LOST) {
        _ = "Lost connect";
    } else if (wifi_status == WL_IDLE_STATUS) {
        _ = "Idel";
    } else if (wifi_status == WL_NO_SSID_AVAIL) {
        _ = "Not found";
    } else if (wifi_status == WL_DISCONNECTED) {
        _ = "Disconnected";
    } else {
        _ = "ERROR";
    };
    _lcd2004.print("-> ");
    _lcd2004.print(_);
    _lcd2004.setCursor(0, 3);
    _lcd2004.print("IP: ");
    _lcd2004.print(WiFi.localIP());
    delay(3000);
};