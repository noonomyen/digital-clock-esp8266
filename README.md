# Arduino Digital Clock

## Introduction
This repository is my chemistry teacher presentation project 2023 on the topic of innovation.

This project may not have development and device support. or to the point of permanently deleting the repository

---

## Device support
- NodeMCU V3 (ESP8266)

---

## Setup
```sh
npx ts-node ./tools/setup.ts --reset
```

## Compile
```sh
./arduino/arduino-cli --verbose --config-file arduino-cli.yaml compile --fqbn esp8266:esp8266:nodemcuv2:xtal=160,vt=flash,exception=disabled,stacksmash=disabled,ssl=all,mmu=4816,non32xfer=fast,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 digital-clock-esp8266
```

## Arduino library
- https://github.com/adafruit/Adafruit_Sensor
- https://github.com/adafruit/DHT-sensor-library
- https://github.com/johnrickman/LiquidCrystal_I2C
- https://github.com/msparks/arduino-ds1302
- https://github.com/me-no-dev/ESPAsyncTCP
- https://github.com/me-no-dev/ESPAsyncWebServer
