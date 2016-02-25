'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var packagejs = require(__dirname + '/../../package.json');

// Stores JHipster variables
var jhipsterVar = {moduleName: 'webapp-ui'};

// Stores JHipster functions
var jhipsterFunc = {};

var myBase = yeoman.Base.extend({

  /*All common methods are declared here*/

  writeFilesForMethodGroup : function(current, method) {
    if(this.propertyspec.methodGroups != null) {
      for (var m = 0; m < this.propertyspec.methodGroups.length; m++) {
        if(this.propertyspec.methodGroups[m].type != method.methodType) {
          continue;
        }
        var methodGroup = this.propertyspec.methodGroups[m];
        /*perform the mentioned operation on the method*/
        if(methodGroup.operations != null) {
          for (var op = 0; op < methodGroup.operations.length; op++) {
            var operation = methodGroup.operations[op]
            var filename = operation.targetFilename
            filename = filename.toString().split("<current.entityNameLowerCase>").join(current.entityName.toLowerCase());
            filename = filename.toString().split("<current.entityName>").join(current.entityName);
            filename = filename.toString().split("<method.targetEntity>").join(method.targetEntity);
            this.log('Writing to: ' + filename)

            /*Copy the reference match and insertion codes to temp files to insert context attributes*/
            this.fs.copyTpl(this.templatePath(operation.target), this.templatePath('temp/' + operation.target), { baseVar:this, current: current, method: method });
            var targetContent = this.fs.read(this.templatePath('temp/' + operation.target));
            var originalContent = this.fs.read(this.destinationPath(filename));
            
            if(operation.action == 'replaceByRegEx') {
              /* Remove the content of regular expression and insert new content */
              originalContent = originalContent.replace(new RegExp(operation.regEx), "");
              if(originalContent.indexOf(targetContent) == -1) {
                this.log('Replacing by regular expression: ' + operation.regEx)
                var newContent = originalContent + targetContent + "\n" + operation.append
                this.fs.write(this.destinationPath(filename), newContent)
              }
            
            } else {
              /* We are inserting or replacing contents in the file */
              this.fs.copyTpl(this.templatePath(operation.match), this.templatePath('temp/' + operation.match), { baseVar:this, current: current, method: method });
              var contentToMatch = this.fs.read(this.templatePath('temp/' + operation.match));                
              
              if(originalContent.indexOf(targetContent) == -1) {
                /*Time to write or replace them now*/          
                if(operation.action == 'append') {
                  targetContent = contentToMatch + targetContent
                } else if(operation.action == 'prepend') {
                  targetContent = targetContent + contentToMatch
                }
                if(originalContent.indexOf(contentToMatch) == -1) {
                  this.log(chalk.red('ERROR: Could not match following content in file:') + chalk.yellow(filename) + chalk.red(' from template: ' + operation.match));
                  this.log(chalk.yellow(contentToMatch))
                  this.log('Proceeding to next operation...')
                }
                var newContent
                if(operation.replace == 'all') {
                  // Replace all occurances
                  newContent = originalContent.toString().split(contentToMatch).join(targetContent);
                } else {
                  // Replace only first match
                  newContent = originalContent.toString().replace(contentToMatch, targetContent);
                }
                this.fs.write(this.destinationPath(filename), newContent)
                this.log("Done.")
              } else {
                this.log("Nothing to do... Code changes are already present")
              }
            }
          }
        }
      }
    }
  },

  writeUIComponentsHtml : function (targetPath, current) {
    /*This method is called recursivcely for all UI components embedded within each other*/
    this.current = current;    
    this.log('Writing compoennt: ' + current.uicomponent)
    var currentUIComponent = current.uicomponent;
    var fileName = current.entityName + '.' + currentUIComponent + ".html";
    this.log(current.entityEnumeration)
    this.template('components/component' + currentUIComponent + ".html", targetPath + fileName, this, {});    
    this.log('Writing to: ' + targetPath + fileName)
     /* @Fixme For some reason, the charcters like ' get converted to &#**; 
     Writing code to replace them with ' back again*/
    var originalContent = this.fs.read(this.destinationPath(targetPath + fileName));
    originalContent = originalContent.replace(new RegExp("&#[0-9]*;", "g"), "'");
    this.fs.write(this.destinationPath(targetPath + fileName), originalContent)

    /*Write all the properties for this UI Component */
    var matchFile = 'properties_match.html'
    if(current.properties != null) {
      for (var i = 0; i < current.properties.length; i++) {
        var property = current.properties[i];
        this.log('Writing property: ' + property.name)
        var append = 'components/properties' + currentUIComponent + ".html"      
        var contentToInsert = this.fs.read(this.templatePath(append));
        contentToInsert = contentToInsert.toString().split("property.name").join(property.name);
        contentToInsert = contentToInsert.toString().split("counter").join(current.counter);
        this.insertCodeSnippetByGivenData(targetPath + fileName, contentToInsert, matchFile)         
      }
    }

    if(current.methods != null) {
      for (var i = 0; i < current.methods.length; i++) {
        var method = current.methods[i];
        this.method = method

        this.writeFilesForMethodGroup(current, method)
      }
    }

    /*Write all the nested UI components under this component*/
    if(current.embeddedComponents != null) {
      for (var i = 0; i < current.embeddedComponents.length; i++) {
        /* write an ng-include statement in the parent component first to include the nested component */
        var nestedComponent = current.embeddedComponents[i];
        var contentToInsert = this.fs.read(this.templatePath('nginclude-insert.html'));
        contentToInsert = contentToInsert.toString().split("uicomponent").join(nestedComponent.uicomponent);
        contentToInsert = contentToInsert.toString().split("entityName").join(nestedComponent.entityName);
        contentToInsert = contentToInsert.toString().split("wrappingClass").join(nestedComponent.wrappingClass);
        this.insertCodeSnippetByGivenData(targetPath + fileName, contentToInsert, matchFile)
        /* recusrive call to create html file for nested component */
        this.writeUIComponentsHtml(targetPath, nestedComponent)
      }
    } 
  },
  insertCodeSnippet : function (origFile, insertFile, matchFile) {
    var contentToInsert = this.fs.read(this.templatePath(insertFile));
    this.insertCodeSnippetByGivenData(origFile, contentToInsert, matchFile)
  },
  insertCodeSnippetByGivenData : function (origFile, contentToInsert, matchFile) {
    var originalContent = this.fs.read(this.destinationPath(origFile));
    if(originalContent.indexOf(contentToInsert) == -1) {      
      var contentToMatch = this.fs.read(this.templatePath(matchFile));
      var newContent = originalContent.toString().replace(contentToMatch, contentToInsert + contentToMatch);
      this.fs.write(this.destinationPath(origFile), newContent)   
    }     
  },
  replaceCodeSnippetByGivenData : function (origFile, contentToReplace, matchFile) {
    var originalContent = this.fs.read(this.destinationPath(origFile));
    if(originalContent.indexOf(contentToReplace) == -1) { 
      var contentToMatch = this.fs.read(this.templatePath(matchFile));
      var newContent = originalContent.toString().replace(contentToMatch, contentToReplace);
      this.fs.write(this.destinationPath(origFile), newContent)   
    }     
  },
  replaceCodeSnippetByData : function (origFile, contentToReplace, contentToMatch) {
    var originalContent = this.fs.read(this.destinationPath(origFile));
    if(originalContent.indexOf(contentToReplace) == -1) { 
      var newContent = originalContent.toString().replace(contentToMatch, contentToReplace);
      this.fs.write(this.destinationPath(origFile), newContent)   
    }     
  },
  replaceCodeSnippet : function (origFile, replaceFile, matchFile) {
    var originalContent = this.fs.read(this.destinationPath(origFile));
    var contentToReplace = this.fs.read(this.templatePath(replaceFile));
    if(originalContent.indexOf(contentToReplace) == -1) {        
      var contentToMatch = this.fs.read(this.templatePath(matchFile));
      var newContent = originalContent.toString().replace(contentToMatch, contentToReplace);
      this.fs.write(this.destinationPath(origFile), newContent)   
    }     
  }
});

module.exports = myBase.extend({

  /*Real module generator code called in order automatically*/

  initializing: {
    compose: function (args) {
      this.composeWith('jhipster:modules',
        {
          options: {
            jhipsterVar: jhipsterVar,
            jhipsterFunc: jhipsterFunc
          }
        },
        this.options.testmode ? {local: require.resolve('generator-jhipster/modules')} : null
      );
    },
    displayLogo: function () {
      // Have Yeoman greet the user.
      this.log('Welcome to the ' + chalk.red('JHipster webapp-ui') + ' generator! ' + chalk.yellow('v' + packagejs.version + '\n'));
    }
  },

  prompting: function () {
    var done = this.async();

    var prompts = [{
      type: 'input',
      name: 'message',
      message: 'We recommend running this module, when your entity model is done. Do you want to continue (y/n):',
      default: 'n'
    }];

    this.prompt(prompts, function (props) {
      this.props = props;     
      // To access props later use this.props.someOption;
      console.log(props.message)
      if(props.message == 'y')
        done();
      else 
        return
    }.bind(this));
  },

  writing: {
    readJSON: function () {      
      this.log('Reading the JSON spec for UI...');
      this.uispec = this.fs.readJSON(this.templatePath('uispec.JSON'));       
      this.propertyspec = this.fs.readJSON(this.templatePath('propertyspec.JSON'));       
      this.current = this.uispec.embeddedComponents[0]
    },

    writeTemplates : function () {
      this.log('Copying common template files...');
      this.baseName = jhipsterVar.baseName;
      this.packageName = jhipsterVar.packageName;
      this.angularAppName = jhipsterVar.angularAppName;
      var javaDir = jhipsterVar.javaDir;
      var resourceDir = jhipsterVar.resourceDir;
      var webappDir = jhipsterVar.webappDir;

      this.log('baseName=' + this.baseName);
      this.log('packageName=' + this.packageName);
      this.log('angularAppName=' + this.angularAppName);

      this.template('src', 'src', this, {});
    },

    generateUIComponents : function () {
      var targetPath = 'src/main/webapp/scripts/app/screens/customView/';
      for (var c = 0; c < this.uispec.embeddedComponents.length; c++) {
        this.current = this.uispec.embeddedComponents[c]
        this.writeUIComponentsHtml(targetPath, this.current);
      }
    },

    appendJavascriptDeclarations : function () {
      var origFile = 'src/main/webapp/index.html'
      var insertFile = 'index_insert.html'
      var matchFile = 'index_match.html'
      this.insertCodeSnippet(origFile, insertFile, matchFile);  
    },

    updateNavBar : function (origFile, insertFile, matchFile) {
      var origFile = 'src/main/webapp/scripts/components/navbar/navbar.html'
      var insertFile = 'navbar_insert.html'
      var matchFile = 'navbar_match.html'
      this.insertCodeSnippet(origFile, insertFile, matchFile);
      var replaceFile = 'navbar_replace2.html'
      matchFile = 'navbar_match2.html'
      this.replaceCodeSnippet(origFile, replaceFile, matchFile);
    },

    registering: function () {
      try {
        jhipsterFunc.registerModule("generator-jhipster-webapp-ui", "entity", "post", "app", "advanced ui screens for the project being generated by jhipster");
      } catch (err) {
        this.log(chalk.red.bold('WARN!') + ' Could not register as a jhipster entity post creation hook...\n');
      }
    }
  },

  install: function () {
    this.installDependencies();
  },

  end: function () {
    this.log('End of webapp-ui generator');
  }
});


