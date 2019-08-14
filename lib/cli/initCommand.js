const path = require('path')
const fs = require('fs-extra')
const tmpl = require('blueimp-tmpl')
const merge = require('../utils/merge')

module.exports = async function initCommand (directoryPath = '.', options) {
  const templatePath = path.resolve(__dirname, '../../internalTemplates/squirtConfig.json')
  const destinationFileName = '.squirtrc' + (options.extension ? '.json' : '')
  const destinationPath = path.resolve(directoryPath, destinationFileName)
  
  const templateFileContents = (await fs.readFile(templatePath)).toString()
  
  const defaultTemplateValues = {
    templatesPath: './squirtTemplates'
  }

  const templateValues = merge(defaultTemplateValues, {
    templatesPath: options.templatesPath
  })

  const destinationFileContents = tmpl(templateFileContents, templateValues)

  await fs.outputFile(destinationPath, destinationFileContents)
}
