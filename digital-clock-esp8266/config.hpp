#ifndef __CONFIG_HPP__
#define __CONFIG_HPP__

#include <Arduino.h>
#include <EEPROM.h>

class Config {
    public:
        bool wifi_enable;
        String wifi_ssid;
        String wifi_password;
        bool network_dhcp;
        uint8_t network_ip[4];
        uint8_t network_subnet[4];
        uint8_t network_gateway[4];
        uint8_t network_dns_1[4];
        uint8_t network_dns_2[4];
        bool web_custom;
        bool web_background;
        String web_background_color;
        String web_background_url;
        String web_font_color;
        bool time_custom;
        String time_ntp_server_1;
        String time_ntp_server_2;
        uint32_t time_utc_offset;
        bool sensor_temperature_type;

        Config();
        void init();
        void reset();
        bool parse();
        String stringify();
        void set_ip(uint8_t *point, uint8_t b1, uint8_t b2, uint8_t b3, uint8_t b4);
        String get_ip_str(uint8_t *point);
        void save();
        void load();
};

extern Config config;

#endif /* __CONFIG_HPP__ */