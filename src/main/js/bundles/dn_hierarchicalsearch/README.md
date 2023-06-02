# dn_hierarchicalsearch

The Hierarchical Search Bundle is a new Widget for searching features via a drop-down menu based on attributed values.
The menus will be filled automatically based on the attribute ID and the previous user selections.

## Usage

1. First, you need to add the bundle "dn_hierarchicalsearch" to your app.
2. After that, add an AGSSearch store to your app that is initialized with the help of a layerId.
3. Set the useIn property of the tool to:
```json
"useIn": [
    "selection"
],
```
4. Finally you can customize the content of the drop-down menus.
No further configuration is required, default values will be used.

## Configuration Reference

### HierarchicalSearchWidgetFactory:
```json
"dn_hierarchicalsearch": {
   "HierarchicalSearchModel": {
       "storeId": "flurstuecke_store",
       "fields": [
           {
               "name": "gemarkun_1",
               "label": "Gemarkung"
           },
           {
               "name": "flur_numme",
               "label": "Flur"
           },
           {
               "name": "flurstue_1",
               "label": "Flurstück"
           }
       ],
       "resultHandling": [
            "sendResultToResultUI"
           "sendResultToResultCenter"
       ]
   }
}
```

| Property         | Type    | Possible Values                                                      | Default                       | Description                            |
|------------------|---------|----------------------------------------------------------------------|-------------------------------|----------------------------------------|
| storeId          | String  |                                                                      |                               | The ID of your AGSSearch store         |
| fields           | Array   |                                                                      |                               | Array of search fields                 |
| field.name       | String  |                                                                      |                               | Name of the field                      |
| field.label      | String  |                                                                      |                               | Label for the drop down element        |
| resultHandling   | Array   | ```"sendResultToResultUI"``` &#124; ```"sendResultToResultCenter"``` | ```[]```                      | Array of result handling               |
| mapActions       | Array   | ```"zoomto"``` &#124; ```"openPopup"``` &#124; ```"highlight"```     | ```["zoomto", "highlight"]``` | Array of result map-actions            |
| mapActionsConfig | Object  | see [Configuration Reference](https://demos.conterra.de/mapapps/resources/jsregistry/root/map-actions/4.15.0/README.md#b%3Dmap-actions%3Bv%3D4.15.0%3Bvr%3D%5E4.15%3Bp%3Dmap.apps%3Bf%3Dmap-actions%3B) | ```{"zoomto-scale": 5000}```        | Object containing map-action configruation parameters |
