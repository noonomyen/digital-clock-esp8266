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
        String network_ip;
        String network_subnet;
        String network_gateway;
        String network_dns_1;
        String network_dns_2;
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
    bool parse();
    String stringify();
};

namespace config {
    void init();
};

#endif /* __CONFIG_HPP__ */