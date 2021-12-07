const { Server } = require("./src/Server")
const log4js = require("log4js");
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        default: {type: "file", filename: "default.log"},

    },
    categories: {default: {appenders: ["out","default"], level: "info"}}
});

const config = require("./config.json")
const path = require("path");

config.stateFilenameAbsPath = path.resolve(config.stateFilename)


const server = new Server(config)
server.start(19972276)