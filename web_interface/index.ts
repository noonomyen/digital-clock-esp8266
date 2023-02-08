import adcapi from "./api.js";

var api = new adcapi(`ws://${window.location.host}/wsapi`);

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

function main(api: adcapi): void {
    api.request("GET_CONFIG", (err: boolean, res: adcapi.Response) => {});
};
