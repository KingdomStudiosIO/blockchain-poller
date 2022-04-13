const log4js = require("log4js");
const yargs = require("yargs");
const { Server } = require("./src/Server")

const argv = yargs
    .option("configName", {
        alias: "c",
        description: "Which config to use, ex: harmony-mainnet",
        type: "string"
    })
    .option("firstBlock", {
        alias: "f",
        description: "Begin processing at block number",
        type: "integer"
    })
    .option("untilBlock", {
        alias: "u",
        description: "Process blocks until block number (but not including)",
        type: "integer"
    })
    .option("debug", {
        alias: "d",
        description: "Print debug information about transactions",
        type: "boolean"
    })
    .demandOption(["configName"], "Please provide config name")
    .help()
    .alias("help", "h")
    .argv

const configName = argv.configName
const logFile = `logs/${configName}.log`

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        default: {
            type: "dateFile",
            filename: logFile,
            pattern: 'yyyy-MM-dd',
            numBackups: 60,
            compress: true,
        }

    },
    categories: {default: {appenders: ["out","default"], level: "info"}}
});

const configFile = `./${configName}-config.json`
const stateFile = `state/${configName}-state.json`


const config = require(configFile)
const path = require("path");

config.stateFilenameAbsPath = path.resolve(stateFile)

config.firstBlock = argv.firstBlock
config.untilBlock = argv.untilBlock
config.debug = argv.debug || false

const server = new Server(config)
server.start()
