#include "wifi.hpp"
#include "config.hpp"

IPAddress ap_local_ip(10, 1, 1, 1);
IPAddress ap_gateway(10, 1, 1, 1);
IPAddress ap_subnet(255, 255, 255, 0);

void wifi::init() {
    WiFi.mode(WIFI_AP_STA);
};

void wifi::ap_enable() {
    WiFi.softAP("digital clock", "dcap8266");
    WiFi.softAPConfig(ap_local_ip, ap_gateway, ap_subnet);
};

void wifi::ap_disable() {
    WiFi.softAPdisconnect(true);
};
