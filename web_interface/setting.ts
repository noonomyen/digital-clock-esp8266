document.getElementById("status").innerText = "Connecting...";
document.getElementById("STATUS").style.display = "flex";

import adcapi from "./api.js";

var api = new adcapi(`ws://${window.location.host}/wsapi`);

const WiFiStatus = {
    "DISABLE": "disable",
    "IDLE_STATUS": "idle",
    "NO_SSID_AVAIL": "No SSID available",
    "CONNECTED": "connected",
    "CONNECT_FAILED": "failed",
    "CONNECT_WRONG_PASSWORD": "incorrect password",
    "DISCONNECTED": "disconnected"
} as {
    [key: string]: string
};

api.onopen(() => {
    document.getElementById("container").style.display = "block";
    main(api);
});

var SET_CONFIG_STATUS: [string, number] = ["", 0];

function page_switch(page: "setting" | "info") {
    if (page == "setting") {
        document.getElementById("navbar_info").classList.remove("active");
        document.getElementById("navbar_setting").classList.add("active");
        document.getElementById("content_info").style.display = "none";
        document.getElementById("content_setting").style.display = "block";
    } else if (page == "info") {
        document.getElementById("navbar_setting").classList.remove("active");
        document.getElementById("navbar_info").classList.add("active");
        document.getElementById("content_setting").style.display = "none";
        document.getElementById("content_info").style.display = "block";
    };
};

function load_and_fill_config(api: adcapi) {
    api.request("GET_CONFIG", (err: boolean, res: adcapi.Response) => {
        if (err) {
            document.getElementById("container").innerText = "ERROR [request: GET_CONFIG]";
        } else {
            (document.getElementById("wifi_enable") as HTMLInputElement).checked = res.config["wifi.enable"];
            (document.getElementById("wifi_disable") as HTMLInputElement).checked = !res.config["wifi.enable"];
            (document.getElementById("wifi_ssid") as HTMLInputElement).value = res.config["wifi.ssid"];
            (document.getElementById("wifi_password") as HTMLInputElement).value = res.config["wifi.password"];

            (document.getElementById("time_custom-enable") as HTMLInputElement).checked = res.config["time.custom"];
            (document.getElementById("time_custom-disable") as HTMLInputElement).checked = !res.config["time.custom"];
            (document.getElementById("time_ntp") as HTMLInputElement).value = res.config["time.ntp_server"];
            (document.getElementById("time_utc-offset") as HTMLInputElement).value = res.config["time.utc_offset"].toString();

            (document.getElementById("sensor_temp-c") as HTMLInputElement).checked = res.config["sensor.temperature_type"];
            (document.getElementById("sensor_temp-f") as HTMLInputElement).checked = !res.config["sensor.temperature_type"];

        };
        event_change_wifi_enable();
        event_change_time_custom();
    });
};

function event_change_time_custom() {
    if ((document.getElementById("time_custom-enable") as HTMLInputElement).checked) {
        document.getElementById("time_set").removeAttribute("disabled");
        document.getElementById("time_ntp").setAttribute("disabled", "");
        document.getElementById("time_utc-offset").setAttribute("disabled", "");
        document.getElementById("time_sync_now").style.visibility = "hidden";
    } else {
        document.getElementById("time_set").setAttribute("disabled", "");
        document.getElementById("time_ntp").removeAttribute("disabled");
        document.getElementById("time_utc-offset").removeAttribute("disabled");
        document.getElementById("time_sync_now").style.visibility = "visible";
    };
};

function event_change_wifi_enable() {
    if ((document.getElementById("wifi_enable") as HTMLInputElement).checked) {
        document.getElementById("wifi_ssid").removeAttribute("disabled");
        document.getElementById("wifi_password").removeAttribute("disabled");
    } else {
        document.getElementById("wifi_ssid").setAttribute("disabled", "");
        document.getElementById("wifi_password").setAttribute("disabled", "");
    };
};

async function set_event(api: adcapi) {
    document.getElementById("navbar_setting").onclick = () => {
        page_switch("setting");
    };
    document.getElementById("navbar_info").onclick = () => {
        page_switch("info");
    };

    document.querySelector("#navbar div.logo").addEventListener("click", () => {
        window.location.replace("/");
    });

    document.getElementById("wifi_password_hide").onclick = () => {
        document.getElementById("wifi_password_hide").style.display = "none";
        document.getElementById("wifi_password_unhide").style.display = "inline-block";
        (document.getElementById("wifi_password") as HTMLInputElement).type = "password";
    };

    document.getElementById("wifi_password_unhide").onclick = () => {
        document.getElementById("wifi_password_unhide").style.display = "none";
        document.getElementById("wifi_password_hide").style.display = "inline-block";
        (document.getElementById("wifi_password") as HTMLInputElement).type = "text";
    };

    document.getElementById("wifi_enable").addEventListener("change", event_change_wifi_enable);
    document.getElementById("wifi_disable").addEventListener("change", event_change_wifi_enable);

    document.getElementById("time_custom-enable").addEventListener("change", event_change_time_custom);
    document.getElementById("time_custom-disable").addEventListener("change", event_change_time_custom);

    document.getElementById("time_sync_now").onclick = () => {
        api.request("TIME_SYNC", (err: boolean, res: adcapi.Response) => {
            if (!err && res.response == "OK") {
                SET_CONFIG_STATUS = ["Success time sync", new Date().getTime() + (1000 * 3)];
            };
        });
    };

    document.getElementById("reset_setting").onclick = () => {
        if (window.confirm("Are you sure you want to reset the settings?")) {
            api.request("RESET_CONFIG", (err: boolean, res: adcapi.Response) => {
                if (!err && res.response == "OK") {
                    SET_CONFIG_STATUS = ["Success setting reset", new Date().getTime() + (1000 * 3)];
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                };
            });
        };
    };

    document.getElementById("cancel_setting").onclick = () => {
        window.location.reload();
    };

    document.getElementById("save_setting").onclick = () => {
        SET_CONFIG_STATUS = ["", 0];
        let tmp: adcapi.Config = {};

        tmp["wifi.enable"] = (document.getElementById("wifi_enable") as HTMLInputElement).checked;
        tmp["wifi.ssid"] = (document.getElementById("wifi_ssid") as HTMLInputElement).value;
        tmp["wifi.password"] = (document.getElementById("wifi_password") as HTMLInputElement).value;

        if ((document.getElementById("time_custom-enable") as HTMLInputElement).checked) {
            tmp["time.custom"] = true;
            let ts = (document.getElementById("time_set") as HTMLInputElement).value;
            if (ts) {
                let d = new Date(ts);
                tmp["time.timestamp"] = (d.getTime() - (d.getTimezoneOffset() * 60 * 1000)) / 1000;
            };
        } else {
            tmp["time.custom"] = false;
        };
        tmp["time.ntp_server"] = (document.getElementById("time_ntp") as HTMLInputElement).value;
        tmp["time.utc_offset"] = Number((document.getElementById("time_utc-offset") as HTMLInputElement).value);

        tmp["sensor.temperature_type"] = (document.getElementById("sensor_temp-c") as HTMLInputElement).checked;

        api.request({
            request: "SET_CONFIG",
            config: tmp
        }, (err: boolean, res: adcapi.Response) => {
            if (err) {
                SET_CONFIG_STATUS = ["ERROR [request: SET_CONFIG]", 0];
            } else {
                if (res.response == "ERROR") {
                    SET_CONFIG_STATUS = [`ERROR [response: ${res.error}]`, new Date().getTime() + (5 * 1000)];
                } else if (res.response == "OK") {
                    SET_CONFIG_STATUS = [`Successfully`, new Date().getTime() + (2 * 1000)];
                    (document.getElementById("time_set") as HTMLInputElement).value = "";
                };
            };
        })
    };
};

function main(api: adcapi): void {
    set_event(api);

    let url_params = new URLSearchParams(window.location.search);
    if ((url_params.get("page") == null) || url_params.get("page") == "setting") {
        page_switch("setting");
    } else if (url_params.get("page") == "info") {
        page_switch("info");
    } else {
        page_switch("setting");
    };

    setInterval(() => {
        api.request({
            request: "GET_WIFI_STATUS",
            silent: true
        }, (err: boolean, res: adcapi.Response) => {
            if (!err && res.response == "OK") {
                let status: string;
                if (res.status in WiFiStatus) {
                    status = WiFiStatus[res.status];
                } else {
                    status = res.status;
                };
                document.getElementById("wifi-status_status").innerText = status;
                document.getElementById("wifi-status_ssid").innerText = res.ssid;
                document.getElementById("wifi-status_mac").innerText = res.mac;
                document.getElementById("wifi-status_ip").innerText = res.network.sta_ip;
                document.getElementById("wifi-status_subnet").innerText = res.network.sta_subnet;
                document.getElementById("wifi-status_gateway").innerText = res.network.sta_gateway;
                document.getElementById("wifi-status_dns-1").innerText = res.network.dns_1;
                document.getElementById("wifi-status_dns-2").innerText = res.network.dns_2;
            };
        });
    }, 5000);

    load_and_fill_config(api);

    let loop: NodeJS.Timer;
    let status_output = 0;
    loop = setInterval((() => {
        if (api.connection == "DISCONNECTED") {
            if (status_output != 5) {
                status_output = 5;
                document.getElementById("status").innerText = "Disconnected, please refresh this page !";
                document.getElementById("STATUS").style.display = "flex";
            };
        } else if (api.connection == "RECONNECTING") {
            if (status_output != 4) {
                status_output = 4;
                document.getElementById("status").innerText = "Reconnecting...";
                document.getElementById("STATUS").style.display = "flex";
            };
        } else {
            if (SET_CONFIG_STATUS[0] != "") {
                if (SET_CONFIG_STATUS[1] < new Date().getTime()) {
                    SET_CONFIG_STATUS = ["", 0];
                } else {
                    if (status_output != 3) {
                        status_output = 3;
                        document.getElementById("status").innerText = SET_CONFIG_STATUS[0];
                        document.getElementById("STATUS").style.display = "flex";
                    };
                };
            } else if (Object.keys(api.requesting).length != 0) {
                if (status_output != 2) {
                    status_output = 2;
                    document.getElementById("status").innerText = "In progress...";
                    document.getElementById("STATUS").style.display = "flex";
                };
            } else {
                if (status_output != 1) {
                    status_output = 1;
                    document.getElementById("STATUS").style.display = "none";
                    document.getElementById("status").innerText = "";
                };
            };
        };
    }), 50);

    api.request("SYSTEM_INFO", (err: boolean, res: adcapi.Response) => {
        if (err) {
            document.getElementById("container").innerText = "ERROR [request: SYSTEM_INFO]";
        } else {
            document.getElementById("info_version").innerText = res.info.version;
        };
    });
};