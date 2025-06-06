# dn_hierarchicalsearch

This bundle offers a widget for searching features with several drop-down menus in hierarchical organized objects, such as addresses (city > street > address point).
Each menu is filled based on the previous user selection (for example all streets for the selected city are shown).

## Usage

1. Add the bundle "dn_hierarchicalsearch" to your app.
2. Add an AGSSearch store to your app.
3. Add and customize the corresponding HierarchicalSearchTool.
4. Add the new tool to a toolset.

## Configuration Reference

### Add search stores
```json
"agssearch": {
    "AGSStore": [
        {
            "id": "flurstuecke_store",
            "title": "Flurstück suchen",
            "description": "Beschreibung Flursuche",
            "idProperty": "OBJECTID",
            "layerId": "flurst_berlin",
            "useIn": [
                "selection"
            ],
            "filterOptions": {
                "suggestContains": true
            },
            "fetchIdProperty": true
        },
        {
            "id": "add_hamburg",
            "title": "Addresse suchen",
            "description": "Beschreibung Addresssuche",
            "layerId": "add_hamburg",
            "useIn": [
                "selection"
            ],
            "filterOptions": {
                "suggestContains": true
            },
            "fetchIdProperty": true
        }

    ]
},
```

### Add search tools

```json
"dn_hierarchicalsearch": {
    "HierarchicalSearchTools": [
        {
            "id": "flurstueckssuche",
            "title": "Flurstücke suchen",
            "tooltip": "Flurstücke suchen",
            "iconClass": "icon-select-mouse",
            "rules": {
                "roles": [
                    "maAdmin",
                    "maEditor"
                    ],
                "ruleSuccessProperty": "enabled"
                },
                "storeId": "flurstuecke_store",
                "fields": [
                    {
                        "name": "NAMGMK",
                        "label": "Gemarkung"
                    },
                    {
                        "name": "FLN",
                        "label": "Flur"
                    },
                    {
                        "name": "ZAE",
                        "label": "Flurstück"
                    }
                ],
                "mapActions": [
                    "highlight",
                    "zoomto",
                    "sendResultToResultUI"
                ],
                "mapActionsConfig": {
                    "zoomto-scale": 5000,
                    "alwaysOpenResultUI": true
                }
        },
        {
            "id": "adresssuche",
            "title": "Adressen suchen",
            "tooltip": "Adressen suchen",
            "iconClass": "icon-house",
            "storeId": "add_hamburg",
            "fields": [
                {
                    "name": "portsname",
                    "label": "Stadt"
                },
                {
                    "name": "strname",
                    "label": "Straße"
                },
                {
                    "name": "hausnr",
                    "label": "Hausnummer"
                },
                {
                    "name": "zusatz",
                    "label": "Zusatz"
                }
            ],
            "mapActions": [
                "highlight",
                "zoomto"
            ],
            "mapActionsConfig": {
                "zoomto-scale": 5000
            }
        }
    ]
},
```

| Property         | Type   | Possible Values                                                                                                                                                                                         | Default                       | Description                                           |
|------------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------|-------------------------------------------------------|
| storeId          | String |                                                                                                                                                                                                         |                               | The ID of your AGSSearch store                        |
| fields           | Array  |                                                                                                                                                                                                         |                               | Array of search fields                                |
| field.name       | String |                                                                                                                                                                                                         |                               | Name of the field                                     |
| field.label      | String |                                                                                                                                                                                                         |                               | Label for the drop down element                       |
| mapActions       | Array  | ```"zoomto"``` &#124; ```"openPopup"``` &#124; ```"highlight"``` &#124; ```"sendResultToResultUI"``` &#124; ```"sendResultToResultCenter"```                                                            | ```["zoomto", "highlight"]``` | Array map-actions to apply to result                  |
| mapActionsConfig | Object | see [Configuration Reference](https://demos.conterra.de/mapapps/resources/jsregistry/root/map-actions/latest/README.md) | ```{"zoomto-scale": 5000}```  | Object containing map-action configruation parameters |

The mapActionsConfig of the "sendResultToResultUI" also supports the parameter "alwaysOpenResultUI". If set to true, the result ui is opened even for single results.
