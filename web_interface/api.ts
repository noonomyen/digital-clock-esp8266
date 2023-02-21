class adcapi {
    public address: string;
    public response_timeout: number;
    public requesting: { [key: string]: [number, Function]; };
    public requesting_silent: { [key: string]: [number, Function]; };
    public websocket: WebSocket;
    public request_gc: NodeJS.Timer;
    public try_reconnect_timeout: number;
    public connection: "CONNECTING" | "CONNECTED" | "RECONNECTING" | "DISCONNECTED";
    public reconnect: NodeJS.Timer;
    public reconnect_timeout: number;

    constructor(addr: string, option: {
            response_timeout?: number,
            response_gc_delay?: number,
            try_reconnect_timeout?: number
        } = {}) {
            this.address = addr;
            this.response_timeout = option.response_timeout | 10000; // 10 sec
            this.requesting = {};
            this.requesting_silent = {};
            this.websocket = new WebSocket(addr);
            this.websocket.onmessage = this.recv.bind(this);
            this.request_gc = setInterval(this.clear_req_no_res.bind(this), option.response_gc_delay | 1000);
            this.connection = "CONNECTING";
            this.try_reconnect_timeout = option.try_reconnect_timeout | 20000; // 20 sec
            this.reconnect_timeout = 0;
            this.reconnect;
    };

    _reconnect() {
        if (this.reconnect_timeout > new Date().getTime()) {
            if ((this.websocket.readyState == WebSocket.CLOSING) || (this.websocket.readyState == WebSocket.CLOSED)) {
                this.websocket.close();
                this.websocket = new WebSocket(this.address);
                this.connection = "RECONNECTING";
            } else if (this.websocket.readyState == WebSocket.CONNECTING) {
                this.connection = "RECONNECTING";
            } else if (this.websocket.readyState == WebSocket.OPEN) {
                this.connection = "CONNECTED";
                clearInterval(this.reconnect);
            };
        } else {
            this.websocket.close();
            this.connection = "DISCONNECTED";
            clearInterval(this.reconnect);
        };
    };

    close() {
        this.websocket.close();
        clearInterval(this.request_gc);
    };

    recv(event: MessageEvent) {
        let res = JSON.parse(event.data.toString());
        if ((res.ref != null) && (res.ref in this.requesting)) {
            this.requesting[res.ref.toString()][1](false, res);
            delete this.requesting[res.ref.toString()];
        };
        if ((res.ref != null) && (res.ref in this.requesting_silent)) {
            this.requesting_silent[res.ref.toString()][1](false, res);
            delete this.requesting_silent[res.ref.toString()];
        };
    };

    clear_req_no_res(): void {
        for (let key in this.requesting) {
            if ((this.requesting[key][0] + this.response_timeout) > new Date().getTime()) {
                this.requesting[key][1](true, null);
                delete this.requesting[key];
            };
        };
        for (let key in this.requesting_silent) {
            if ((this.requesting_silent[key][0] + this.response_timeout) > new Date().getTime()) {
                this.requesting_silent[key][1](true, null);
                delete this.requesting_silent[key];
            };
        };
    };

    async request(req: adcapi.Request | string, callback: Function) {
        if (this.websocket.readyState == WebSocket.OPEN) {
            if (typeof req == "string") {
                req = {
                    request: req
                };
            };
            let time = new Date().getTime();
            let ref = time.toString() + Math.floor(Math.random() * 1000).toString();
            if (("silent" in req) && req["silent"] == true) {
                delete req["slient"];
                this.requesting_silent[ref] = [time, callback];
            } else {
                this.requesting[ref] = [time, callback];
            };
            req.ref = ref;
            this.websocket.send(JSON.stringify(req));
        } else {
            if (this.connection == "CONNECTED") {
                this.connection = "RECONNECTING";
                this.reconnect_timeout = new Date().getTime() + this.try_reconnect_timeout;
                this.reconnect = setInterval(this._reconnect.bind(this), 500);
            };
            callback(true, null);
        };
    };

    async onopen(func: Function) {
        let loop: NodeJS.Timer;
        loop = setInterval((() => {
            if (this.websocket.readyState == WebSocket.OPEN) {
                clearInterval(loop);
                this.connection = "CONNECTED";
                func();
            };
        }).bind(this), 100);
    };
};

namespace adcapi {
    export interface Config {
        "wifi.enable"?: boolean,
        "wifi.ssid"?: string,
        "wifi.password"?: string,
        "network.dhcp"?: boolean,
        "network.ip"?: string | null,
        "network.subnet"?: string | null,
        "network.gateway"?: string | null,
        "network.dns_1"?: string | null,
        "network.dns_2"?: string | null,
        "web.custom"?: boolean,
        "web.background"?: boolean,
        "web.background_color"?: string | null,
        "web.background_url"?: string | null,
        "web.font_color"?: string | null,
        "time.custom"?: boolean,
        "time.ntp_server"?: string | null,
        "time.utc_offset"?: number,
        "sensor.temperature_type"?: boolean,
        [key: string]: any
    };

    export interface Request {
        request?: string,
        config?: { "time.timestamp"?: number } | Config,
        [key: string]: any
    };

    export interface Response {
        response: string,
        ref: number,
        error?: string,
        config?: Config,
        param?: string,
        fahrenheit?: number,
        celsius?: number,
        temperature_type?: number,
        humidity?: number,
        list?: [],
        info?: {
            version: string,
            build: string
        },
        ssid?: string,
        status?: string,
        mac?: string,
        network?: {
            dhcp: boolean,
            sta_ip: string,
            sta_subnet: string,
            sta_gateway: string,
            dns_1: string,
            dns_2: string
        },
        timestamp?: number,
        utc_offset?: number,
        [key: string]: any,
    };
};

export default adcapi;
