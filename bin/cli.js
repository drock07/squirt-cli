#!/usr/bin/env node

'use strict';

const program = require('commander')
const path = require('path')
const fs = require('fs-extra')
const findup = require('findup-sync')
const async = require('async')

program
  .version('0.0.1', '-v, --version')
  .arguments('[templateName]')
  .option('-c, --config <configPath>', 'Specify a config file')
  .parse(process.argv)

// CLI
// follow config arg path OR find nearest config file
function loadConfig(cb) {
  let configPath = program.config
  if (!configPath) {
    configPath = findup('.squirtrc', { cwd: process.cwd(), nocase: true })
  }
  configPath = path.resolve(configPath)

  fs.readJSON(configPath, (err, config) => {
    cb(err, path.dirname(configPath), config)
  })
}

function validateTemplatesPath(configDir, config, cb) {
  const pathsToCheck = []

  if (!config.templatesPath) {
    pathsToCheck.push(path.resolve(configDir, 'squirtTemplates'))
  } else if (Array.isArray(config.templatesPath)) {
    config.templatesPath.forEach(templatePath => pathsToCheck.push(path.resolve(templatePath)))
  } else {
    pathsToCheck.push(path.resolve(config.templatesPath))
  }

  async.each(pathsToCheck, (pathToCheck, callback) => {
    fs.pathExists(pathToCheck, (err, exists) => {
      if (err) {
        callback(err)
      } else if (!exists) {
        callback(new Error(`templatesPath ${pathToCheck} does not exist`))
      } else {
        callback()
      }
    })
  }, err => {
    config.templatesPath = pathsToCheck
    cb(err, config)
  })
}

// CLI
// merge config with defaults
function mergeConfig(config, cb) {
  cb(null, config)
}

// CLI
// get template from arg OR launch template chooser prompt


// CLI
// prompt template values from user

// LIB
// generate files from templates

// CLI?
// write files

async.waterfall([
  loadConfig,
  validateTemplatesPath,
  mergeConfig,
  (config, cb) => {
    console.log(config)
    cb()
  }
], function (err) {
  if (err) {
    console.log(err)
  }
})