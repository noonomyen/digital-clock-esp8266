import express from "express";
import ws from "ws";
import fs from "fs";
import path from "path";
import http from "http";
import cheerio from "cheerio";

import { exec, rmdir } from "./other/lib"

const config = {
    addr: "127.0.0.1",
    http_port: 8000,
    ws_port: 8001,
    web_interface_src: path.join(__dirname, "../web_interface"),
    loop_check_delay: 250
};

function src_build(): void {
    rmdir(path.join(__dirname, "../build/web_interface"));
    exec(`npx tsc --project ${path.join(__dirname, "../web_interface/tsconfig.json")}`);
    for (let file of fs.readdirSync(path.join(__dirname, "../web_interface"))) {
        if (file == "tsconfig.json" || file.split(".").slice(-1).toString() == "ts") {
            continue;
        };
        fs.copyFileSync(path.join(__dirname, "../web_interface", file), path.join(__dirname, "../build/web_interface", file));
    };
    if (!fs.existsSync(path.join(__dirname, "../build/web_interface/webfonts"))) {
        fs.mkdirSync(path.join(__dirname, "../build/web_interface/webfonts"));
    };
    if (!fs.existsSync(path.join(__dirname, "../build/web_interface/assets"))) {
        fs.mkdirSync(path.join(__dirname, "../build/web_interface/assets"));
    };
    fs.copyFileSync(path.join(__dirname, "../assets/Font-Awesome/css/all.css"), path.join(__dirname, "../build/web_interface/assets/font-awesome.all.css"));
    for (let file of fs.readdirSync(path.join(__dirname, "../assets/Font-Awesome/webfonts"))) {
        fs.copyFileSync(path.join(__dirname, "../assets/Font-Awesome/webfonts", file), path.join(__dirname, "../build/web_interface/webfonts", file));
    };
    console.log("[build] complete");
};

var app = express();
var wss =  new ws.Server({
    port: config.ws_port,
    host: config.addr
});

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
            let $ = cheerio.load(fs.readFileSync(file, { encoding: "utf-8" }));
            // live reload script
            $("body").append("<script>" + live_reload_inject_js + "</script>");
            $("body").append(`<script>live_reloader(\"ws://${config.addr}:${config.ws_port}\")</script>`);
            res.setHeader("Content-Type", "text/html");
            res.status(200).send($.html());
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

var ws_connection: { [key: string]: ws.WebSocket } = {};

class simulate_config {
    public data: {
        "wifi.enable": boolean,
        "wifi.ssid": string | null,
        "wifi.password": string | null,
        "network.dhcp": boolean,
        "network.ip": string | null,
        "network.subnet": string | null,
        "network.gateway": string | null,
        "network.dns_1": string | null,
        "network.dns_2": string | null,
        "web.custom": boolean,
        "web.background": string | null,
        "web.background_url": string | null,
        "web.font_color": string | null,
        "web.font_size": number,
        "web.dark_mode": boolean,
        "time.custom": boolean,
        "time.ntp_server_1": string | null,
        "time.ntp_server_2": string | null,
        "time.utc_offset": number | null,
        "sensor.temperature_type": number,
        [key: string]: any
    };

    constructor() {
        this.data = {
            "wifi.enable": false,
            "wifi.ssid": null,
            "wifi.password": null,
            "network.dhcp": true,
            "network.ip": null,
            "network.subnet": null,
            "network.gateway": null,
            "network.dns_1": null,
            "network.dns_2": null,
            "web.custom": false,
            "web.background": null,
            "web.background_url": null,
            "web.font_color": null,
            "web.font_size": 60,
            "web.dark_mode": false,
            "time.custom": false,
            "time.ntp_server_1": null,
            "time.ntp_server_2": null,
            "time.utc_offset": null,
            "sensor.temperature_type": 1
        };
    };

    require_setup_list(): string[] {
        let list: string[] = [];

        if ((this.data["wifi.ssid"] == null) || (this.data["wifi.password"] == null)) {
            list.push("WIFI")
        };

        if (this.data["network.dhcp"] == false) {
            if ((
                (this.data["network.ip"] == null) ||
                (this.data["network.subnet"] == null) ||
                (this.data["network.gateway"] == null) ||
                (this.data["network.dns_1"] == null) ||
                (this.data["network.dns_2"] == null)
            ) == null) {
                list.push("NETWORK");
            };
        };

        if (this.data["web.custom"] == true) {
            if (
                ((this.data["web.background"] == null) &&
                (this.data["web.background_url"] == null)) ||
                (this.data["web.font_color"] == null)
            ) {
                list.push("WEB");
            };
        };

        if (this.data["time.custom"] == false) {
            if ((
                (this.data["time.ntp_server_1"] == null) ||
                (this.data["time.ntp_server_2"] == null) ||
                (this.data["time.utc_offset"] == null)
            ) == null) {
                list.push("TIME");
            };
        };

        return list;
    }
};

var simulate = new simulate_config();
var simulate_time_hw = new Date().getTime();
var simulate_time_set = 0;

wss.on("connection", (socket: ws.WebSocket, req: http.IncomingMessage) => {
    // filter
    if (req.socket.remoteAddress != undefined && (req.socket.remoteAddress == config.addr)) {
        console.log(`WebSocket ALLOW - ${req.socket.remoteAddress}:${req.socket.remotePort}`);
        let sessionId = req.headers['sec-websocket-key']?.toString();
        if (sessionId) {
            ws_connection[sessionId] = socket;
            socket.on("message", (message: ws.RawData) => {
                try {
                    let req = JSON.parse(message.toString());
                    if (req.request == "REQUIRE_SETUP_LIST") {
                        console.log(`WebSocket - [${sessionId}] - REQUIRE_SETUP_LIST`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            list: simulate.require_setup_list()
                        }));
                    } else if (req.request == "SET_CONFIG") {
                        console.log(`WebSocket - [${sessionId}] - SET_CONFIG`);
                        if (req.config["time.timestamp"]) {
                            let timestamp = Number(req.config["time.timestamp"]);
                            simulate_time_hw = new Date().getTime();
                            simulate_time_set = timestamp;
                        };
                        for (let key in req.config) {
                            if (key in simulate.data) {
                                simulate.data[key.toString()] = req.config[key];
                            };
                        };
                    } else if (req.request == "GET_CONFIG") {
                        console.log(`WebSocket - [${sessionId}] - GET_CONFIG`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            config: simulate.data
                        }));
                    } else if (req.request == "GET_SENSOR") {
                        console.log(`WebSocket - [${sessionId}] - GET_SENSOR`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            fahrenheit: 77.0,
                            celsius: 25.0,
                            temperature_type: simulate.data["sensor.temperature_type"],
                        }));
                    } else if (req.request == "GET_DATETIME") {
                        console.log(`WebSocket - [${sessionId}] - GET_DATETIME`);
                        socket.send(JSON.stringify({
                            response: "OK",
                            ref: req.ref,
                            timestamp: (new Date().getTime() - simulate_time_hw) + simulate_time_set,
                            utc_offset: simulate.data["time.utc_offset"]
                        }));
                    } else if (req.request == "RESET_CONFIG") {
                        console.log(`WebSocket - [${sessionId}] - RESET_CONFIG`);
                        simulate = new simulate_config();
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
            if (ws_connection[key].readyState == ws.OPEN) {
                src_build();
                ws_connection[key].send("RELOAD");
            } else if (ws_connection[key].readyState == ws.CLOSED) {
                delete ws_connection[key];
            };
        };
    };
}, config.loop_check_delay);

app.listen(config.http_port, config.addr, () => {
    src_build();
    console.log(`Server is listening at [HTTP ${config.addr}:${config.http_port}] [WS ${config.addr}:${config.ws_port}]`);
});
