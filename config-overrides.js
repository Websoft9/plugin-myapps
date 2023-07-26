const CockpitRsyncPlugin = require("./src/lib/cockpit-rsync-plugin");

const {
    override,
    addWebpackExternals,
} = require('customize-cra')

module.exports = override(
    addWebpackExternals({
        "cockpit": "cockpit"
    }),
)
