// setup arduino-cli

// https://github.com/arduino/arduino-cli/releases/tag/0.29.0
const arduino_cli = {
    "linux": {
        "x64": "https://github.com/arduino/arduino-cli/releases/download/0.29.0/arduino-cli_0.29.0_Linux_64bit.tar.gz",
        "arm64": "https://github.com/arduino/arduino-cli/releases/download/0.29.0/arduino-cli_0.29.0_Linux_ARM64.tar.gz"
    },
    "win32": {
        "x64": "https://github.com/arduino/arduino-cli/releases/download/0.29.0/arduino-cli_0.29.0_Windows_64bit.zip",
    },
    "darwin": {
        "x64": "https://github.com/arduino/arduino-cli/releases/download/0.29.0/arduino-cli_0.29.0_macOS_64bit.tar.gz",
        "arm64": "https://github.com/arduino/arduino-cli/releases/download/0.29.0/arduino-cli_0.29.0_macOS_ARM64.tar.gz"
    }
} as {
    [key: string]: {
        [key: string]: string
    }
};

import fs from "fs";
import os from "os";
import path from "path";
import CommandExists from "command-exists";

import { archive, downloadFile, rmdir, exec } from "./other/lib";

const _argv = process.argv.slice(2);
var argv = {
    arduino_cli_bin: null,
    arduino_cli_url: null,
    reset: false
} as {
    arduino_cli_bin: string | null,
    arduino_cli_url: string | null,
    reset: boolean
};


if (_argv.length != 0) {
    for (let i of _argv) {
        let tmp = i.split("=");
        if (tmp[0] == "--arduino-cli-path") {
            argv.arduino_cli_bin = tmp[1];
        } else if (tmp[0] == "--arduino-cli-url") {
            argv.arduino_cli_url = tmp[1];
        } else if (i == "--reset") {
            argv.reset = true;
        };
    };
};

const platform = os.platform().toString();
const architecture = os.arch().toString();

function setup(): void {
    // if (!fs.existsSync("./arduino/Arduino")) {
    //     fs.mkdirSync("./arduino/Arduino");
    // };
    // if (!fs.existsSync("./arduino/staging")) {
    //     fs.mkdirSync("./arduino/staging");
    // };

    console.log("update submodule");
    if (CommandExists.sync("git")) {
        if (exec("git rev-parse --is-inside-work-tree", true, true).slice(0, 4) == "true") {
            console.log("check git - ok");
            exec("git submodule update --init --recursive");
        } else {
            console.log("\nThis directory is not git repo\n");
            process.exit();
        };
    } else {
        console.log("check git - no");
        console.log("\nInstalling submodules requires git.\n");
        process.exit();
    };

    console.log("creating a library zip file");
    for (let dir of fs.readdirSync("./arduino-library")) {
        process.stdout.write(`creating : ${dir}.zip`);
        archive.create.zip(path.join("./arduino-library", dir), path.join("./tmp", dir + ".zip"), true);
        process.stdout.write(` - done\n`);
    };

    console.log("installing arduino core esp8266:esp8266@3.0.2");
    exec(`${argv.arduino_cli_bin} --verbose --config-file ./arduino-digital-clock/arduino-cli.yaml core update-index`);
    exec(`${argv.arduino_cli_bin} --verbose --config-file ./arduino-digital-clock/arduino-cli.yaml core install esp8266:esp8266@3.0.2`);

    console.log("installing arduino library");
    for (let dir of fs.readdirSync("./arduino-library")) {
        console.log(`installing : ${dir}`);
        exec(`${argv.arduino_cli_bin} --verbose --config-file ./arduino-digital-clock/arduino-cli.yaml lib install --zip-path ${path.join("./tmp", dir + ".zip")}`);
    };
};

// -------------------- start

console.log("setup - arduino-cli");

process.chdir(`${__dirname}/..`);

if (argv.reset) {
    rmdir("./arduino");
    rmdir("./tmp");
};

console.log(`platform : ${platform}`);
console.log(`architecture : ${architecture}`);

if (!fs.existsSync("./arduino")) {
    fs.mkdirSync("./arduino");
};
if (!fs.existsSync("./tmp")) {
    fs.mkdirSync("./tmp");
};

if (argv.arduino_cli_bin) {
    argv.arduino_cli_bin = path.resolve(argv.arduino_cli_bin);
    console.log(`custom arduino-cli path : ${argv.arduino_cli_bin}`);
    fs.writeFileSync("./arduino/arduino-cli.path.txt", argv.arduino_cli_bin);
    setup();
} else if ((argv.arduino_cli_url) || ((platform in arduino_cli) && (architecture in arduino_cli[platform]))) {
    let tmp: string[];
    if (argv.arduino_cli_url) {
        console.log(`custom url for arduino-cli download : ${argv.arduino_cli_url}`);
        tmp = argv.arduino_cli_url.split("/");
    } else {
        argv.arduino_cli_url = arduino_cli[platform][architecture];
        tmp = argv.arduino_cli_url.split("/");
    };

    let filename = tmp[tmp.length - 1];
    let split_dot = filename.split(".");

    downloadFile(argv.arduino_cli_url, `${filename}`, `./tmp`, () => {
        argv.arduino_cli_bin = path.resolve("./arduino/arduino-cli");
        if (platform == "win32") {
            argv.arduino_cli_bin += ".exe";
        };
        fs.writeFileSync("./arduino/arduino-cli.path.txt", argv.arduino_cli_bin);
        process.stdout.write("extracting");
        if (split_dot[split_dot.length - 1] == "gz" && split_dot[split_dot.length - 2] == "tar") {
            archive.extract.tar_gz(`./tmp/${filename}`, "./arduino", () => {
                process.stdout.write(" - done\n");
                setup();
            });
        } else if (split_dot[split_dot.length - 1] == "zip") {
            console.log(`./tmp/${filename}`);
            archive.extract.zip(`./tmp/${filename}`, "./arduino", () => {
                process.stdout.write(" - done\n");
                setup();
            });
        } else {
            console.log("\nThe file type to be extracted is not supported.\n");
            process.exit();
        };
    });
} else {
    console.log(
        "\nThere is no source to download arduino-cli for your device.\n\n" +
        "If you already have arduino-cli you can skip this step by adding --arduino-cli-path=<path>\n" +
        "or if want to use custom url --arduino-cli-url=<url>\n"
    );
    process.exit();
};
