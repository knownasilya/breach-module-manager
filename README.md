# Breach Module Manager

[![build status](http://img.shields.io/travis/mblarsen/breach-module-manager.svg)](http://travis-ci.org/mblarsen/breach-module-manager)
[![Dependencies](http://img.shields.io/david/mblarsen/breach-module-manager.svg)](https://david-dm.org/mblarsen/breach-module-manager)
[![NPM version](http://img.shields.io/npm/v/breach-module-manager.svg)](https://www.npmjs.org/package/breach-module-manager)  
[![NPM](https://nodei.co/npm/breach-module-manager.png?downloads=true)](https://nodei.co/npm/breach-module-manager/)

This is a module manager for [Breach - the hackable browser](http://breach.cc/).
It uses [NPM](http://npmjs.org) as a base for module discovery.
Add the keyword `breach-module` to your NPM module and it can be installed through the manager.

__STATE: NOT USABLE__

## TODO

* [DONE] Use own cache for modules instead of `$HOME/.npm/-/all/.cache.json`
* Create interface :)
* Look into hooking it up to core somehow, see [issue #4](https://github.com/mblarsen/breach-module-manager/issues/4).

## Contributing

```no-highlight
npm install
npm test
```

Add to breach with `local:~/breach-module-manager` via the module install input
on the `breach://modules` page. Test using the 'out' link and `npm test`. Also `npm start`
spins up the web app in stand alone mode, and you could always open the web app via
the url presented on the 'out' console.
