import adcapi from "./api.js";

var api = new adcapi(`ws://${window.location.host}/wsapi`);

// @ts-ignore
_adcapi = adcapi;
// @ts-ignore
_api = api;

api.onopen(() => {
    api.request("REQUIRE_CONFIG_LIST", (err: boolean, res: adcapi.Response) => {
        if (err) {
            document.getElementById("container").innerText = "Server Error : request: REQUIRE_CONFIG_LIST";
            document.getElementById("container").style.display = "block";
        } else if (res.list.length != 0) {
            document.getElementById("container").style.display = "block";
            main(api, res.list);
        } else {
            document.getElementById("container").style.display = "block";
            main(api);
        };
    });
});

function lang(l: string, code: string): string {
    if (l in language) {
        if (code in language[l]) {
            return language[l][code];
        };
    };
    return `ERROR_${lang}.${code}`;
};

function lang_switch(l: string) {
    if (l in language) {
        for (let code in language[l]) {
            let text = language[l][code];
            document.querySelectorAll(`.lang-${code}`).forEach((element: HTMLElement) => {
                element.innerText = text;
            });
        };
    } else {
        console.log(`[lang_switch] not found lang:${l}`);
    };
};

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
};

function main(api: adcapi, require_setting?: []): void {
    set_onclick(api);

    let url_params = new URLSearchParams(window.location.search);
    if ((url_params.get("page") == null) || url_params.get("page") == "setting") {
        page_switch("setting");
    } else if (url_params.get("page") == "info") {
        page_switch("info");
    } else {
        page_switch("setting");
    };

    api.request("GET_CONFIG", (err: boolean, res: adcapi.Response) => {
        if (err) {
            document.getElementById("container").innerText = "Server Error : request: GET_CONFIG";
        } else {
            lang_switch(res.config["web.language"]);
            let loop: NodeJS.Timer;
            loop = setInterval((() => {
                if (api.websocket.readyState == WebSocket.CLOSED) {
                    document.getElementById("status").innerText = lang(res.config["web.language"], "4");
                    document.getElementById("STATUS").style.display = "flex";
                    clearInterval(loop);
                } else {
                    if (Object.keys(api.ref).length != 0) {
                        document.getElementById("status").innerText = lang(res.config["web.language"], "3");
                        document.getElementById("STATUS").style.display = "flex";
                    } else {
                        document.getElementById("STATUS").style.display = "none";
                    };
                };
            }), 100);
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

var language = {
    "EN": {
        "1": "Setting",
        "2": "Info",
        "3": "in progress...",
        "4": "Disconnected, please refresh this page !"
    },
    "TH": {
        "1": "ตั้งค่า",
        "2": "ข้อมูล",
        "3": "กำลังดำเนินการ...",
        "4": "ตัดการเชื่อมต่อแล้ว, โปรดรีเฟรชหน้านี้ !"
    }
} as {
    [key: string]: {
        [key: string]: string
    }
};
