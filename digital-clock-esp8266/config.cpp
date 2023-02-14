#include "config.hpp"
#include "time.hpp"

Config::Config() {
};

void Config::init() {
};

bool Config::parse() {
};

void Config::set_ip(uint8_t *point, uint8_t b1, uint8_t b2, uint8_t b3, uint8_t b4) {
    point[0] = b1;
    point[1] = b2;
    point[2] = b3;
    point[3] = b4;
};

String Config::get_ip_str(uint8_t *point) {
    return String(point[0]) + "." + String(point[1]) + "." + String(point[2]) + "." + String(point[3]);
};

void Config::reset() {
    this->wifi_enable = false;
    this->wifi_ssid = "";
    this->wifi_password = "";
    this->network_dhcp = true;
    this->set_ip(this->network_ip, 0, 0, 0, 0);
    this->set_ip(this->network_subnet, 0, 0, 0, 0);
    this->set_ip(this->network_gateway, 0, 0, 0, 0);
    this->set_ip(this->network_dns_1, 0, 0, 0, 0);
    this->set_ip(this->network_dns_2, 0, 0, 0, 0);
    this->web_custom = false;
    this->web_background = true;
    this->web_background_color = "ffffff";
    this->web_background_url = "";
    this->web_font_color = "000000";
    this->time_custom = false;
    this->time_ntp_server_1 = "time.google.com";
    this->time_ntp_server_2 = "time.cloudflare.com";
    this->time_utc_offset = 0;

    Time t(2000, 1, 1, 0, 0, 0, Time::kSaturday);
    _rtc.time(t);
};

void Config::save() {};

void Config::load() {}

Config config;