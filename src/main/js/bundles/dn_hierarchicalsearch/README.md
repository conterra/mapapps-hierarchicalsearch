# dn_hierarchicalsearch

The Query Builder Bundle allows you to create your own Query Tools that perform custom complex queries on a store. For example, choosing all cities with more than 1 million inhabitants. The results of your queries are shown in the resultcenter. As an admin, it is possible to create complex queries using an interactive graphical user interface, or manually in a text format. If you enable the editing of a tool, the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

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
dn_hierarchicalsearch": {
   "HierarchicalSearchModel": {
        "storeId": "flurstuecke_store",
        "fields": [
            {
                "name": "gemarkung_",
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
            "zoomToResult",
            "openPopup",
            "sendResultToResultCenter"
        ]
    }
}
```

| Property                       | Type    | Possible Values                                     | Default            | Description                                                      |
|--------------------------------|---------|-----------------------------------------------------|--------------------|------------------------------------------------------------------|
| storeId                        | String  |                                                     |                    | The ID of your AGSSearch store                                   |
| resultHandling                 | Array   | zoomToResult ; openPopup ; sendResultToResultCenter |                    | Array of result handling                                         |
| fields                         | Array   |                                                     |                    | Array of search fields                                           |
| field.name                     | String  |                                                     |                    | Name of the field                                                |
| field.label                    | String  |                                                     |                    | Label for the drop down element                                  |
