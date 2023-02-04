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
            location.replace("setting");
        } else {
            document.getElementById("container").style.display = "block";
            main(api);
        };
    });
});

function lang(lang: string, code: string): string {
    if (lang in language) {
        if (code in language[lang]) {
            return language[lang][code];
        };
    };
    return `${lang}.${code}`;
};

function main(api: adcapi): void {
};

var language = {
    "EN": {},
    "TH": {}
} as {
    [key: string]: {
        [key: string]: string
    }
};
