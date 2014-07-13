# Breach Module Manager

This is a module manager for [Breach - the hackable browser](http://breach.cc/). It uses [NPM](http://npmjs.org) as a base for module discovery. Add the keyword `breach-module` to your NPM module and it can be install through the manager.

__STATE: NOT USABLE__

## TODO

* Create interface :)
* Use own cache for modules instead of `$HOME/.npm/-/all/.cache.json`
* Looking into making it a streaming implementation, since files are big and interface needs updating.
* Look into hooking it up to core somehow.