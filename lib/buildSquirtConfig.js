const path = require('path')
const fs = require('fs-extra')
const async = require('async')
const findup = require('findup-sync')

const configFileName = '.squirtrc?(.json)'

const defaultConfig = {
    templatesPath: './squirtTemplates',
    useDefaultValues: false
}

module.exports = function(cliArgs, cwd) {
    
    function loadConfigFile(callback) {
        const configPath = cliArgs.config || findup(configFileName, { cwd, nocase: true })
        if (!configPath) {
            callback(new Error('could not find .squirtrc config file'))
            return
        }
        const absoluteConfigPath = path.resolve(configPath)
        const absoluteConfigDir = path.dirname(absoluteConfigPath)
        
        fs.readJSON(absoluteConfigPath, (err, config) => {
            callback(err, absoluteConfigDir, config)
        })
    }

    function setTemplatesPath(configDir, config, callback) {
        if (cliArgs.templatesPath) {
            config.templatesPath = path.resolve(cwd, cliArgs.templatesPath)
        } else {
            config.templatesPath = path.resolve(configDir, config.templatesPath || defaultConfig.templatesPath)
        }
        callback(null, config)
    }

    function mergeOtherSettings(config, callback) {
        config.useDefaultValues = cliArgs.default || config.useDefaultValues || defaultConfig.useDefaultValues
        callback(null, config)
    }

    return function buildConfig(callback) {
        async.waterfall([
            loadConfigFile,
            setTemplatesPath,
            mergeOtherSettings
        ], function onFinished(err, config) {
            callback(err, config)
        })
    }
}