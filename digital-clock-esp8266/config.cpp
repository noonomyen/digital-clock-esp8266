#include "config.hpp"
#include "time.hpp"
#include "display.hpp"

const String EEPROM_DATETIME = __DATE__ __TIME__;
const int OFFSET_EEPROM = EEPROM_DATETIME.length();

Config::Config() {
};

void Config::init() {
    EEPROM.begin(512);
    if (is_ipl()) {
        delay(500);
        _lcd2004.clear();
        _lcd2004.print("Please wait...");
        this->reset();
        this->save();
        EEPROM.commit();
        EEPROM.end();
        delay(2000);
        ESP.restart();
    } else {
        this->load();
    };
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
    this->time_custom = false;
    this->time_ntp_server = "time.google.com";
    this->time_utc_offset = 0;
    this->sensor_temperature_type = true;

    Time t(2000, 1, 1, 0, 0, 0, Time::kSaturday);
    _rtc.time(t);
};

void Config::save() {
    int current_addr = OFFSET_EEPROM + 1;
    EEPROM.write(current_addr, (uint8_t)this->wifi_enable);

    current_addr += 1;
    char wifi_ssid_buffer[32];
    this->wifi_ssid.toCharArray(wifi_ssid_buffer, 32);
    for (int i = 0; i < 32; i++) {
        EEPROM.write(current_addr + i, wifi_ssid_buffer[i]);
    };

    current_addr += 32;
    char wifi_password_buffer[64];
    this->wifi_password.toCharArray(wifi_password_buffer, 64);
    for (int i = 0; i < 64; i++) {
        EEPROM.write(current_addr + i, wifi_password_buffer[i]);
    };

    current_addr += 64;
    EEPROM.write(current_addr, (uint8_t)this->time_custom);

    current_addr += 1;
    char time_ntp_server_buffer[64];
    this->time_ntp_server.toCharArray(time_ntp_server_buffer, 64);
    for (int i = 0; i < 64; i++) {
        EEPROM.write(current_addr + i, time_ntp_server_buffer[i]);
    };

    current_addr += 64;
    EEPROM.write(current_addr + 0, (uint8_t)((this->time_utc_offset >> 24) & 0xFF));
    EEPROM.write(current_addr + 1, (uint8_t)((this->time_utc_offset >> 16) & 0xFF));
    EEPROM.write(current_addr + 2, (uint8_t)((this->time_utc_offset >> 8) & 0xFF));
    EEPROM.write(current_addr + 3, (uint8_t)(this->time_utc_offset & 0xFF));

    current_addr += 4;
    EEPROM.write(current_addr, (uint8_t)this->sensor_temperature_type);

    EEPROM.commit();
    delay(100);
};

void Config::load() {
    int current_addr = OFFSET_EEPROM + 1;
    this->wifi_enable = (bool)EEPROM.read(current_addr);

    current_addr += 1;
    char wifi_ssid_buffer[32];
    for (int i = 0; i < 32; i++) {
        wifi_ssid_buffer[i] = EEPROM.read(current_addr + i);
    };
    this->wifi_ssid = String(wifi_ssid_buffer);

    current_addr += 32;
    char wifi_password_buffer[64];
    for (int i = 0; i < 64; i++) {
        wifi_password_buffer[i] = EEPROM.read(current_addr + i);
    };
    this->wifi_password = String(wifi_password_buffer);

    current_addr += 64;
    this->time_custom = (bool)EEPROM.read(current_addr);

    current_addr += 1;
    char time_ntp_server_buffer[64];
    for (int i = 0; i < 64; i++) {
        time_ntp_server_buffer[i] = EEPROM.read(current_addr + i);
    };
    this->time_ntp_server = String(time_ntp_server_buffer);

    current_addr += 64;
    this->time_utc_offset =
        ((int)(EEPROM.read(current_addr + 0)) << 24) |
        ((int)(EEPROM.read(current_addr + 1)) << 16) |
        ((int)(EEPROM.read(current_addr + 2)) << 8) |
        (int)(EEPROM.read(current_addr + 3));

    current_addr += 4;
    this->sensor_temperature_type = (bool)EEPROM.read(current_addr);
};

bool is_ipl() {
    bool ipl = false;
    for (int i = 0; i < OFFSET_EEPROM; i++) {
        if (EEPROM.read(i) != (uint8_t)EEPROM_DATETIME[i]) {
            EEPROM.write(i, (uint8_t)EEPROM_DATETIME[i]);
            ipl = true;
        };
    };
    return ipl;
}

Config config;