Squirt
========
Squirt is a CLI code generation tool, inspired by [Reactman](https://github.com/edwinwebb/reactman),  which will take multiple templates,
populate them, and then move them into your codebase.

Squirt's goal is to save you time when developing, as well as increase consistency across development teams.

Squirt is a globally installed npm tool that uses a config file and directory of templates in the destination code base. The config file and templates can be checked into source control, giving all developers on the code base a consistent set of templates to use.

INSTALL AND USE
---------------

Install via NPM/Yarn/etc

`npm install -g squirt-cli`

Make a `.squirtrc` or `.squirtrc.json` config file from the example below. You will also need some templates files.

Go to the directory where you want to create new files, then run `squirt` in the terminal.

Note that you can optionally include the name/key of the template you want to use (as defined in the config) as the first argument. Otherwise, Squirt will ask you which one you want to use.

BASIC EXAMPLE
-------------

Squirt needs at least two files to get started, a configuration file and a
template. While useful in many situations, Squirt was built with React in mind. The following example will show how Squirt can be used to generate a set of files for a React component.

Blueimp templates are taken as the input. This will be populated via the prompt
then written to your project.

Consider the following file structure inside your `squirtTemplates` directory:

```
squirtTemplates/
  component/
    index.js
    component.js
    component.module.css
```

squirtTemplates/component/index.js:
```javascript
export { default } from './{%=o.componentName%}'

```

squirtTemplates/component/component.js:
```javascript
import React from 'react'
import PropTypes from 'prop-types'
import styles from './{%=o.componentName%}.module.css'

const {%=o.componentName%} = () => {
  return (
    <div className={styles.{%=o.rootStyleClassName%}}>
      
    </div>
  )
}

{%=o.componentName%}.propTypes = {

}

export default {%=o.componentName%}
```

squirtTemplates/component/component.module.css:
```css
.{%=o.rootStyleClassName%} {
    
}
```

The config file would then include an entry in the `templates` section, like so:

```json
"templates": {
  "component": {
    "files": {
      "component/index.js": "{%=o.componentName%}/index.js",
      "component/component.js": "{%=o.componentName%}/{%=o.componentName%}.js",
      "component/component.module.css": "{%=o.componentName%}/{%=o.componentName%}.module.css"
    },
    "script": [{
      "name": "componentName",
      "message": "Component name",
      "required": true,
      "type": "input"
    }, {
      "name": "rootStyleClassName",
      "message": "Root style class name",
      "default": "root",
      "type": "input"
    }]
  }
}
```

Squirt uses the files mapping to know which template files to use for code generation, as well as where those files should be placed, relative to the current directory the tool is running in. Note that directories in the destination path will be created if they don't already exist. 

The entries in the `script` section allow Squirt to get the template values.

Squirt will then write the populated
templates to your codebase.

```javascript
import React from 'react'
import PropTypes from 'prop-types'
import styles from './MyGeneratedComponent.module.css'

const MyGeneratedComponent = () => {
  return (
    <div className={styles.root}>
      
    </div>
  )
}

MyGeneratedComponent.propTypes = {

}

export default MyGeneratedComponent
```


TEMPLATES
------
Squirt uses BlueImp as its templating engine.

CONFIG
------
Squirt needs a `.squirtrc` or `.squirtrc.json` config file to run. Note that with or without the `.json` extension, the config file should be written as a JSON object.

* `templatesPath` defines where Reactman will look for templates
* `templates` defines the available templates
  * key : Type this at the first prompt to init the script, component in this
example
  * `files` : The files to load for templating.
    * key : The name of the template.
    * value : The output file location path, relative to the directory where Squirt is running. This path can include BlueImp templates.
  * `script` : An array of [Inquirer](https://github.com/sboudrias/Inquirer.js) prompts, used for getting template values.

Example config

```json
{
  "templatesPath": "./squirtTemplates",
  "templates": {
    "component": {
      "files": {
        "component/index.js": "{%=o.componentName%}/index.js",
        "component/component.js": "{%=o.componentName%}/{%=o.componentName%}.js",
        "component/component.module.css": "{%=o.componentName%}/{%=o.componentName%}.module.css"
      },
      "script": [{
        "name": "componentName",
        "message": "Component name",
        "required": true,
        "type": "input"
      }, {
        "name": "rootStyleClassName",
        "message": "Root style class name",
        "default": "root",
        "type": "input"
      }]
    }
  }
}
```

LICENSE
------
ISC

Copyright (c) 2019, David Rockwood

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
