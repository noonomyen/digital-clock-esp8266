import express from "express";
import WebSocket from "ws";
import fs from "fs";
import path from "path";
import http from "http";
import cheerio from "cheerio";
import expressWs from "express-ws";

import { exec, rmdir, src_build } from "./other/lib"

const config = {
    addr: "127.0.0.1",
    port: 8000,
    web_interface_src: path.join(__dirname, "../web_interface"),
    loop_check_delay: 250,
    live_reload_enable: true
};

var { app } = expressWs(express());

var live_reload_inject_js = fs.readFileSync(path.join(__dirname, "other/live-reload.inject.js"), { encoding: "utf-8" }).toString();

// filter
app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.socket.remoteAddress != undefined && (req.socket.remoteAddress == config.addr)) {
        console.log(`HTTP ALLOW - ${req.socket.remoteAddress}:${req.socket.remotePort} | ${req.method} ${req.url}`);
        next();
    } else {
        console.log(`HTTP DENY - ${req.socket.remoteAddress}:${req.socket.remotePort} | ${req.method} ${req.url}`);
        res.status(403);
        res.end();
    };
});

var ws_connection: { [key: string]: WebSocket.WebSocket } = {};

class simulate_config {
    public wifi: {
        ssid: string,
        password: string
    };
    public network: {
        dhcp: boolean,
        sta_ip: string,
        sta_subnet: string,
        sta_gateway: string,
        dns_1: string,
        dns_2: string
    };
    public wifi_mac: string;
    public wifi_status: string;
    public data: {
        "wifi.enable": boolean,
        "wifi.ssid": string,
        "wifi.password": string,
        "network.dhcp": boolean,
        "network.ip": string | null,
        "network.subnet": string | null,
        "network.gateway": string | null,
        "network.dns_1": string | null,
        "network.dns_2": string | null,
        "web.custom": boolean,
        "web.background": boolean,
        "web.background_color": string | null,
        "web.background_url": string | null,
        "web.font_color": string | null,
        "web.dark_mode": boolean,
        "time.custom": boolean,
        "time.ntp_server_1": string | null,
        "time.ntp_server_2": string | null,
        "time.utc_offset": number,
        "sensor.temperature_type": boolean,
        [key: string]: any
    };

    constructor() {
        this.data = {
            "wifi.enable": false,
            "wifi.ssid": "",
            "wifi.password": "",
            "network.dhcp": true,
            "network.ip": null,
            "network.subnet": null,
            "network.gateway": null,
            "network.dns_1": null,
            "network.dns_2": null,
            "web.custom": false,
            "web.background": false,
            "web.background_color": null,
            "web.background_url": null,
            "web.font_color": null,
            "web.dark_mode": false,
            "time.custom": false,
            "time.ntp_server_1": "time.google.com",
            "time.ntp_server_2": "time.cloudflare.com",
            "time.utc_offset": 0,
            "sensor.temperature_type": true
        };

        this.wifi = {
            ssid: "simulate",
            password: "12345678"
        }
        this.network = {
            dhcp: true,
            sta_ip: "",
            sta_subnet: "",
            sta_gateway: "",
            dns_1: "",
            dns_2: ""
        };
        this.wifi_mac = "00:00:00:00:00:00";
        this.wifi_status = "IDLE_STATUS";
        this.connect_wifi();
    };

    require_config_list(): string[] {
        let list: string[] = [];

        if (
            (this.data["wifi.enable"] == true) &&
            (this.data["wifi.ssid"] == "")
        ) {
            list.push("WIFI")
        };

        if (
            (this.data["network.dhcp"] == false) &&
            (
                (this.data["network.ip"] == null) ||
                (this.data["network.subnet"] == null) ||
                (this.data["network.gateway"] == null) ||
                (this.data["network.dns_1"] == null) ||
                (this.data["network.dns_2"] == null)
            )
        ) {
            list.push("NETWORK");
        };

        if (
            (this.data["web.custom"] == true) &&
            (
                (
                    (this.data["web.background"] == null) &&
                    (this.data["web.background_url"] == null)
                ) ||
                (this.data["web.font_color"] == null)
            )
        ) {
            list.push("WEB");
        };

        if (
            (this.data["time.custom"] == false) &&
            (
                (this.data["time.ntp_server_1"] == null) ||
                (this.data["time.ntp_server_2"] == null) ||
                (this.data["time.utc_offset"] == null)
            )
        ) {
            list.push("TIME");
        };

        return list;
    };

    connect_wifi() {
        this.network.dhcp = this.data["network.dhcp"];
        if (
            (this.data["wifi.enable"] == true) &&
            (
                (this.data["wifi.ssid"] == this.wifi.ssid) &&
                (this.data["wifi.password"] == this.wifi.password)
            )
        ) {
            this.wifi_status = "CONNECTED";
        } else if (
            (this.data["wifi.enable"] == true) &&
            (this.data["wifi.ssid"] != this.wifi.ssid)
        ) {
            this.wifi_status = "NO_SSID_AVAIL";
        } else if (
            (this.data["wifi.enable"] == true) &&
            (
                (this.data["wifi.ssid"] == this.wifi.ssid) &&
                (this.data["wifi.password"] != this.wifi.password)
            )
        ) {
            this.wifi_status = "CONNECT_WRONG_PASSWORD";
        } else if (this.data["wifi.enable"] == false) {
            this.wifi_status = "DISABLE";
        } else {
            this.wifi_status = "CONNECT_FAILED";
        };
        console.log(`[simulate] WiFi status ${this.wifi_status}`);
        if (this.data["network.dhcp"]) {
            if (this.data["wifi.enable"]) {
                this.network = {
                    dhcp: true,
                    sta_ip: "10.10.10.2",
                    sta_subnet: "255.255.255.0",
                    sta_gateway: "10.10.10.1",
                    dns_1: "1.1.1.1",
                    dns_2: "8.8.8.8"
                };
            } else {
                this.network = {
                    dhcp: true,
                    sta_ip: "",
                    sta_subnet: "",
                    sta_gateway: "",
                    dns_1: "",
                    dns_2: ""
                };
            };
        } else {
            this.network = {
                dhcp: this.data["network.dhcp"],
                sta_ip: this.data["network.ip"]!.toString(),
                sta_subnet: this.data["network.subnet"]!.toString(),
                sta_gateway: this.data["network.gateway"]!.toString(),
                dns_1: this.data["network.dns_1"]!.toString(),
                dns_2: this.data["network.dns_2"]!.toString()
            };
        };
    };
};

var simulate = new simulate_config();
var simulate_time_ref = new Date().getTime();
var simulate_time_set = 0;

app.ws("/live_reload", (socket: WebSocket.WebSocket, req: http.IncomingMessage) => {
    // filter
    if (req.socket.remoteAddress != undefined && (req.socket.remoteAddress == config.addr)) {
        console.log(`WebSocket ALLOW - ${req.socket.remoteAddress}:${req.socket.remotePort}`);
        let sessionId = req.headers['sec-websocket-key']?.toString();
        if (sessionId) {
            console.log(`WebSocket - [${sessionId}] live reload`);
            ws_connection[sessionId] = socket;
        } else {
            socket.close();
        };
    };
});

app.ws("/wsapi", (socket: WebSocket.WebSocket, req: http.IncomingMessage) => {
    // filter
    if (req.socket.remoteAddress != undefined && (req.socket.remoteAddress == config.addr)) {
        console.log(`WebSocket ALLOW - ${req.socket.remoteAddress}:${req.socket.remotePort}`);
        let sessionId = req.headers['sec-websocket-key']?.toString();
        if (sessionId) {
            socket.on("message", (message: WebSocket.RawData) => {
                try {
                    let req = JSON.parse(message.toString());
                    if (req.request == "REQUIRE_CONFIG_LIST") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - REQUIRE_CONFIG_LIST`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            list: simulate.require_config_list()
                        }));
                    } else if (req.request == "SET_CONFIG") {
                        console.log(req.config)
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - SET_CONFIG`);
                        if (req.config["time.timestamp"]) {
                            let timestamp = Number(req.config["time.timestamp"]);
                            simulate_time_ref = new Date().getTime();
                            simulate_time_set = timestamp;
                        };
                        let request_connect_wifi = false;
                        for (let key in req.config) {
                            if (key in simulate.data) {
                                if (["wifi.enable", "wifi.ssid", "wifi.password"].indexOf(key) != -1) {
                                    request_connect_wifi = true;
                                };
                                simulate.data[key.toString()] = req.config[key];
                            };
                        };
                        if (request_connect_wifi) {
                            simulate.connect_wifi();
                        };
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref
                        }));
                    } else if (req.request == "GET_CONFIG") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - GET_CONFIG`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            config: simulate.data
                        }));
                    } else if (req.request == "GET_SENSOR") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - GET_SENSOR`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            fahrenheit: 210.2,
                            celsius: 99,
                            temperature_type: simulate.data["sensor.temperature_type"],
                            humidity: 0
                        }));
                    } else if (req.request == "GET_DATETIME") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - GET_DATETIME`);
                        let ts: number;
                        if (simulate.data["time.custom"]) {
                            ts = (new Date().getTime() - simulate_time_ref) + simulate_time_set;
                        } else {
                            ts = new Date().getTime() + (simulate.data["time.utc_offset"]);
                        };
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            timestamp: ts,
                            utc_offset: simulate.data["time.utc_offset"]
                        }));
                    } else if (req.request == "RESET_CONFIG") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - RESET_CONFIG`);
                        simulate = new simulate_config();
                        simulate_time_ref = new Date().getTime();
                        simulate_time_set = 0;
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref
                        }));
                    } else if (req.request == "SYSTEM_INFO") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - SYSTEM_INFO`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            info: {
                                version: "1.0.0 dev",
                                build: `commit_${exec("git rev-parse HEAD", true, true)}`
                            }
                        }));
                    } else if (req.request == "GET_WIFI_STATUS") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - GET_WIFI_STATUS`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            ssid: simulate.data["wifi.ssid"],
                            dhcp: simulate.data["network.dhcp"],
                            mac: simulate.wifi_mac,
                            status: simulate.wifi_status,
                            network: simulate.network
                        }));
                    } else if (req.request == "TIME_SYNC") {
                        console.log(`WebSocket - [${sessionId}] [${req.ref}] - TIME_SYNC`);
                        simulate_time_ref = new Date().getTime();
                        simulate_time_set = simulate_time_ref;
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref
                        }));
                    } else {
                        console.log(`WebSocket - [${sessionId}] [BAD_REQUEST] ? ${req.request}`);
                        socket.send(JSON.stringify({
                            response: "ERROR",
                            ref: req.ref,
                            error: "BAD_REQUEST"
                        }));
                    };
                } catch {
                    console.log(`WebSocket - [${sessionId}] [BAD_REQUEST] [ERROR]`);
                    socket.send(JSON.stringify({
                        response: "ERROR",
                        error: "BAD_REQUEST"
                    }));
                };
            });
        } else {
            socket.close();
        };
    } else {
        console.log(`WebSocket DENY - ${req.socket.remoteAddress}:${req.socket.remotePort}`);
        socket.close();
    };
});

function sum_dir_modify_time(dir: string, sum: number = 0): number {
    for (let file of fs.readdirSync(dir)) {
        file = path.join(dir, file);
        let stat = fs.statSync(file);
        sum += stat.mtimeMs;
        if (fs.statSync(file).isDirectory()) {
            sum = sum_dir_modify_time(file, sum);
        };
    };
    return sum;
};

var loop: NodeJS.Timer; // Check for file modifications and close the connection
var modify_checksum_old: number = sum_dir_modify_time(config.web_interface_src);
loop = setInterval(() => {
    let modify_time = sum_dir_modify_time(config.web_interface_src);
    if (modify_time != modify_checksum_old) {
        modify_checksum_old = modify_time;
        console.log(`Live-Reload - have modified`);
        for (let key in ws_connection) {
            if (ws_connection[key].readyState == WebSocket.OPEN) {
                src_build();
                console.log("[build] complete");
                ws_connection[key].send("RELOAD");
            } else if (ws_connection[key].readyState == WebSocket.CLOSED) {
                delete ws_connection[key];
            };
        };
    };
}, config.loop_check_delay);

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.get("*", (req: express.Request, res: express.Response) => {
    let req_path = req.path;
    if (req_path == "/") {
        req_path = "/index.html";
    };
    let file = path.join(__dirname, "../build/web_interface", req_path);
    if (!fs.existsSync(file) && (file.toString().indexOf(".") == -1)) {
        file = `${file}.html`;
    };
    if (fs.existsSync(file)) {
        let filetype = file.split(".").slice(-1).toString();
        if (filetype == "html" || filetype == "htm") {
            if (config.live_reload_enable) {
                let $ = cheerio.load(fs.readFileSync(file, { encoding: "utf-8" }));
                // live reload script
                $("body").append("<script>" + live_reload_inject_js + "</script>");
                $("body").append(`<script>live_reloader(\"ws://${config.addr}:${config.port}/live_reload\")</script>`);
                res.setHeader("Content-Type", "text/html");
                res.status(200).send($.html());
            } else {
                res.status(200).send(fs.readFileSync(file, { encoding: "utf-8" }));
            };
        } else if (filetype == "css") {
            res.setHeader("Content-Type", "text/css");
            res.status(200).send(fs.readFileSync(file, { encoding: "utf-8" }));
        } else if (filetype == "js" || filetype == "mjs") {
            res.setHeader("Content-Type", "text/javascript");
            res.status(200).send(fs.readFileSync(file, { encoding: "utf-8" }));
        } else if (filetype == "ttf" || filetype == "otf" || filetype == "woff" || filetype == "woff2") {
            res.setHeader("Content-Type", `font/${filetype}`);
            res.status(200).send(fs.readFileSync(file, { encoding: null }));
        } else {
            res.status(500).send();
        };
    } else {
        res.status(404);
    };
    res.end();
});

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(404);
    res.end();
});

app.listen(config.port, config.addr, () => {
    src_build();
    console.log("[build] complete");
    console.log(`Server is listening at ${config.addr}:${config.port}`);
});