const fs = require("fs")
const log4js = require("log4js")
const yargs = require("yargs")
const { Server } = require("./src/Server")

const argv = yargs
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
    .help()
    .alias("help", "h")
    .argv

const configName = process.env.BLOCKCHAIN_POLLER_CONFIG
const configFile = `./config/${configName}.json`

if (!fs.existsSync(configFile)) {
    throw new Error(`Missing config file ${configFile} for config name ${configName}`)
}

const config = JSON.parse(fs.readFileSync(configFile, "utf8"))

const stateFile = `state/${configName}.json`

log4js.configure({
    appenders: {
        out: {
            type: "stdout",
            layout: {
                type: "pattern",
                pattern: "[%d] [%p] %c - %x{server} %x{config}: %m",
                tokens: {
                    config: () => configName,
                    server: () => config.serverName,
                },
            },
        }
    },
    categories: {default: {appenders: ["out"], level: "info"}},
})
const logger = log4js.getLogger("Main")

const path = require("path");

config.stateFilenameAbsPath = path.resolve(stateFile)
logger.info(`Using state file ${config.stateFilenameAbsPath}`)

config.firstBlock = argv.firstBlock
config.untilBlock = argv.untilBlock
config.debug = argv.debug || false

const server = new Server(config)
server.start()

async function shutdown() {

    process.exit()
}

process.on("SIGINT", async function() {
    logger.warn("Caught interrupt signal, starting shutdown sequence")

    await shutdown()
})
process.on("SIGTERM", async function() {
    logger.warn("Caught termination signal, starting shutdown sequence")

    await shutdown()
})
