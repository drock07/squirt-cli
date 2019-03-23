const async = require('async')
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const tmpl = require('blueimp-tmpl')

module.exports = function Squirt(cliArgs, cwd) {

  function getTemplate(config, callback) {
    const template = config.templates[cliArgs.args[0]]
    if (template) {
      callback(null, config, template)
      return
    }

    inquirer.prompt([{
      type: 'list',
      name: 'templateName',
      message: 'Which template would you like to squirt?',
      choices: Object.keys(config.templates)
    }]).then(answers => {
      callback(null, config, config.templates[answers.templateName])
    }).catch(err => callback(err))
  }

  function getTemplateValues(config, templateInfo, callback) {
    inquirer.prompt(templateInfo.script).then(answers => {
      callback(null, config, templateInfo, answers)
    }).catch(callback)
  }

  function buildFilesToWrite(config, templateInfo, values, callback) {
    async.map(Object.keys(templateInfo.files), (templateFilePath, fileDone) => {
      async.waterfall([
        function readTemplateFile(readTemplateFileDone) {
          const fullTemplateFilePath = path.resolve(config.templatesPath, templateFilePath)
          fs.readFile(fullTemplateFilePath, (err, data) => {
            readTemplateFileDone(err, data.toString())
          })
        },
        function buildTemplate(templateString, buildTemplateDone) {
          try {
            const fileContents = tmpl(templateString, values)
            buildTemplateDone(null, fileContents)
          } catch (err) {
            buildTemplateDone(err)
          }
        }
      ], function onFileFinished (_, fileContents) {
        const outputPathTemplate = templateInfo.files[templateFilePath]
        try {
          const outputPath = path.resolve(cwd, tmpl(outputPathTemplate, values))
          fileDone(null, {
            path: outputPath,
            contents: fileContents
          })
        } catch (err) {
          fileDone(err)
        }
      })
    }, function onFilesFinished(error, filesToWrite) {
      callback(error, config, filesToWrite)
    })
  }

  function writeFiles(config, filesToWrite, callback) {
    async.each(filesToWrite, (fileInfo, writeFileDone) => {
      fs.outputFile(fileInfo.path, fileInfo.contents, writeFileDone)
    }, err => {
      callback(err, config)
    })
  }

  return function (config, callback) {
    async.waterfall([
      cb => cb(null, config),
      getTemplate,
      getTemplateValues,
      buildFilesToWrite,
      writeFiles
    ], callback)
  }

}