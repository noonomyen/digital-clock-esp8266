#include "server.hpp"
#include "config.hpp"
#include "wifi.hpp"
#include "time.hpp"
#include "sensor.hpp"
#include "server.web_page.hpp"

#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>

AsyncWebServer server(80);
AsyncWebSocket ws("/wsapi");

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    if (type == WS_EVT_DATA) {
        AwsFrameInfo *info = (AwsFrameInfo*)arg;
        if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
            data[len] = 0;
            StaticJsonDocument<1024> req;
            StaticJsonDocument<1024> res;
            char JSON[1025];
            DeserializationError error = deserializeJson(req, (char*)data);
            if (error) {
                client->close();
            } else {
                const char* request = req["request"];
                const char* ref = req["ref"];
                if (strcmp(request, "GET_CONFIG") == 0) {
                    res["response"] = "OK";
                    res["ref"] = ref;
                    JsonObject tmp_config = res.createNestedObject("config");
                    tmp_config["wifi.enable"] = config.wifi_enable;
                    tmp_config["wifi.ssid"] = config.wifi_ssid;
                    tmp_config["wifi.password"] = config.wifi_password;
                    tmp_config["time.custom"] = config.time_custom;
                    tmp_config["time.ntp_server"] = config.time_ntp_server;
                    tmp_config["time.utc_offset"] = config.time_utc_offset;
                    tmp_config["sensor.temperature_type"] = config.sensor_temperature_type;
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else if (strcmp(request, "GET_SENSOR") == 0) {
                    res["response"] = "OK";
                    res["ref"] = ref;
                    float sc = sensor::celsius_temperature();
                    res["fahrenheit"] = _dht.convertCtoF(sc);
                    res["celsius"] = sc;
                    res["humidity"] = sensor::humidity();
                    res["temperature_type"] = config.sensor_temperature_type;
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else if (strcmp(request, "SYSTEM_INFO") == 0) {
                    res["response"] = "OK";
                    res["ref"] = ref;
                    JsonObject tmp_info = res.createNestedObject("info");
                    tmp_info["version"] = "1.0.0 dev";
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else if (strcmp(request, "GET_WIFI_STATUS") == 0) {
                    res["response"] = "OK";
                    res["ref"] = ref;
                    res["ssid"] = config.wifi_ssid;
                    res["mac"] = WiFi.macAddress();
                    String _;
                    if (!wifi_on) {
                        _ = "DISABLE";
                    } else if (wifi_status == WL_CONNECTED) {
                        _ = "CONNECTED";
                    } else if (wifi_status == WL_WRONG_PASSWORD) {
                        _ = "CONNECT_WRONG_PASSWORD";
                    } else if (wifi_status == WL_CONNECT_FAILED) {
                        _ = "CONNECT_FAILED";
                    } else if (wifi_status == WL_CONNECTION_LOST) {
                        _ = "CONNECT_FAILED";
                    } else if (wifi_status == WL_IDLE_STATUS) {
                        _ = "IDLE_STATUS";
                    } else if (wifi_status == WL_NO_SSID_AVAIL) {
                        _ = "NO_SSID_AVAIL";
                    } else if (wifi_status == WL_DISCONNECTED) {
                        _ = "DISCONNECTED";
                    } else {
                        _ = "ERROR";
                    };
                    res["status"] = _;
                    JsonObject tmp_network = res.createNestedObject("network");
                    tmp_network["sta_ip"] = WiFi.localIP().toString();
                    tmp_network["sta_subnet"] = WiFi.subnetMask().toString();
                    tmp_network["sta_gateway"] = WiFi.gatewayIP().toString();
                    tmp_network["dns_1"] = WiFi.dnsIP().toString();
                    tmp_network["dns_2"] = WiFi.dnsIP(1).toString();
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else if (strcmp(request, "SET_CONFIG") == 0) {
                    res["response"] = "OK";
                    res["ref"] = ref;
                    if (!req["config"]["wifi.enable"].isNull()) {
                        config.wifi_enable = req["config"]["wifi.enable"].as<bool>();
                        // Serial.println(req["config"]["wifi.enable"].as<bool>());
                    };
                    if (!req["config"]["wifi.ssid"].isNull()) {
                        config.wifi_ssid = req["config"]["wifi.ssid"].as<String>();
                        // Serial.println(req["config"]["wifi.ssid"].as<String>());
                    };
                    if (!req["config"]["wifi.password"].isNull()) {
                        config.wifi_password = req["config"]["wifi.password"].as<String>();
                        // Serial.println(req["config"]["wifi.password"].as<String>());
                    };
                    if (!req["config"]["time.custom"].isNull()) {
                        config.time_custom = req["config"]["time.custom"].as<bool>();
                        // Serial.println(req["config"]["time.custom"].as<bool>());
                    };
                    if (!req["config"]["time.ntp_server"].isNull()) {
                        config.time_ntp_server = req["config"]["time.ntp_server"].as<String>();
                        // Serial.println(req["config"]["time.ntp_server"].as<String>());
                    };
                    if (!req["config"]["time.utc_offset"].isNull()) {
                        config.time_utc_offset = req["config"]["time.utc_offset"].as<int>();
                        // Serial.println(req["config"]["time.utc_offset"].as<int>());
                    };
                    if (!req["config"]["sensor.temperature_type"].isNull()) {
                        config.sensor_temperature_type = req["config"]["sensor.temperature_type"].as<bool>();
                        // Serial.println(req["config"]["sensor.temperature_type"].as<bool>());
                    };
                    if (!req["config"]["time.timestamp"].isNull()) {};
                    config.save();
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else if (strcmp(request, "GET_DATETIME") == 0) {
                    bool rtc_err = false;
                    Time t = _rtc.time();
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
                        res["response"] = "ERROR";
                    } else {
                        res["response"] = "OK";
                        tm T = {
                            t.sec,
                            t.min,
                            t.hr,
                            t.date,
                            t.mon,
                            t.yr - 1900,
                            0,
                            0,
                            0
                        };
                        res["timestamp"] = mktime(&T);
                        res["utc_offset"] = config.time_utc_offset;
                    };
                    res["ref"] = ref;
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else if (strcmp(request, "RESET_CONFIG") == 0) {
                    res["response"] = "OK";
                    res["ref"] = ref;
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else if (strcmp(request, "TIME_SYNC") == 0) {
                    rtc::sync_ntp();
                    res["response"] = "OK";
                    res["ref"] = ref;
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                } else {
                    res["response"] = "ERROR";
                    res["ref"] = ref;
                    res["error"] = "BAD_REQUEST";
                    serializeJson(res, JSON);
                    client->printf_P(JSON);
                };
            };
        };
    };
};

void server_init() {
    ws.onEvent(onEvent);
    server.addHandler(&ws);

    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/html", index_html);
    });

    server.on("/index.css", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/css", index_css);
    });

    server.on("/index.js", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/javascript", index_js);
    });

    server.on("/setting", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/html", setting_html);
    });

    server.on("/setting.css", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/css", setting_css);
    });

    server.on("/setting.js", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/javascript", setting_js);
    });

    server.on("/api.js", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/javascript", api_js);
    });

    server.begin();
};

void server_update() {
    ws.cleanupClients();
};