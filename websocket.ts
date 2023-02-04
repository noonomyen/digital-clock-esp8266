import WebSocket from "ws";
import http from "http";
import config from "./config";
import Score from "./score";
import Filter from "./filter";

interface messageObject {
    message: string,
    ref: string,
    data: any | null
};

export default function (wss: WebSocket.Server): WebSocket.Server {
    let monitor: {[key: string]: WebSocket.WebSocket} = {};

    let interval_monitor_gc: NodeJS.Timeout;
    function monitor_gc(): void {
        if (typeof wss == undefined) {
            clearInterval(interval_monitor_gc);
            return;
        };
        for (let key in monitor) {
            if (monitor[key].readyState == WebSocket.CLOSED) {
                delete monitor[key];
            };
        };
    };

    function broadcast_monitor(message: string): void {
        for (let key in monitor) {
            if (monitor[key].readyState == WebSocket.OPEN) {
                monitor[key].send(message);
            };
        };
    };

    let scores: Score.Scores = Score.read();

    wss.on("connection", (ws: WebSocket.WebSocket, req: http.IncomingMessage) => {
        console.log(`WebSocket - ${req.socket.remoteAddress}:${req.socket.remotePort} | Connecting`);
        if (Filter.WS(req)) {

            ws.on("message", (message: WebSocket.RawData) => {
                let sessionId = req.headers['sec-websocket-key'];
                let msgobj: messageObject;
                try {
                    msgobj = JSON.parse(message.toString());
                    if (msgobj.ref == null) {
                        ws.send(JSON.stringify({
                            message: "error",
                            ref: null,
                            data: null
                        }));
                        return;
                    };
                } catch {
                    ws.send(JSON.stringify({
                        message: "error",
                        ref: null,
                        data: null
                    }));
                    return;
                };

                if (msgobj.message == "REGISTER_MONITOR") {
                    if (sessionId == undefined) {
                        console.log(`[REGISTER_MONITOR] register error`);
                        ws.close();
                    } else {
                        monitor[sessionId] = ws;
                        console.log(`[REGISTER_MONITOR] register key: ${sessionId}`);
                        ws.send(JSON.stringify({
                            message: "ok",
                            ref: msgobj.ref,
                            data: null
                        }));
                    };
                } else if (msgobj.message == "GET_MONITOR_LIST") {
                    ws.send(JSON.stringify({
                        message: "ok",
                        ref: msgobj.ref,
                        data: monitor
                    }));
                } else if (msgobj.message == "XLSX_LOAD") {
                    console.log(`[XLSX_LOAD] - load file ${Score.file}`);
                    scores = Score.read();
                    ws.send(JSON.stringify({
                        message: "ok",
                        ref: msgobj.ref,
                        data: scores
                    }));
                } else if (msgobj.message == "SET_COUNTDOWN") {
                    console.log(`[SET_COUNTDOWN]`);
                    broadcast_monitor(JSON.stringify({
                        message: "SET_COUNTDOWN",
                        ref: msgobj.ref,
                        data: msgobj.data
                    }));
                } else if (msgobj.message == "START_COUNTDOWN") {
                    console.log(`[START_COUNTDOWN]`);
                    broadcast_monitor(JSON.stringify({
                        message: "START_COUNTDOWN",
                        ref: msgobj.ref,
                        data: null
                    }));
                } else if (msgobj.message == "STOP_COUNTDOWN") {
                    console.log(`[STOP_COUNTDOWN]`);
                    broadcast_monitor(JSON.stringify({
                        message: "STOP_COUNTDOWN",
                        ref: msgobj.ref,
                        data: null
                    }));
                } else if (msgobj.message == "COUNTING_SCORE") {
                    console.log(`[COUNTING_SCORE]`);
                    broadcast_monitor(JSON.stringify({
                        message: "COUNTING_SCORE",
                        ref: msgobj.ref,
                        data: null
                    }));
                } else if (msgobj.message == "COUNTED_SCORE") {
                    console.log(`[COUNTED_SCORE]`);
                    broadcast_monitor(JSON.stringify({
                        message: "COUNTED_SCORE",
                        ref: msgobj.ref,
                        data: null
                    }));
                } else if (msgobj.message == "UPDATE_SCORE") {
                } else if (msgobj.message == "SUMMARY_SCORE") {
                } else if (msgobj.message == "INIT_SOCREBOARD") {
                } else if (msgobj.message == "END_SOCREBOARD") {
                } else if (msgobj.message == "SHOW_COUNTDOWN") {
                } else if (msgobj.message == "SHOW_SCOREBOARD") {
                } else if (msgobj.message == "DISCONNECT_MONITOR") {
                    console.log(`[Control] - DISCONNECT_MONITOR`);
                    for (let key in monitor) {
                        monitor[key].close();
                        console.log(`[DISCONNECT_MONITOR] disconnect: ${key}`);
                    };
                    ws.send(JSON.stringify({
                        message: "ok",
                        ref: msgobj.ref,
                        data: null
                    }));
                } else {
                    ws.send(JSON.stringify({
                        message: "error",
                        ref: msgobj.ref,
                        data: null
                    }));
                };
            });
    
            ws.on("close", () => {
                console.log(`WebSocket - ${req.socket.remoteAddress}:${req.socket.remotePort} | Disconnected`);
            });

            console.log(`WebSocket - ${req.socket.remoteAddress}:${req.socket.remotePort} | Connected`);
        } else {
            ws.close();
            console.log(`WebSocket - ${req.socket.remoteAddress}:${req.socket.remotePort} | Disconnected`);
        };
    });

    interval_monitor_gc = setInterval(monitor_gc, 1000);

    return wss;
};