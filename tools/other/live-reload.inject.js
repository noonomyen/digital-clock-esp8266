{
    let retry = 0;
    let server_addr = "";
    let retry_delay = 1000;
    let retry_limit = 120;
    /**
     * @param {string} addr
     */
    function live_reloader(addr) {
        if (retry > retry_limit) {
            console.log("[live-reload] please refresh the page again.");
            return;
        };
        if (addr == null) {
            addr = server_addr;
        } else {
            server_addr = addr;
        };
        try {
            if (retry != 0) {
                console.log(`[live-reload] retry - ${retry}`);
            };
            let wsc = new WebSocket(addr);
            wsc.onopen = () => {
                if (retry != 0) {
                    location.reload();
                };
                console.log("[live-reload] connected to server");
            };
            wsc.onmessage = (message) => {
                if (message.data.toString() == "RELOAD") {
                    location.reload();
                };
            };
            wsc.onclose = wsc.onerror = () => {
                retry += 1;
                setTimeout(live_reloader, retry_delay);
            };
        } catch {
            retry += 1;
            setTimeout(live_reloader, retry_delay);
        };
    };
};