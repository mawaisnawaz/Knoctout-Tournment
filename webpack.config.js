var path = require("path");

var MAIN_DIR = path.resolve(__dirname, "client");

var config = {
    entry:  MAIN_DIR + "/view/client.js",
    output: {
        path: MAIN_DIR + "/",
        filename: "client.js"
    }
};

module.exports = config;