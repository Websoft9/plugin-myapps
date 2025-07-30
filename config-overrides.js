
const {
    override,
    addWebpackExternals,
} = require('customize-cra')

module.exports = override(
    addWebpackExternals({
        "cockpit": "cockpit"
    }),
    (config, env) => {
        config.devtool = false;
        return config;
    }
)
