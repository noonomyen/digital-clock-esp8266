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
./arduino/arduino-cli --verbose --config-file ./arduino-digital-clock/arduino-cli.yaml compile --fqbn esp8266:esp8266:nodemcuv2 --build-path ./build/arduino-digital-clock arduino-digital-clock
```

## Arduino library
- https://github.com/adafruit/Adafruit_Sensor
- https://github.com/adafruit/DHT-sensor-library
- https://github.com/johnrickman/LiquidCrystal_I2C
- https://github.com/msparks/arduino-ds1302
