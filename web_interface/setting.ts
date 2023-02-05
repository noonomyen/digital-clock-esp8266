document.getElementById("status").innerText = "Connecting...";
document.getElementById("STATUS").style.display = "flex";

import adcapi from "./api.js";

var api = new adcapi(`ws://${window.location.host}/wsapi`);

// @ts-ignore
_adcapi = adcapi;
// @ts-ignore
_api = api;

api.onopen(() => {
    document.getElementById("container").style.display = "block";
    main(api);
});

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

async function set_onclick(api: adcapi) {
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
};

function main(api: adcapi): void {
    set_onclick(api);

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
            if (err) {
                //
            } else {
                document.getElementById("wifi-status_status").innerText = res.status;
                document.getElementById("wifi-status_ssid").innerText = res.ssid;
                document.getElementById("wifi-status_mac").innerText = res.mac;
                let dhcp = "disable";
                if (res.dhcp == true) {
                    dhcp = "enable";
                };
                document.getElementById("wifi-status_dhcp").innerText = dhcp;
                document.getElementById("wifi-status_ip").innerText = res.network.sta_ip;
                document.getElementById("wifi-status_subnet").innerText = res.network.sta_subnet;
                document.getElementById("wifi-status_gateway").innerText = res.network.sta_gateway;
                document.getElementById("wifi-status_dns-1").innerText = res.network.dns_1;
                document.getElementById("wifi-status_dns-2").innerText = res.network.dns_2;
            };
        });
    }, 1000);

    api.request("GET_CONFIG", (err: boolean, res: adcapi.Response) => {
        if (err) {
            document.getElementById("container").innerText = "Server Error : request: GET_CONFIG";
        } else {
            let loop: NodeJS.Timer;
            loop = setInterval((() => {
                if (api.websocket.readyState == WebSocket.CLOSED) {
                    document.getElementById("status").innerText = "Disconnected, please refresh this page !";
                    document.getElementById("STATUS").style.display = "flex";
                    clearInterval(loop);
                } else {
                    if (Object.keys(api.requesting).length != 0) {
                        document.getElementById("status").innerText = "In progress...";
                        document.getElementById("STATUS").style.display = "flex";
                    } else {
                        document.getElementById("STATUS").style.display = "none";
                    };
                };
            }), 50);
        };
    });

    api.request("SYSTEM_INFO", (err: boolean, res: adcapi.Response) => {
        if (err) {
            document.getElementById("container").innerText = "Server Error : request: SYSTEM_INFO";
        } else {
            document.getElementById("info_version").innerText = res.info.version;
            document.getElementById("info_build").innerText = res.info.build;
        };
    });
};
