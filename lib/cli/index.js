
module.exports = async function (processArgs) {
  const program = require('commander')
  program
    .version('0.0.1', '-v, --version')
    // .arguments('[templateName] [templateArguments]')
    .option('-c, --config <configPath>', 'Specify a config file')
    .option('-d, --default', 'Use default template values where available')
  // .action(({ templateName, ...args }) => {
  //   console.log('blarf', templateName, args)
  // })

  program
    .command('init [directory]')
    .description('initialize squirt in a new directory')
    .option('--templates-path <path>', 'Path where the templates are stored')
    .option('--no-extension', 'Save without .json extension')
    .action(async (...args) => {
      await require('./initCommand').apply(this, args)
    })

  try {
    program.parse(processArgs)

    if (program.args.length < 1) {
      await require('./defaultCommand')(program)
    }
  } catch (error) {
    console.log('Error:', error.message)
  }
}
