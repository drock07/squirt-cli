#!/usr/bin/env node

'use strict';

const program = require('commander')
const async = require('async')

program
  .version('0.0.1', '-v, --version')
  .arguments('[templateName] [templateArguments]')
  .option('-c, --config <configPath>', 'Specify a config file')
  .option('-d, --default', 'Use default template values where available')
  .option('-tp, --templatesPath', 'Set the path to the templates')
  .parse(process.argv)

const buildConfig = require('../lib/buildSquirtConfig')(program, process.cwd())
const Squirt = require('../lib/Squirt')(program, process.cwd())

async.waterfall([
  buildConfig,
  Squirt
], function (err) {
  if (err) {
    console.log(err)
  }
})