import adcapi from "./api.js";

var api = new adcapi(`ws://${window.location.host}/wsapi`);

// @ts-ignore
_adcapi = adcapi;
// @ts-ignore
_api = api;

api.onopen(() => {
    api.request("REQUIRE_SETUP_LIST", (err: boolean, res: adcapi.Response) => {
        if (err) {
            document.getElementById("container").innerText = "Server Error : request: REQUIRE_SETUP_LIST";
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

function page_switch(page: "setting" | "info") {
    if (page == "setting") {
        document.getElementById("navbar_info").classList.remove("active");
        document.getElementById("navbar_setting").classList.add("active");
        document.getElementById("content.info").style.display = "none";
        document.getElementById("content.setting").style.display = "block";
    } else if (page == "info") {
        document.getElementById("navbar_setting").classList.remove("active");
        document.getElementById("navbar_info").classList.add("active");
        document.getElementById("content.setting").style.display = "none";
        document.getElementById("content.info").style.display = "block";
    };
};

function main(api: adcapi, require_setting?: []): void {
    document.getElementById("navbar_setting").onclick = () => {
        page_switch("setting");
    };
    document.getElementById("navbar_info").onclick = () => {
        page_switch("info");
    };

    let url_params = new URLSearchParams(window.location.search);
    if ((url_params.get("page") == null) || url_params.get("page") == "setting") {
        page_switch("setting");
    } else if (url_params.get("page") == "info") {
        page_switch("info");
    } else {
        page_switch("setting");
    };
};