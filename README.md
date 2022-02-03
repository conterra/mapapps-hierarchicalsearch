# Hierarchical Search
The Hierarchical Search Bundle is a new Widget for searching features via a drop-down menu based on attributed values.
The menus will be filled automatically based on the attribute ID and the previous user selections.

## Build Status
[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-hierarchicalsearch/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-hierarchicalsearch/actions/workflows/devnet-bundle-snapshot.yml)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_hierarchicalsearch/index.html

![Screenshot Sample App Hierarchical Search](https://github.com/conterra/mapapps-hierarchical-search/blob/master/screenshot.JPG)

## Installation Guide
**Requirement: map.apps 4.12.0**

[dn_hierarchicalsearch Documentation](https://github.com/conterra/mapapps-hierarchicalsearch/tree/master/src/main/js/bundles/dn_hierarchicalsearch)

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
