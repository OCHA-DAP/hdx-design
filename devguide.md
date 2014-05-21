---
title: HDX design
---

# hdx-design dev guide

The [hdx design demo](http://github.io/OCHA-DAP/hdx-design) is a simulated front-end experiences - prototypes / demos / simulations - as a collection of HTML5 pages using data in flat files. 

The goal of the simulation is to illustrate key user flows through HDX rather than to exhaustively document all functionality of the web application. 

## Project Links

* [Demo site](http://ocha-dap.github.io/hdx-design/)
* [Developer Guide](http://ocha-dap.github.io/hdx-design/devguide)
* [GitHub Site](https://github.com/OCHA-DAP/hdx-design)
* [Git repo](https://github.com/OCHA-DAP/hdx-design.git)
* [data for use in sim][1]

## tech front-end dev guidelines

The front-end experience recommended here will either sit on top of or adjacent to CKAN. Even though we are not creating production code we should honor [CKAN's frontend development guidelines](http://docs.ckan.org/en/latest/contributing/frontend/) where possible.  

### [CKAN HTML Coding Standards](http://docs.ckan.org/en/latest/contributing/html.html)
* html
	* multi-page app (similar to output of CKAN, which uses python and jinja2 templating)
	* responsive layout
* JavaScript
  * standards-compliant HTML5 javascript
  * feature detection rather than browser user-agent sniffing
  * consider limited bandwidth in the field, minimize reliance on frameworks where possible
  * [jQuery][2]-based where possible
  * [jshint](http://www.jshint.com/) your JavaScript code
* CSS
  * use [LESS CSS](http://lesscss.org/)

data from simulated APIs
-
Note that CKAN provides APIs to access both metadata and data - both raw data and curated data.  OCHA created [a subset of data from Colombia, Kenya, and Yemen][1] that should be used for the design.

[1] : https://github.com/luiscape/data-for-frog
[2] : http://jquery.com/
