const path = require('path')
const fs = require('fs-extra')
const findup = require('findup-sync')
const inquirer = require('inquirer')
const tmpl = require('blueimp-tmpl')
const merge = require('../utils/merge')

module.exports = async function defaultCommand (options) {
  // get the config
  const configPath = options.config || findup('.squirtrc?(.json)', { nocase: true })
  if (!configPath) {
    throw new Error('could not find config file')
  }

  const resolvedConfigPath = path.resolve(configPath)
  const resolvedConfigDir = path.dirname(resolvedConfigPath)
  const configFileValues = await fs.readJSON(resolvedConfigPath)
  
  const config = merge(configFileValues, {
    useDefaultValues: options.default
  })

  // ask which template
  const { templateName } = await inquirer.prompt([{
    type: 'list',
    name: 'templateName',
    message: 'Which template would you like to squirt?',
    choices: Object.keys(config.templates)
  }])

  const templateInfo = config.templates[templateName]

  // get template values
  const templateValues = await inquirer.prompt(templateInfo.script)

  await Promise.all(Object.entries(templateInfo.files).map(async ([srcFilePath, destFileNameTemplate]) => {
    const resolvedSrcFilePath = path.resolve(resolvedConfigDir, config.templatesPath, srcFilePath)
    const srcFileContents = (await fs.readFile(resolvedSrcFilePath)).toString()
    const destFileContents = tmpl(srcFileContents, templateValues)
    const destFilePath = tmpl(destFileNameTemplate, templateValues)
    const resolvedDestFilePath = path.resolve(destFilePath)
    return fs.outputFile(resolvedDestFilePath, destFileContents)
  }))
}
