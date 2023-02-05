class adcapi {
    public response_timeout: number;
    public requesting: { [key: string]: [number, Function]; };
    public requesting_silent: { [key: string]: [number, Function]; };
    public websocket: WebSocket;
    public request_gc: NodeJS.Timer;

    constructor(addr: string) {
        this.response_timeout = 10000;
        this.requesting = {};
        this.requesting_silent = {};
        this.websocket = new WebSocket(addr);
        this.websocket.onmessage = this.recv.bind(this);
        this.request_gc = setInterval(this.clear_req_no_res.bind(this), 1000);
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

    async request(req: { [key: string]: any } | string , callback: Function) {
        if (typeof req == "string") {
            req = {
                request: req
            };
        };
        let time = new Date().getTime();
        let ref = time.toString() + Math.floor(Math.random() * 1000).toString();
        if (("silent" in req) && req["silent"] == true) {
            this.requesting_silent[ref] = [time, callback];
        } else {
            this.requesting[ref] = [time, callback];
        };
        req.ref = ref;
        this.websocket.send(JSON.stringify(req));
    };

    async onopen(func: Function) {
        let loop: NodeJS.Timer;
        loop = setInterval((() => {
            if (this.websocket.readyState == WebSocket.OPEN) {
                clearInterval(loop);
                func();
            };
        }).bind(this), 100);
    };
};

namespace adcapi {
    export interface Response {
        response: string,
        ref: number,
        error?: string,
        config?: {
            "wifi.enable"?: boolean,
            "wifi.ssid"?: string | null,
            "wifi.password"?: string | null,
            "network.dhcp"?: boolean,
            "network.ip"?: string | null,
            "network.subnet"?: string | null,
            "network.gateway"?: string | null,
            "network.dns_1"?: string | null,
            "network.dns_2"?: string | null,
            "web.custom"?: boolean,
            "web.background"?: string | null,
            "web.background_url"?: string | null,
            "web.font_color"?: string | null,
            "web.dark_mode"?: boolean,
            "web.language"?: string,
            "time.custom"?: boolean,
            "time.ntp_server_1"?: string | null,
            "time.ntp_server_2"?: string | null,
            "time.utc_offset"?: number,
            "sensor.temperature_type"?: number,
            [key: string]: any
        },
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
        [key: string]: any,
    };
};

export default adcapi;
