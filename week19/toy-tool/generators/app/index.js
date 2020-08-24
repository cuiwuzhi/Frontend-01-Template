var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
        // Calling the super constructor is important so our generator is correctly set up
        super(args, opts);
    }
    collecting() {
        this.log('method 1 just ran');
    }
    creating(){
        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            { title: 'Templating with Yeoman' }
        );

        this.fs.copyTpl(
            this.templatePath('createElement.js'),
            this.destinationPath('lib/createElement.js')
        );

        this.fs.copyTpl(
            this.templatePath('gesture.js'),
            this.destinationPath('lib/gesture.js')
        );

        this.fs.copyTpl(
            this.templatePath('main.js'),
            this.destinationPath('src/main.js')
        );

        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath('src/index.html')
        );

        this.fs.copyTpl(
            this.templatePath('main.test.js'),
            this.destinationPath('test/main.test.js')
        );

        this.fs.copyTpl(
            this.templatePath('.nycrc.json'),
            this.destinationPath('.nycrc.json')
        );

        this.fs.copyTpl(
            this.templatePath('.babelrc.json'),
            this.destinationPath('.babelrc.json')
        );

        this.fs.copyTpl(
            this.templatePath('webpack.config.js'),
            this.destinationPath('webpack.config.js')
        );

        this.npmInstall([
            'webpack',
            'webpack-cli',
            'webpack-dev-server',
            "babel-loader",
            "@babel/core",
            "@babel/preset-env",
            "@babel/plugin-transform-react-jsx",
            "mocha",
            "nyc",
            "babel-plugin-istanbul",
            "@istanbuljs/nyc-config-babel",
            "@babel/register",
            "html-webpack-plugin"
        ], { 'save-dev': true });
    }

};