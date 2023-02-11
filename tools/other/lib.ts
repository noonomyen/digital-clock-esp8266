import fs from "fs";
import child_process from "child_process";
import path from "path";
import AdmZip from "adm-zip";
import tar from "tar";
import zlib from "zlib";
import request from "request";

function exec(command: string, get_result?: boolean, silent: boolean = false): any {
    let cmd = command.split(" ");
    let result = child_process.spawnSync(cmd[0], cmd.slice(1), { encoding: "utf-8" });
    console.log(`EXEC : ${command}`);
    if (result.error != null) {
        console.log(result.error);
        process.exit();
    } else {
        if (!silent) {
            process.stdout.write(result.stdout.toString());
        };
        if (get_result) {
            return result.stdout.toString().trim();
        };
    };
};

function downloadFile(url: string, filename: string, to: string, callback?: Function): void {
    let received_bytes = 0;
    let total_bytes = 0;
    let print_progress_delay = 100; // ms
    let print_progress_time = new Date().getTime();

    function print_progress(endline?: boolean): void {
        let el = "";
        if (endline) {
            el = "\n";
        };

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`downloading ${filename} - `);
        if (total_bytes) {
            process.stdout.write(`${(received_bytes / total_bytes * 100).toFixed(2)}%${el}`);
        } else {
            process.stdout.write(` - done${el}`);
        };
    };


    request
        .get(url).on("response", (response) => {
            const contentLength = response.headers["content-length"];
            if (contentLength) {
                total_bytes = Number(contentLength);;
            };
        }).on("data", (chunk) => {
            received_bytes += chunk.length;
            let time = new Date().getTime();
            if (time > print_progress_time) {
                print_progress_time = time + print_progress_delay;
                print_progress();
            };
        }).on("error", (err) => {
            console.error(err);
        }).pipe( fs.createWriteStream(path.join(to, filename)) ).on("close", () => {
            print_progress(true);
            if (callback) {
                callback();
            };
        });
};

function rmdir(dir: string, pass: boolean = false): void {
    if (pass || fs.existsSync(dir)) {
        for (let file of fs.readdirSync(dir)) {
            file = path.join(dir, file);
            if (fs.statSync(file).isDirectory()) {
                rmdir(file, true);
            } else {
                fs.rmSync(file);
            };
        };
        fs.rmdirSync(dir);
    };
};

namespace archive {
    export namespace extract {
        export function tar_gz(src: string, dest: string, callback?: Function): void {
            fs.createReadStream(src)
                .pipe(zlib.createGunzip())
                .pipe(tar.extract({ cwd: dest }))
                .on('finish', () => {
                    if (callback) {
                        callback();
                    };
                });
        };
        export function zip(src: string, dest: string, callback?: Function): void {
            let tmp = new AdmZip(src);
            tmp.extractAllTo(dest);
            if (callback) {
                callback();
            };
        };
    };

    export namespace create {
        export function zip(src: string, dest: string, new_folder: boolean = false, callback?: Function) {
            let tmp = new AdmZip();
            if (new_folder) {
                tmp.addLocalFolder(src, src.split("/").slice(-1).toString());
            } else {
                tmp.addLocalFolder(src);
            };
            tmp.writeZip(dest);
            if (callback) {
                callback();
            };
        };
    };
};

function src_build(): void {
    rmdir(path.join(__dirname, "../../build/web_interface"));
    exec(`npx tsc --project ${path.join(__dirname, "../../web_interface/tsconfig.json")}`);
    for (let file of fs.readdirSync(path.join(__dirname, "../../web_interface"))) {
        if (file == "tsconfig.json" || file.split(".").slice(-1).toString() == "ts") {
            continue;
        };
        fs.copyFileSync(path.join(__dirname, "../../web_interface", file), path.join(__dirname, "../../build/web_interface", file));
    };
};

export {
    archive,
    rmdir,
    exec,
    downloadFile,
    src_build
};