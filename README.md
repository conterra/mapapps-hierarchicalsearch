# Hierarchical Search
The Hierarchical Search Bundle is a new Widget for searching features via a drop-down menu based on attributed values.
The menus will be filled automatically based on the attribute ID and the previous user selections.

Sample App
------------------
https://demos.conterra.de/mapapps/resources/apps/downloads_hierarchicalsearch/index.html?lang=de 

![Screenshot Sample App Hierarchical Search](https://github.com/conterra/mapapps-hierarchical-search/blob/master/Screenshot.PNG)

Installation Guide
------------------
**Requirement: map.apps 4.3.0**

1. First, you need to add the bundle "dn_hierarchicalsearch" to your app.
2. After that, you can customize the content of the drop-down menus.

#### Example:

```
"bundles": {   
    "dn_hierarchicalsearch": {
      "HierarchicalsearchWidgetFactory": {
        "layerID": "your searchLayer ID",
        "fields": [
          {"id": "gemarkung_",
          "label": "Gemarkung"},
          {"id": "flur_numme",
            "label": "Flur"},
          {"id": "flurstueck",
            "label": "Flurstück"}
        ]
      }
    },
   "templates": {
         "TemplateModel": {
           "_templates": [
             {
               "name": "seasons",
               "widgets": [
                 {
                   "widgetRole": "hierarchicalsearchWidget",
                   "sublayout": [
                     "desktop",
                     "tablet_landscape",
                     "tablet_portrait"
                   ],
                   "window": {
                     "marginBox": {
                       "w": 400,
                       "h": 140,
                       "t": 115,
                       "l": 20
                     }
                   }
                 }
               ]
             }
           ]
         }
       },
```
     


#### Configurable Components of dn_welcome:
 
###### Properties
 | Property                       | Type    | Possible Values               | Default            | Description                                                      |
 |--------------------------------|---------|-------------------------------|--------------------|------------------------------------------------------------------|
 | layerID                        | String  |                               |                    | The ID of your search Layer                                      |
 | fields                         | Array   |                               |                    | Array of either 2 or 3 attribute objects                     |
 | fields.id                      | String  |                               |                    | ID of the field of the layer that should appear in the drop-down |
 | field.label                    | String  |                               |                    | Label for specified drop-down                                    |
 
#### Restrictions
For now only available for two or three cascading drop-down menus.

Development Guide
------------------
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

##### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
