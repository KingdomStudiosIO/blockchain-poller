const log4js = require("log4js");
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        default: {type: "file", filename: "default.log"},

    },
    categories: {default: {appenders: ["out","default"], level: "info"}}
});

const yargs = require("yargs");

const argv = yargs
    .option("config", {
        alias: "c",
        description: "Path to config file",
        type: "string"
    })
    .option("state", {
        alias: "s",
        description: "Path to state file",
        type: "string"
    })
    .demandOption(["config", "state"], "Please provide both config and state files")
    .help()
    .alias("help", "h")
    .argv


const config = require(argv.config)
const path = require("path");

const { Server } = require("./src/Server")
config.stateFilenameAbsPath = path.resolve(argv.state)

const server = new Server(config)
server.start(19972276)
