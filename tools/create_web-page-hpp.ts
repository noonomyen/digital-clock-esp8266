// build web interface

import path from "path";
import fs from "fs";

import { src_build } from "./other/lib";

src_build();

var src = {
    api_js: fs.readFileSync(path.join(__dirname, "../build/web_interface/api.js"), { encoding: "utf-8" }),
    index_html: fs.readFileSync(path.join(__dirname, "../build/web_interface/index.html"), { encoding: "utf-8" }),
    index_css: fs.readFileSync(path.join(__dirname, "../build/web_interface/index.css"), { encoding: "utf-8" }),
    index_js: fs.readFileSync(path.join(__dirname, "../build/web_interface/index.js"), { encoding: "utf-8" }),
    setting_html: fs.readFileSync(path.join(__dirname, "../build/web_interface/setting.html"), { encoding: "utf-8" }),
    setting_css: fs.readFileSync(path.join(__dirname, "../build/web_interface/setting.css"), { encoding: "utf-8" }),
    setting_js: fs.readFileSync(path.join(__dirname, "../build/web_interface/setting.js"), { encoding: "utf-8" })
};

var out = `#ifndef __WEB_PAGE_HPP__
#define __WEB_PAGE_HPP__

#include <pgmspace.h>

const char api_js[] PROGMEM = R"=====(${src.api_js})=====";

const char index_html[] PROGMEM = R"=====(${src.index_html})=====";

const char index_css[] PROGMEM = R"=====(${src.index_css})=====";

const char index_js[] PROGMEM = R"=====(${src.index_js})=====";

const char setting_html[] PROGMEM = R"=====(${src.setting_html})=====";

const char setting_css[] PROGMEM = R"=====(${src.setting_css})=====";

const char setting_js[] PROGMEM = R"=====(${src.setting_js})=====";

#endif /* __WEB_PAGE_HPP__ */`;

fs.writeFileSync(path.join(__dirname, "../digital-clock-esp8266/server.web_page.hpp"), out);

console.log(`build web_page.hpp - ${out.length} bytes`);