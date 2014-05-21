---
title: HDX design
---

hdx-design dev guide
=

The [hdx design demo](http://github.io/OCHA-DAP/hdx-design) is a simulated front-end experiences - prototypes / demos / simulations - as a collection of HTML5 pages using data in flat files. 

The goal of the simulation is to illustrate key user flows through HDX rather than to exhaustively document all functionality of the web application. 

Project Links
- 
* [Demo site](http://ocha-dap.github.io/hdx-design/)
* [Developer Guide](http://ocha-dap.github.io/hdx-design/devguide)
* [GitHub Site](https://github.com/OCHA-DAP/hdx-design)
* [Git repo](https://github.com/OCHA-DAP/hdx-design.git)
* [data for use in sim][1]

dev considerations
=

CKAN front-end development guidelines
-
The front-end experience recommended here will either sit on top of or adjacent to CKAN. Even though we are not creating production code we should honor [CKAN's frontend development guidelines](http://docs.ckan.org/en/latest/contributing/frontend/) where possible.  

* [LESS CSS](http://lesscss.org/)
* [HTML Coding Standards](http://docs.ckan.org/en/latest/contributing/html.html)
* [jshint](http://www.jshint.com/) your JavaScript code

dData
-
Note that CKAN provides APIs to access both metadata and data - both raw data and curated data.  OCHA created [a subset of data from Colombia, Kenya, and Yemen][1] that should be used for the design.

[1] : https://github.com/luiscape/data-for-frog
