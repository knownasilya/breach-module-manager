# Breach Module Manager

[![build status](http://img.shields.io/travis/mblarsen/breach-module-manager.svg)](http://travis-ci.org/mblarsen/breach-module-manager) [![Dependencies](http://img.shields.io/david/mblarsen/breach-module-manager.svg
)](https://david-dm.org/mblarsen/breach-module-manager) ![NPM version](http://img.shields.io/npm/v/breach-module-manager.svg)

[![NPM](https://nodei.co/npm/breach-module-manager.png?downloads=true)](https://nodei.co/npm/breach-module-manager/)


This is a module manager for [Breach - the hackable browser](http://breach.cc/). It uses [NPM](http://npmjs.org) as a base for module discovery. Add the keyword `breach-module` to your NPM module and it can be install through the manager.

__STATE: NOT USABLE__

## TODO

* Create interface :)
* Use own cache for modules instead of `$HOME/.npm/-/all/.cache.json`
* Looking into making it a streaming implementation, since files are big and interface needs updating.
* Look into hooking it up to core somehow.