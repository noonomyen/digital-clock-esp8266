#include "wifi.hpp"
#include "config.hpp"
#include "display.hpp"

IPAddress ap_local_ip(10, 1, 1, 1);
IPAddress ap_gateway(10, 1, 1, 1);
IPAddress ap_subnet(255, 255, 255, 0);

time_t check_wifi_status;
bool wifi_on = false;
bool ap_on = false;
uint8_t wifi_status = 0;

void wifi::init() {
    check_wifi_status = millis();
    if (config.wifi_enable) {
        WiFi.mode(WIFI_STA);
        wifi::sta_enable();
    } else {
        WiFi.mode(WIFI_OFF);
    };
};

void wifi::ap_enable() {
    WiFi.softAP("digital clock", "dcap8266");
    WiFi.softAPConfig(ap_local_ip, ap_gateway, ap_subnet);
    DISPLAY_AP_MODE_ON = true;
};

void wifi::ap_disable() {
    WiFi.softAPdisconnect(true);
    DISPLAY_AP_MODE_ON = false;
};

void wifi::sta_enable() {
    wifi_on = true;
    if (ap_on) {
        WiFi.mode(WIFI_AP_STA);
    } else {
        WiFi.mode(WIFI_STA);
    };
    WiFi.begin(config.wifi_ssid, config.wifi_password);
};

void wifi::sta_disable() {
    wifi_on = false;
    if (ap_on) {
        WiFi.mode(WIFI_AP);
    } else {
        WiFi.mode(WIFI_OFF);
    };
};

void wifi::update() {
    if ((millis() - check_wifi_status) > 1000) {
        wifi_status = WiFi.status();
        if (wifi_status == WL_CONNECTED) {
            DISPLAY_WIFI_STA_ON = true;
        };
    };
};