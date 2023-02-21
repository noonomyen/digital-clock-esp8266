#include "server.hpp"
#include "config.hpp"
#include "wifi.hpp"
#include "time.hpp"
#include "server.web_page.hpp"

#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>

AsyncWebServer server(80);
AsyncWebSocket ws("/wsapi");

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
};

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    if (type == WS_EVT_DATA) {
        handleWebSocketMessage(arg, data, len);
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