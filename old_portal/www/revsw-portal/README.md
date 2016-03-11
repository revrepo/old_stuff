# Angular.js implementation

## Technologies used

- [Twitter Bootstrap (v.3)](http://getbootstrap.com)
- [Angular.js (v.1.4)](https://angularjs.org)
- [jQuery (v2.1.4)](https://jquery.com/)
- [Bower (Frontend package manager)](http://bower.io/)
- [Gulp.js (builder tool)](http://gulpjs.com/)
- [Less](http://lesscss.org)


## Development env.

Development environment is using [BrowserSync](http://www.browsersync.io/)
for serving application in development mode.

To run project in development mode you need to run this commands:

1. First you will need to install all dev dependencies:

```bash
npm install
bower install
```

2. You will be able to run it in dev mode

```bash
gulp serve
```

## Production mode

In production mode you will need to compile your application and minify all `.js` files.
To do this you will need to run this command:

```bash
gulp build
```

It will create a `dist` folder with optimized `index.html` and compiled `.js` and `.css` files.

## Tests

**TODO**


## Architecture

This is main styleguide for wrting Angular.js code
[Angular.js Styleguide](https://github.com/johnpapa/angular-styleguide#controllers)

## Polymer part

There are several elements from Polymer v1. And they are compiled and packed.
**I suppose you will never need this section**

But if you somehow need to add something please read carefully:

- First of all to add new elements use `polymer/elements.html` file.
- After this you will need to compile all elements using command `gulp vulcanize`
- Only after this it will start working.

**Please avoid doing anything here if you don't know how it works !**
**Polymer wouldn't bind anything to Angular.js**
**It could be used only for small UI components inserting without any data binding!**

**Again, never use anything that should bind data !!!**
