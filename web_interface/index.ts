import adcapi from "./api.js";

var api = new adcapi(`ws://${window.location.host}/wsapi`);

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var set_clock_old = [null, null, null];
var set_date_old = [null, null, null, null];
var set_temp_humi_old = [null, null];

var loop_datetime: NodeJS.Timer;
var start_time: number;
var set_time: number;

api.onopen(() => {
    document.getElementById("container").style.display = "block";
    main(api);
});

function set_clock(h: number, m: number, s: number) {
    if (set_clock_old[0] != h || set_clock_old[1] != m || set_clock_old[2] != s) {
        set_clock_old = [h, m, s];

        let H: string;
        let M: string;
        let S: string;
    
        if (h < 10) {
            H = "0" + h.toString();
        } else {
            H = h.toString();
        };
    
        if (m < 10) {
            M = "0" + m.toString();
        } else {
            M = m.toString();
        };
    
        if (s < 10) {
            S = "0" + s.toString();
        } else {
            S = s.toString();
        };
    
        document.getElementById("clock_H1").innerText = H[0];
        document.getElementById("clock_H2").innerText = H[1];
        document.getElementById("clock_M1").innerText = M[0];
        document.getElementById("clock_M2").innerText = M[1];
        document.getElementById("clock_S1").innerText = S[0];
        document.getElementById("clock_S2").innerText = S[1];
    };
};

function set_date(y: number, m: number, d: number, dw: number) {
    if (set_date_old[0] != y || set_date_old[1] != m || set_date_old[2] != d || set_date_old[3] != dw) {
        set_date_old = [y, m, d, dw];
        document.getElementById("date").innerText = `${DAY[dw]}, ${MONTH[m]} ${d}, ${y}`;
    };
};

function set_temp_humi(t: number, h: number, CF: string) {
    if (set_temp_humi_old[0] != t || set_temp_humi_old[1] != h) {
        set_temp_humi_old = [t, h];
        let T = Math.floor(t);
        let H = Math.floor(h);
        document.getElementById("temperature").innerText = `${T}.${((t - T).toString() + "00").slice(0, 2)}°${CF}`;
        document.getElementById("humidity").innerText = `${H}.${((h - H).toString() + "00").slice(0, 2)}%`;
    };
};

function main(api: adcapi): void {
    api.request("GET_CONFIG", (err: boolean, res: adcapi.Response) => {
    });

    api.request("GET_DATETIME", (err: boolean, res: adcapi.Response) => {
        start_time = new Date().getTime();
        set_time = res.timestamp;
        loop_datetime = setInterval(() => {
            let ts = new Date();
            let d = new Date((ts.getTime() - start_time) + set_time + (ts.getTimezoneOffset() * 60 * 1000));
            set_clock(d.getHours(), d.getMinutes(), d.getSeconds());
            set_date(d.getFullYear(), d.getMonth(), d.getDate(), d.getDay());
        }, 50);
    });

    setInterval(() => {
        api.request("GET_DATETIME", (err: boolean, res: adcapi.Response) => {
            if (!err && res.response == "OK") {
                let ts = new Date().getTime();
                let t = (ts - start_time) + set_time;
                if (res.timestamp > (t + 10000) || res.timestamp < (t + 10000)) {
                    start_time = ts;
                    set_time = t;
                };
            }
        });
    }, 5000);

    setInterval(() => {
        api.request("GET_SENSOR", (err: boolean, res: adcapi.Response) => {
            if (!err && res.response == "OK") {
                if (res.temperature_type) {
                    set_temp_humi(res.celsius, res.humidity, "C");
                } else {
                    set_temp_humi(res.fahrenheit, res.humidity, "F");
                };
            };
        });
    }, 2000);
};
