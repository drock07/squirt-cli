#!/usr/bin/env node

'use strict';

const program = require('commander')
const path = require('path')
const fs = require('fs-extra')
const findup = require('findup-sync')
const async = require('async')
const inquirer = require('inquirer')
const tmpl = require('blueimp-tmpl')

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
  // } else if (Array.isArray(config.templatesPath)) {
  //   config.templatesPath.forEach(templatePath => pathsToCheck.push(path.resolve(templatePath)))
  } else {
    pathsToCheck.push(path.resolve(configDir, config.templatesPath))
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
function getTemplate(config, cb) {
  let template = config.templates[program.args[0]]

  if (!template) {
    inquirer.prompt([{
      type: 'list',
      name: 'templateName',
      message: 'Which template would you like to squirt?',
      choices: Object.keys(config.templates)
    }]).then(answers => {
      cb(null, config, config.templates[answers.templateName])
    })
  } else {
    cb(null, config, template)
  }

}

// CLI
// prompt template values from user
function getTemplateValues(config, template, cb) {
  inquirer.prompt(template.script).then(answers => {
    cb(null, config, template, answers)
  }).catch(cb)
}

// LIB
// generate files from templates
function buildFilesToWrite(config, templateInfo, answers, cb) {
  async.map(Object.keys(templateInfo.files), (templateFilePath, done) => {
    async.waterfall([
      function readFile(waterfallCallback) {
        const fullTemplateFilePath = path.resolve(config.templatesPath[0], templateFilePath)
        fs.readFile(fullTemplateFilePath, (err, data) => {
          waterfallCallback(err, data.toString())
        })
      },
      function buildTemplate(templateString, waterfallCallback) {
        try {
          const builtTemplate = tmpl(templateString, answers)
          waterfallCallback(null, builtTemplate)
        } catch (err) {
          waterfallCallback(err)
        }
      }
    ], (_, result) => {
      const outputPath = templateInfo.files[templateFilePath]
      try {
        const builtOutputPath = tmpl(outputPath, answers)
        const fullBuiltOutputPath = path.resolve(builtOutputPath)

        done(null, {
          path: fullBuiltOutputPath,
          contents: result
        })
      } catch (err) {
        done(err)
      }
    })
  }, (err, filesToWrite) => {
    cb(err, config, filesToWrite)
  })
}

// write files
function writeFiles(config, filesToWrite, cb) {
  async.each(filesToWrite, (fileInfo, eachCallback) => {
    fs.outputFile(fileInfo.path, fileInfo.contents, eachCallback)
  }, err => {
    cb(err, config)
  })
}

async.waterfall([
  loadConfig,
  validateTemplatesPath,
  mergeConfig,
  getTemplate,
  getTemplateValues,
  buildFilesToWrite,
  writeFiles
], function (err) {
  if (err) {
    console.log(err)
  }
})