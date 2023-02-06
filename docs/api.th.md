# API

- การตั้งค่าทั้งหมดของตัว device นั้น หลักๆทำได้เพียง 2 วิธีคือการต่อผ่าน USB Serial และการใช้ API
- API ที่ใช้กับ device จะเชื่อมต่อผ่าน Web Socket โดยทุกการสื่อสารจะใช้รูปแบบ JSON
- การส่ง API แต่ละครั้งจำเป็นต้องใช้ค่า reference ซึ่งเป็นตัวเลขอะไรก็ได้ เมื่อส่งไปแล้วตัว server จะส่งค่านั้นกลับมาด้วยเพื่อให้ client ทราบว่า คำสั่งนั้นได้รับการตอบกลับแล้ว

---

## รายการข้อกำหนดประเภทตัวแปร

### Config
| ชื่อ | ประเภท | คำอธิบาย | เงื่อนไข |
|---|---|---|---|
| `wifi.enable` | boolean | เปิดปิดการเชื่อมต่อ wifi ||
| `wifi.ssid` | string | ชื่อ wifi ||
| `wifi.password` | string | รหัสผ่าน wifi ||
| `network.dhcp` | boolean | ถ้าเปิดจะใช้การกำหนดค่าจาก dhcp แต่ถ้าปิดจะต้องกำหนดค่าเอง ||
| `network.ip` | string | ที่อยู่ IP ของ device | จะกำหนดได้ก็ต่อเมื่อ `network.dhcp` เป็น `false` |
| `network.subnet` | string | subnet ของเครือข่าย | จะกำหนดได้ก็ต่อเมื่อ `network.dhcp` เป็น `false` |
| `network.gateway` | string | gateway ของเครือข่าย | จะกำหนดได้ก็ต่อเมื่อ `network.dhcp` เป็น `false` |
| `network.dns_1` | string | ที่อยู่ DNS server หลัก | จะกำหนดได้ก็ต่อเมื่อ `network.dhcp` เป็น `false` |
| `network.dns_2` | string | ที่อยู่ DNS server สำรอง | จะกำหนดได้ก็ต่อเมื่อ `network.dhcp` เป็น `false` |
| `web.custom` | boolean | กำหนดค่าเอง ||
| `web.background` | string | สีพื้นหลัง (Hex color) | จะกำหนดได้ก็ต่อเมื่อ `web.custom` เป็น `true` |
| `web.background_url` | string| พื้นหลังเป็นรูป โดยรูปจะใช้ตามที่อยู่ URL | จะกำหนดได้ก็ต่อเมื่อ `web.custom` เป็น `true` |
| `web.font_color`| number | สีตัวอักษร (Hex color) | จะกำหนดได้ก็ต่อเมื่อ `web.custom` เป็น `true` |
| `time.custom` | boolean | กำหนดเวลาด้วยตัวเอง (ไม่ใช้ NTP) ||
| `time.timestamp` | number | เวลาที่กำหนดเอง หน่วย ms | จะกำหนดได้ก็ต่อเมื่อ `time.custom` เป็น `true` |
| `time.ntp_server_1` | string | ที่อยู่ DNS server หลัก | จะกำหนดได้ก็ต่อเมื่อ `time.custom` เป็น `false` |
| `time.ntp_server_2` | string | ที่อยู่ DNS server สำรอง | จะกำหนดได้ก็ต่อเมื่อ `time.custom` เป็น `false` |
| `time.utc_offset` | number | ค่า UTC offset หน่วย วินาที | จะกำหนดได้ก็ต่อเมื่อ `time.custom` เป็น `false` |
| `sensor.temperature_type` | number | `1 - celsius` `2 - fahrenheit` | รูบแบบอุณหภูมิ |

---

## รายการคำสั่ง

### เช็คว่าตัวอุปกรณ์นั้นถูกตั้งค่าเริ่มใช้งานแล้วหรือยัง (การตั้งค่าครั้งแรก)
#### send
```json
{
    "request": "REQUIRE_CONFIG_LIST",
    "ref": <number>
}
```
#### recv
```json
{
    "response": "OK",
    "ref":  <number>,
    "list": [<string>]
}
```
| list | config ที่ต้องกำหนด | คำอธิบาย |
|---|---|---|
| "WIFI" | `wifi.enable` `wifi.ssid` `wifi.password` | ชื่อ ssid กับรหัสผ่าน wifi |
| "NETWORK" | `network.dhcp` `network.ip` `network.subnet` `network.gateway` `network.dns_1` `network.dns_2` | การกำหนดค่าเครือข่าย |
| "WEB" | `web.custom` `web.background` `web.background_url` `web.font_color` | การกำหนดค่าเว็บที่ใช้แสดงผล |
| "TIME" | `time.custom` `time.timestamp` `time.ntp_server_1` `time.ntp_server_2` `time.utc_offset` | การกำหนดค่าเวลา |

---

### การตั้งค่าครั้งแรก หรือ กำหนดค่าทั้งหมด
#### send
- กำหนด value เป็น null หมายถึงการใช้ค่าเดิมไม่เปลี่ยนแปลง
- ถ้า wifi ไม่มี password ให้ value = "" 
```json
{
    "request": "SET_CONFIG",
    "ref": <number>,
    "config": {
        "wifi.enable": <boolean>,
        "wifi.ssid": <string>,
        "wifi.password": <string>,
        "network.dhcp": <boolean>,
        "network.ip": <string>,
        "network.subnet": <string>,
        "network.gateway": <string>,
        "network.dns_1": <string>,
        "network.dns_2": <string>,
        "web.custom": <boolean>,
        "web.background": <string>,
        "web.background_url": <string>,
        "web.font_color": <string>,
        "time.custom": <boolean>,
        "time.timestamp": <number>,
        "time.ntp_server_1": <string>,
        "time.ntp_server_2": <string>,
        "time.utc_offset": <number>,
        "sensor.temperature_type": <number>
    }
}
```

#### recv - เมื่อสำเร็จ
```json
{
    "response": "OK",
    "ref": <number>
}
```

#### recv - เมื่อไม่สำเร็จ
```json
{
    "response": "ERROR",
    "ref": <number>,
    "error": <string>,
    "param"?: <string>
}
```
| error | คำอธิบาย |
|---|---|
| REQUIRE_CONFIG | ต้องกำหนดค่าก่อน สามารถเรียกดูได้จาก `REQUIRE_CONFIG_LIST` |
| BAD_REQUEST | คำข้อไม่ถูกต้อง หรือ server ไม่สามารถแก้ปัณหาได้ |
| NO_INTERNET | ไม่สามารถเข้าถึง internet ได้ |
| NTP_ERROR | ไม่สามารถเชื่อมต่อ ntp server ได้ |
| DHCP_ERROR | ไม่สามารถเชื่อต่อ dhcp server ได้ |
| WIFI_NOT_FOUND | ไม่พบ ssid นี้ในพื้นที่ |
| WIFI_PASSWORD_INCORRECT | รหัสผ่าน wifi ไม่ถูกต้อง |
| WIFI_ERROR | เกิดข้อผิดพลาดในการเชื่อต่อ wifi |
| PARAMETER_ERROR | ค่าที่กำหนดไม่ถูกต้อง ซึ่งจะมี `"param": <string>` ระบุตามมาว่าอะไรผิด |

---

### รับการกำหนดค่าปัจจุบัน
#### send
```json
{
    "request": "GET_CONFIG",
    "ref": <number>
}
```

#### recv
- การที่ value เป็น null หมายถึงยังไม่เคยมีการกำหนดค่า
```json
{
    "response": "OK",
    "ref": <number>,
    "config": {
        "wifi.enable": <boolean>,
        "wifi.ssid": <string>,
        "wifi.password": <string>,
        "network.dhcp": <boolean>,
        "network.ip": <string>,
        "network.subnet": <string>,
        "network.gateway": <string>,
        "network.dns_1": <string>,
        "network.dns_2": <string>,
        "web.custom": <boolean>,
        "web.background": <string>,
        "web.background_url": <string>,
        "web.font_color": <string>,
        "time.custom": <boolean>,
        "time.ntp_server_1": <string>,
        "time.ntp_server_2": <string>,
        "time.utc_offset": <number>,
        "sensor.temperature_type": <number>
    }
}
```

---

### การรับค่า sensor จาก device
- sensor temperature and humidity
#### send
```json
{
    "request": "GET_SENSOR",
    "ref": <number>
}
```

#### recv
```json
{
    "response": "OK",
    "ref": <number>,
    "fahrenheit": <number>,
    "celsius": <number>,
    "temperature_type": <number>,
    "humidity": <number>
}
```

### การรับค่า datetime จาก device
#### send
```json
{
    "request": "GET_DATETIME",
    "ref": <number>
}
```

#### recv
```json
{
    "response": "OK",
    "ref": <number>,
    "timestamp": <number>,
    "utc_offset": <number>
}
```

---

### การคืนค่าเริ่มต้นของระบบ
#### send
```json
{
    "request": "RESET_CONFIG",
    "ref": <number>
}
```

#### recv
```json
{
    "response": "OK",
    "ref": <number>
}
```

### ข้อมูลระบบ
#### send
```json
{
    "request": "SYSTEM_INFO",
    "ref": <number>
}
```

#### recv
```json
{
    "response": "OK",
    "ref": <number>,
    "info": {
        "version": <string>,
        "build": <string>
    }
}
```

### สถานะ Wi-Fi
#### send
```json
{
    "request": "GET_WIFI_STATUS",
    "ref": <number>
}
```

#### recv
```json
{
    "response": "OK",
    "ref": <number>,
    "ssid": <string>,
    "mac": <string>,
    "status": <string>,
    "network": {
        "dhcp": <boolean>,
        "sta_ip": <string>,
        "sta_subnet": <string>,
        "sta_gateway": <string>,
        "dns_1": <string>,
        "dns_2": <string>
    }
}
```

| status | คำอธิบาย |
|---|---|
| DISABLE | ปิดใช้งาน |
| IDLE_STATUS | ว่าง |
| NO_SSID_AVAIL | ไม่พบ SSID ที่กำหนด |
| CONNECTED | เชื่อมต่อสำเร็จ |
| CONNECT_FAILED | เชื่อมต่อไม่สำเร็จ |
| CONNECT_WRONG_PASSWORD | รหัสผ่านไม่ถูกต้อง |
| DISCONNECTED | ตัดการเชื่อมต่อแล้ว |
