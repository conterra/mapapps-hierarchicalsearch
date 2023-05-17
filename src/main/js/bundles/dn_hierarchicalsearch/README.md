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
           "zoomto",
           "openPopup",
           "sendResultToResultCenter"
       ],
       "zoomScale": 5000
   }
}
```

| Property       | Type    | Possible Values                                                                 | Default | Description                            |
|----------------|---------|---------------------------------------------------------------------------------|---------|----------------------------------------|
| storeId        | String  |                                                                                 |         | The ID of your AGSSearch store         |
| fields         | Array   |                                                                                 |         | Array of search fields                 |
| field.name     | String  |                                                                                 |         | Name of the field                      |
| field.label    | String  |                                                                                 |         | Label for the drop down element        |
| resultHandling | Array   | ```zoomto``` &#124; ```openPopup``` &#124; ```sendResultToResultCenter``` |         | Array of result handling               |
| zoomScale      | Number  |                                                                                 | 5000    | Zoom scale in case of point geometries |
