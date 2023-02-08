import adcapi from "./api.js";

var api = new adcapi(`ws://${window.location.host}/wsapi`);

api.onopen(() => {
    document.getElementById("container").style.display = "block";
    main(api);
});

function main(api: adcapi): void {
    api.request("GET_CONFIG", (err: boolean, res: adcapi.Response) => {});
};
