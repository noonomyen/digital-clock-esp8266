#ifndef __CONFIG_HPP__
#define __CONFIG_HPP__

#include <Arduino.h>
#include <EEPROM.h>
#include <ArduinoJson.h>

class Config {
    public:
        bool wifi_enable;
        String wifi_ssid;
        String wifi_password;
        bool time_custom;
        String time_ntp_server;
        int time_utc_offset;
        bool sensor_temperature_type;

        Config();
        void init();
        void reset();
        void set_ip(uint8_t *point, uint8_t b1, uint8_t b2, uint8_t b3, uint8_t b4);
        String get_ip_str(uint8_t *point);
        void save();
        void load();
};

extern bool is_ipl();

extern Config config;

#endif /* __CONFIG_HPP__ */