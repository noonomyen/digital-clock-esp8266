class adcapi {
    public response_timeout: number;
    public ref: { [key: string]: [number, Function]; };
    public websocket: WebSocket;
    public request_gc: NodeJS.Timer;

    constructor(addr: string) {
        this.response_timeout = 10000;
        this.ref = {};
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
        if ((res.ref != null) && (res.ref in this.ref)) {
            this.ref[res.ref.toString()][1](false, res);
            delete this.ref[res.ref.toString()];
        };
    };

    clear_req_no_res(): void {
        for (let key in this.ref) {
            if ((this.ref[key][0] + this.response_timeout) > new Date().getTime()) {
                this.ref[key][1](true, null);
                delete this.ref[key];
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
        let _ref = time.toString() + Math.floor(Math.random() * 1000).toString();
        this.ref[_ref] = [time, callback];
        req.ref = _ref;
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
        config?: { [key: string]: any },
        param?: string,
        fahrenheit?: number,
        celsius?: number,
        temperature_type?: number,
        humidity?: number,
        list?: [],
        [key: string]: any,
    };
};

export default adcapi;
