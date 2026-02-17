# Performance Monitoring Report

## Export Metadata
- **Exported At:** 2026-02-12T07:53:16.228Z
- **Total Traces:** 10021
- **Unique Operations:** 587
- **Total Errors:** 22
- **Average Duration:** 53.45ms
- **Time Range:** 2026-02-12T07:52:27.185Z to 2026-02-12T07:53:16.222Z

## Summary Statistics

### Overall Performance
- **Total Traces:** 10021
- **Unique Operations:** 587
- **Total Errors:** 22
- **Average Duration:** 53.45ms

### By Category

#### DB Query
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


#### HTTP Request
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


#### Admin API
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


#### DB Query (SELECT)
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


#### Store API
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


#### Other
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


## Performance Analysis

### Slowest Operations (Top 20)

1. **GET /store/products?handle=torebka-owalny-case-na-telefon-sza-wia-1769703727657-u04zsd&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2568.71ms
   - P95: 2568.71ms
   - P99: 2568.71ms
   - Count: 1
   - Errors: 0


2. **GET /store/products?handle=gruba-we-niana-czapka-beanie-100-we-na-kolor-wi-teczny-czerwony-1769628919379-vtxw6d&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2533.31ms
   - P95: 2533.31ms
   - P99: 2533.31ms
   - Count: 1
   - Errors: 0


3. **GET /store/products?handle=kura-gosposia-1769728196316-8487i2&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2529.55ms
   - P95: 2529.55ms
   - P99: 2529.55ms
   - Count: 1
   - Errors: 0


4. **GET /store/products?handle=zestaw-czarny-czapka-szalik-mi-kka-i-ciep-a-we-na-handmade-1769628242865-s9h5xk&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2511.50ms
   - P95: 2511.50ms
   - P99: 2511.50ms
   - Count: 1
   - Errors: 0


5. **GET /store/products?handle=kolczyki-z-hortensj-1769803426830-t8ylyc&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2510.59ms
   - P95: 2510.59ms
   - P99: 2510.59ms
   - Count: 1
   - Errors: 0


6. **GET /store/products?handle=torebka-na-rami-belly-bag-leopard-1769629330754-a1uom6&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2502.09ms
   - P95: 2502.09ms
   - P99: 2502.09ms
   - Count: 1
   - Errors: 0


7. **GET /store/products?handle=komplet-3-kosmetyczek-w-kaczuszki-1769727623262-i46ckn&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2440.75ms
   - P95: 2440.75ms
   - P99: 2440.75ms
   - Count: 1
   - Errors: 0


8. **GET /store/products?handle=komplet-3-kosmetyczek-idealny-prezent-walentynkowy-1769727962342-z04rg0&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2436.82ms
   - P95: 2436.82ms
   - P99: 2436.82ms
   - Count: 1
   - Errors: 0


9. **GET /store/products?handle=naszyjnik-z-dzik-marchwi-1769804088693-39t0dh&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2431.77ms
   - P95: 2431.77ms
   - P99: 2431.77ms
   - Count: 1
   - Errors: 0


10. **GET /store/products?handle=torebka-na-rami-belly-bag-per-owa-1769628965428-x7bym1&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2424.96ms
   - P95: 2424.96ms
   - P99: 2424.96ms
   - Count: 1
   - Errors: 0


11. **GET /store/products?handle=zielony-obraz-abstrakcyjny-ze-z-otem-reflections-8-bl-359787962-1769607894650-pemf6p&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2379.81ms
   - P95: 2379.81ms
   - P99: 2379.81ms
   - Count: 1
   - Errors: 0


12. **GET /store/products?handle=kolczyki-z-dzik-marchwi-1769804557651-h4goj2&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2356.69ms
   - P95: 2356.69ms
   - P99: 2356.69ms
   - Count: 1
   - Errors: 0


13. **GET /store/products?handle=bransoletka-z-dzik-marchwi-1770453492399-2ln8vv&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2353.75ms
   - P95: 3185.37ms
   - P99: 3185.37ms
   - Count: 2
   - Errors: 0


14. **GET /store/products?handle=kwiatowa-swieca-ozdobna-rekodzie-o-36ml-1769939476907-iuvfvm&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2353.29ms
   - P95: 2353.29ms
   - P99: 2353.29ms
   - Count: 1
   - Errors: 0


15. **GET /store/products?handle=naszyjnik-z-rumiankiem-1769803741059-c0vbr7&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2351.26ms
   - P95: 2351.26ms
   - P99: 2351.26ms
   - Count: 1
   - Errors: 0


16. **GET /store/products?handle=kolczyki-ze-stokrotk-1770128327661-91okas&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2336.52ms
   - P95: 2336.52ms
   - P99: 2336.52ms
   - Count: 1
   - Errors: 0


17. **GET /store/products?handle=runy-nordyckie-z-ywicy-r-cznie-robiony-zestaw-pdf-1769942242617-72lw78&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2311.86ms
   - P95: 2311.86ms
   - P99: 2311.86ms
   - Count: 1
   - Errors: 0


18. **GET /store/products?handle=naszyjnik-z-dzik-marchwi-1770129073544-r295wc&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2305.93ms
   - P95: 2305.93ms
   - P99: 2305.93ms
   - Count: 1
   - Errors: 0


19. **GET /store/products?handle=naszyjnik-z-hortensj-1770128557196-8ekile&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2299.96ms
   - P95: 2299.96ms
   - P99: 2299.96ms
   - Count: 1
   - Errors: 0


20. **GET /store/products?handle=zielony-obraz-abstrakcyjny-ze-z-otem-verde-50x70cm-bl-359787960-1769607890653-1k1ebp&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&limit=1&fields=id%2Ctitle%2Chandle%2Cdescription%2Cthumbnail%2Ccreated_at%2Cstatus%2Cimages.id%2Cimages.url%2Cmetadata%2Coptions.id%2Coptions.title%2Coptions.values.id%2Coptions.values.value%2Cvariants.id%2Cvariants.title%2Cvariants.calculated_price.calculated_amount%2Cvariants.calculated_price.currency_code%2Cvariants.inventory_quantity%2Cvariants.manage_inventory%2Cvariants.allow_backorder%2Cvariants.metadata%2Cvariants.options.id%2Cvariants.options.value%2Cvariants.options.option_id%2Cvariants.options.option.id%2Cvariants.options.option.title%2Cseller.id%2Cseller.handle%2Cseller.name%2Cseller.store_name%2Cseller.photo%2Cseller.logo_url%2Ccategories.id%2Ccategories.name%2Ccategories.handle%2Ccategories.parent_category_id%2Ccollection.id%2Ccollection.title%2Ccollection.handle%2Cshipping_profile.name** (Store API)
   - Avg: 2277.51ms
   - P95: 2277.51ms
   - P99: 2277.51ms
   - Count: 1
   - Errors: 0


## Error Analysis

### Operations with Errors

- **GET /admin/db-stats** (Admin API)
  - Error Rate: 100.00%
  - Errors: 14/14
  - Avg Duration: 58.41ms


- **GET /** (HTTP Request)
  - Error Rate: 0.08%
  - Errors: 3/3666
  - Avg Duration: 2.24ms


- **GET /admin/users/me** (Admin API)
  - Error Rate: 16.67%
  - Errors: 1/6
  - Avg Duration: 24.30ms


- **GET /store/variants/lowest-prices-batch?variant_ids=variant_01KG0P828718C9HWGKWZWWDP8J%2Cvariant_01KG0P828735XSXR3MAVHPXC15%2Cvariant_01KG0P82879VYSJENKY0VTWY44%2Cvariant_01KG0PFAP39X2FKAG0CYYARJJ0%2Cvariant_01KG0PFAP463SXSQNDCA09YAPW%2Cvariant_01KG0PFAP3GS9MSJTM95MC4WF7%2Cvariant_01KG0NVKNN0AMZMRMGWPSFT5ND%2Cvariant_01KG0NVKNMYQCEH01XDWA7B70M%2Cvariant_01KG0NVKNMQFFX2N4NV9WVWNA6%2Cvariant_01KG0NFHNAJY48JG2ZYW9XKHQR%2Cvariant_01KG0NFHNARJGAM0PM6ZK45SXK%2Cvariant_01KG0NFHNAQW62K5KTYXS3E3MR%2Cvariant_01KG0N4Y54JE2WK8WGVGHRQW8E%2Cvariant_01KG0N4Y524RTWNXF5AMVTK8XP%2Cvariant_01KG0N4Y54ZJ4PAY0C400YSNX2%2Cvariant_01KG0MXXCBK5XGTHB23BBRA3D7%2Cvariant_01KG0MXXCCTK5J2HA8EFXX5TG8%2Cvariant_01KG0MXXCD2S11PRVF86V05401%2Cvariant_01KED5M81C1E9G4W25ZBMQ03ZA%2Cvariant_01KED5M819EDF3MA3HM2N93FB1%2Cvariant_01KED5M819SWF3DEN5RD8SEESF%2Cvariant_01KED5M819XPJ546RSTFP3NQ9J%2Cvariant_01KED5M819QJTCNZT8B2AZQP5J%2Cvariant_01KED5M81A177V8D2Y2ET58EQN%2Cvariant_01KED5M81AWQM7AT2FJMRENYCT%2Cvariant_01KED5M81AD8AXDPPN27G8557B%2Cvariant_01KED5M81AZCSM7XA59VSTSE7Q%2Cvariant_01KED5M81AJPZ6FYNCT3YT6JFY%2Cvariant_01KED5M81AVC9VYQSWD1XDM325%2Cvariant_01KED5M81BSNB1SV4BWTRV04PN%2Cvariant_01KED5M81BWZ5EWMV4J2JCC67J%2Cvariant_01KED5M81B7EYP14FNY89ES10Y%2Cvariant_01KED5M81BV8G04SEEPDSP5587%2Cvariant_01KED5M81B3H5Z876A2GQE0JSY%2Cvariant_01KED5M81C4NXJ9R9ZC37J90DF%2Cvariant_01KED5M81C96V2TT7SPYTFN9KZ%2Cvariant_01KED5M81CJAZH3SGQ48CGV9EV%2Cvariant_01KED5M8185Z06HJ66QA98VP3X%2Cvariant_01KED3ZH7NH52VBZ1FZ4MV9Y9K%2Cvariant_01KED3ZH7RXFNNYSP6QST0GDE0%2Cvariant_01KED3ZH7RCPWDY7VFEBGDYESZ%2Cvariant_01KED3ZH7RBTZKGWZ2EF0024GK%2Cvariant_01KED3ZH7RJ2KZ4H8A8C5N7YA8%2Cvariant_01KED3ZH7Q40XX6TCPCFY13ES0%2Cvariant_01KED3ZH7QY00R5WF3FE3M475W%2Cvariant_01KED3ZH7Q9W05EG04M6PAQKFJ%2Cvariant_01KED3ZH7QJJ2CEJKR2P6Z0SC1%2Cvariant_01KED3ZH7QECJPSCRYS3YEVJ2N%2Cvariant_01KED3ZH7QEZM87RZY2QZY2BG4%2Cvariant_01KED3ZH7PR2FRFWV1J2GP39WF%2Cvariant_01KED3ZH7PHQ0JYAPQ3A9Z4764%2Cvariant_01KED3ZH7PY35X1VD9Z5DXC4JG%2Cvariant_01KED3ZH7P8ASJNJPJTDK7BVHR%2Cvariant_01KED3ZH7PSYZWTSN95H6JW78K%2Cvariant_01KED3ZH7PD3S1XDEKFNQ35NEW%2Cvariant_01KED3ZH7NA4PEGY4DSG8GBE4G%2Cvariant_01KED3ZH7MCZBD485R6J7ZSVQ6%2Cvariant_01KED3ZH7NVJJ2MHJD7C570BQF&currency_code=PLN&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&days=30** (Store API)
  - Error Rate: 100.00%
  - Errors: 1/1
  - Avg Duration: 154.41ms


- **GET /store/variants/lowest-prices-batch?variant_ids=variant_01KG0NVKNMYQCEH01XDWA7B70M%2Cvariant_01KG0NVKNMQFFX2N4NV9WVWNA6%2Cvariant_01KG0NVKNN0AMZMRMGWPSFT5ND%2Cvariant_01KG0PFAP39X2FKAG0CYYARJJ0%2Cvariant_01KG0PFAP463SXSQNDCA09YAPW%2Cvariant_01KG0PFAP3GS9MSJTM95MC4WF7%2Cvariant_01KG0P828718C9HWGKWZWWDP8J%2Cvariant_01KG0P828735XSXR3MAVHPXC15%2Cvariant_01KG0P82879VYSJENKY0VTWY44%2Cvariant_01KG0NFHNAJY48JG2ZYW9XKHQR%2Cvariant_01KG0NFHNARJGAM0PM6ZK45SXK%2Cvariant_01KG0NFHNAQW62K5KTYXS3E3MR%2Cvariant_01KG0N4Y54JE2WK8WGVGHRQW8E%2Cvariant_01KG0N4Y524RTWNXF5AMVTK8XP%2Cvariant_01KG0N4Y54ZJ4PAY0C400YSNX2%2Cvariant_01KG0MXXCBK5XGTHB23BBRA3D7%2Cvariant_01KG0MXXCCTK5J2HA8EFXX5TG8%2Cvariant_01KG0MXXCD2S11PRVF86V05401%2Cvariant_01KED5M81C1E9G4W25ZBMQ03ZA%2Cvariant_01KED5M819EDF3MA3HM2N93FB1%2Cvariant_01KED5M819SWF3DEN5RD8SEESF%2Cvariant_01KED5M819XPJ546RSTFP3NQ9J%2Cvariant_01KED5M819QJTCNZT8B2AZQP5J%2Cvariant_01KED5M81A177V8D2Y2ET58EQN%2Cvariant_01KED5M81AWQM7AT2FJMRENYCT%2Cvariant_01KED5M81AD8AXDPPN27G8557B%2Cvariant_01KED5M81AZCSM7XA59VSTSE7Q%2Cvariant_01KED5M81AJPZ6FYNCT3YT6JFY%2Cvariant_01KED5M81AVC9VYQSWD1XDM325%2Cvariant_01KED5M81BSNB1SV4BWTRV04PN%2Cvariant_01KED5M81BWZ5EWMV4J2JCC67J%2Cvariant_01KED5M81B7EYP14FNY89ES10Y%2Cvariant_01KED5M81BV8G04SEEPDSP5587%2Cvariant_01KED5M81B3H5Z876A2GQE0JSY%2Cvariant_01KED5M81C4NXJ9R9ZC37J90DF%2Cvariant_01KED5M81C96V2TT7SPYTFN9KZ%2Cvariant_01KED5M81CJAZH3SGQ48CGV9EV%2Cvariant_01KED5M8185Z06HJ66QA98VP3X%2Cvariant_01KED3ZH7NH52VBZ1FZ4MV9Y9K%2Cvariant_01KED3ZH7RXFNNYSP6QST0GDE0%2Cvariant_01KED3ZH7RCPWDY7VFEBGDYESZ%2Cvariant_01KED3ZH7RBTZKGWZ2EF0024GK%2Cvariant_01KED3ZH7RJ2KZ4H8A8C5N7YA8%2Cvariant_01KED3ZH7Q40XX6TCPCFY13ES0%2Cvariant_01KED3ZH7QY00R5WF3FE3M475W%2Cvariant_01KED3ZH7Q9W05EG04M6PAQKFJ%2Cvariant_01KED3ZH7QJJ2CEJKR2P6Z0SC1%2Cvariant_01KED3ZH7QECJPSCRYS3YEVJ2N%2Cvariant_01KED3ZH7QEZM87RZY2QZY2BG4%2Cvariant_01KED3ZH7PR2FRFWV1J2GP39WF%2Cvariant_01KED3ZH7PHQ0JYAPQ3A9Z4764%2Cvariant_01KED3ZH7PY35X1VD9Z5DXC4JG%2Cvariant_01KED3ZH7P8ASJNJPJTDK7BVHR%2Cvariant_01KED3ZH7PSYZWTSN95H6JW78K%2Cvariant_01KED3ZH7PD3S1XDEKFNQ35NEW%2Cvariant_01KED3ZH7NA4PEGY4DSG8GBE4G%2Cvariant_01KED3ZH7MCZBD485R6J7ZSVQ6%2Cvariant_01KED3ZH7NVJJ2MHJD7C570BQF&currency_code=PLN&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&days=30** (Store API)
  - Error Rate: 100.00%
  - Errors: 1/1
  - Avg Duration: 95.31ms


- **GET /store/variants/lowest-prices-batch?variant_ids=variant_01KG0NFHNAQW62K5KTYXS3E3MR%2Cvariant_01KG0NFHNARJGAM0PM6ZK45SXK%2Cvariant_01KG0NFHNAJY48JG2ZYW9XKHQR%2Cvariant_01KG0PFAP39X2FKAG0CYYARJJ0%2Cvariant_01KG0PFAP463SXSQNDCA09YAPW%2Cvariant_01KG0PFAP3GS9MSJTM95MC4WF7%2Cvariant_01KG0P828718C9HWGKWZWWDP8J%2Cvariant_01KG0P828735XSXR3MAVHPXC15%2Cvariant_01KG0P82879VYSJENKY0VTWY44%2Cvariant_01KG0NVKNN0AMZMRMGWPSFT5ND%2Cvariant_01KG0NVKNMYQCEH01XDWA7B70M%2Cvariant_01KG0NVKNMQFFX2N4NV9WVWNA6%2Cvariant_01KG0N4Y54JE2WK8WGVGHRQW8E%2Cvariant_01KG0N4Y524RTWNXF5AMVTK8XP%2Cvariant_01KG0N4Y54ZJ4PAY0C400YSNX2%2Cvariant_01KG0MXXCBK5XGTHB23BBRA3D7%2Cvariant_01KG0MXXCCTK5J2HA8EFXX5TG8%2Cvariant_01KG0MXXCD2S11PRVF86V05401%2Cvariant_01KED5M81C1E9G4W25ZBMQ03ZA%2Cvariant_01KED5M819EDF3MA3HM2N93FB1%2Cvariant_01KED5M819SWF3DEN5RD8SEESF%2Cvariant_01KED5M819XPJ546RSTFP3NQ9J%2Cvariant_01KED5M819QJTCNZT8B2AZQP5J%2Cvariant_01KED5M81A177V8D2Y2ET58EQN%2Cvariant_01KED5M81AWQM7AT2FJMRENYCT%2Cvariant_01KED5M81AD8AXDPPN27G8557B%2Cvariant_01KED5M81AZCSM7XA59VSTSE7Q%2Cvariant_01KED5M81AJPZ6FYNCT3YT6JFY%2Cvariant_01KED5M81AVC9VYQSWD1XDM325%2Cvariant_01KED5M81BSNB1SV4BWTRV04PN%2Cvariant_01KED5M81BWZ5EWMV4J2JCC67J%2Cvariant_01KED5M81B7EYP14FNY89ES10Y%2Cvariant_01KED5M81BV8G04SEEPDSP5587%2Cvariant_01KED5M81B3H5Z876A2GQE0JSY%2Cvariant_01KED5M81C4NXJ9R9ZC37J90DF%2Cvariant_01KED5M81C96V2TT7SPYTFN9KZ%2Cvariant_01KED5M81CJAZH3SGQ48CGV9EV%2Cvariant_01KED5M8185Z06HJ66QA98VP3X%2Cvariant_01KED3ZH7NH52VBZ1FZ4MV9Y9K%2Cvariant_01KED3ZH7RXFNNYSP6QST0GDE0%2Cvariant_01KED3ZH7RCPWDY7VFEBGDYESZ%2Cvariant_01KED3ZH7RBTZKGWZ2EF0024GK%2Cvariant_01KED3ZH7RJ2KZ4H8A8C5N7YA8%2Cvariant_01KED3ZH7Q40XX6TCPCFY13ES0%2Cvariant_01KED3ZH7QY00R5WF3FE3M475W%2Cvariant_01KED3ZH7Q9W05EG04M6PAQKFJ%2Cvariant_01KED3ZH7QJJ2CEJKR2P6Z0SC1%2Cvariant_01KED3ZH7QECJPSCRYS3YEVJ2N%2Cvariant_01KED3ZH7QEZM87RZY2QZY2BG4%2Cvariant_01KED3ZH7PR2FRFWV1J2GP39WF%2Cvariant_01KED3ZH7PHQ0JYAPQ3A9Z4764%2Cvariant_01KED3ZH7PY35X1VD9Z5DXC4JG%2Cvariant_01KED3ZH7P8ASJNJPJTDK7BVHR%2Cvariant_01KED3ZH7PSYZWTSN95H6JW78K%2Cvariant_01KED3ZH7PD3S1XDEKFNQ35NEW%2Cvariant_01KED3ZH7NA4PEGY4DSG8GBE4G%2Cvariant_01KED3ZH7MCZBD485R6J7ZSVQ6%2Cvariant_01KED3ZH7NVJJ2MHJD7C570BQF&currency_code=PLN&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&days=30** (Store API)
  - Error Rate: 100.00%
  - Errors: 1/1
  - Avg Duration: 86.58ms


- **GET /store/variants/lowest-prices-batch?variant_ids=variant_01KG0PFAP39X2FKAG0CYYARJJ0%2Cvariant_01KG0PFAP3GS9MSJTM95MC4WF7%2Cvariant_01KG0PFAP463SXSQNDCA09YAPW%2Cvariant_01KG0P828718C9HWGKWZWWDP8J%2Cvariant_01KG0P828735XSXR3MAVHPXC15%2Cvariant_01KG0P82879VYSJENKY0VTWY44%2Cvariant_01KG0NVKNN0AMZMRMGWPSFT5ND%2Cvariant_01KG0NVKNMYQCEH01XDWA7B70M%2Cvariant_01KG0NVKNMQFFX2N4NV9WVWNA6%2Cvariant_01KG0NFHNAJY48JG2ZYW9XKHQR%2Cvariant_01KG0NFHNARJGAM0PM6ZK45SXK%2Cvariant_01KG0NFHNAQW62K5KTYXS3E3MR%2Cvariant_01KG0N4Y54JE2WK8WGVGHRQW8E%2Cvariant_01KG0N4Y524RTWNXF5AMVTK8XP%2Cvariant_01KG0N4Y54ZJ4PAY0C400YSNX2%2Cvariant_01KG0MXXCBK5XGTHB23BBRA3D7%2Cvariant_01KG0MXXCCTK5J2HA8EFXX5TG8%2Cvariant_01KG0MXXCD2S11PRVF86V05401%2Cvariant_01KED5M81C1E9G4W25ZBMQ03ZA%2Cvariant_01KED5M819EDF3MA3HM2N93FB1%2Cvariant_01KED5M819SWF3DEN5RD8SEESF%2Cvariant_01KED5M819XPJ546RSTFP3NQ9J%2Cvariant_01KED5M819QJTCNZT8B2AZQP5J%2Cvariant_01KED5M81A177V8D2Y2ET58EQN%2Cvariant_01KED5M81AWQM7AT2FJMRENYCT%2Cvariant_01KED5M81AD8AXDPPN27G8557B%2Cvariant_01KED5M81AZCSM7XA59VSTSE7Q%2Cvariant_01KED5M81AJPZ6FYNCT3YT6JFY%2Cvariant_01KED5M81AVC9VYQSWD1XDM325%2Cvariant_01KED5M81BSNB1SV4BWTRV04PN%2Cvariant_01KED5M81BWZ5EWMV4J2JCC67J%2Cvariant_01KED5M81B7EYP14FNY89ES10Y%2Cvariant_01KED5M81BV8G04SEEPDSP5587%2Cvariant_01KED5M81B3H5Z876A2GQE0JSY%2Cvariant_01KED5M81C4NXJ9R9ZC37J90DF%2Cvariant_01KED5M81C96V2TT7SPYTFN9KZ%2Cvariant_01KED5M81CJAZH3SGQ48CGV9EV%2Cvariant_01KED5M8185Z06HJ66QA98VP3X%2Cvariant_01KED3ZH7NH52VBZ1FZ4MV9Y9K%2Cvariant_01KED3ZH7RXFNNYSP6QST0GDE0%2Cvariant_01KED3ZH7RCPWDY7VFEBGDYESZ%2Cvariant_01KED3ZH7RBTZKGWZ2EF0024GK%2Cvariant_01KED3ZH7RJ2KZ4H8A8C5N7YA8%2Cvariant_01KED3ZH7Q40XX6TCPCFY13ES0%2Cvariant_01KED3ZH7QY00R5WF3FE3M475W%2Cvariant_01KED3ZH7Q9W05EG04M6PAQKFJ%2Cvariant_01KED3ZH7QJJ2CEJKR2P6Z0SC1%2Cvariant_01KED3ZH7QECJPSCRYS3YEVJ2N%2Cvariant_01KED3ZH7QEZM87RZY2QZY2BG4%2Cvariant_01KED3ZH7PR2FRFWV1J2GP39WF%2Cvariant_01KED3ZH7PHQ0JYAPQ3A9Z4764%2Cvariant_01KED3ZH7PY35X1VD9Z5DXC4JG%2Cvariant_01KED3ZH7P8ASJNJPJTDK7BVHR%2Cvariant_01KED3ZH7PSYZWTSN95H6JW78K%2Cvariant_01KED3ZH7PD3S1XDEKFNQ35NEW%2Cvariant_01KED3ZH7NA4PEGY4DSG8GBE4G%2Cvariant_01KED3ZH7MCZBD485R6J7ZSVQ6%2Cvariant_01KED3ZH7NVJJ2MHJD7C570BQF&currency_code=PLN&region_id=reg_01K9N7E0N9E5NE1ZN6435WTM8X&days=30** (Store API)
  - Error Rate: 100.00%
  - Errors: 1/1
  - Avg Duration: 148.76ms


## Detailed Trace Data

### Recent Traces (Last 100)

1. **/admin/telemetry/export** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:16.222Z
   - Attributes: {
  "http.route": "/admin/telemetry/export",
  "express.name": "/admin/telemetry/export",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


2. **queryCommentInjectorMiddleware** - 0.06ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:16.222Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


3. **queryTaggingMiddleware** - 3.45ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:16.221Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


4. **pg.query:SET railway** - 2.07ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:16.221Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


5. **GET /** - 0.86ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.217Z
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/?format=markdown",
  "http.route": "/"
}


6. **telemetryMiddleware** - 0.03ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.218Z
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


7. **sentryMiddleware** - 0.10ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.217Z
   - Attributes: {
  "http.route": "*",
  "express.name": "sentryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


8. **authMiddleware** - 0.29ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.217Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "authMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


9. **corsMiddleware** - 0.16ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.216Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "corsMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


10. **urlencodedBodyParser** - 0.04ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.215Z
   - Attributes: {
  "http.route": "/",
  "express.name": "urlencodedBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


11. **textBodyParser** - 0.04ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.215Z
   - Attributes: {
  "http.route": "/",
  "express.name": "textBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


12. **jsonBodyParser** - 0.06ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.215Z
   - Attributes: {
  "http.route": "/",
  "express.name": "jsonBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


13. **<anonymous>** - 0.05ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.214Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


14. **<anonymous>** - 0.11ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.214Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


15. **<anonymous>** - 0.06ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.213Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


16. **<anonymous>** - 0.10ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.213Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


17. **session** - 2.03ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.212Z
   - Attributes: {
  "http.route": "/",
  "express.name": "session",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


18. **get** - 1.37ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:16.211Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "get sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


19. **cookieParser** - 0.08ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.209Z
   - Attributes: {
  "http.route": "/",
  "express.name": "cookieParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


20. **logger** - 0.21ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.209Z
   - Attributes: {
  "http.route": "/",
  "express.name": "logger",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


21. **expressInit** - 0.09ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.208Z
   - Attributes: {
  "http.route": "/",
  "express.name": "expressInit",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


22. **query** - 0.10ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:16.206Z
   - Attributes: {
  "http.route": "/",
  "express.name": "query",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


23. **GET /** - 112.98ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.334Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/app/assets/RobotoMono-Regular-27MA6W2G-44XoGH_Y.ttf",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/app/assets/RobotoMono-Regular-27MA6W2G-44XoGH_Y.ttf",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14652,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/"
}


24. **serveStatic** - 86.78ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.334Z
   - Attributes: {
  "http.route": "/",
  "express.name": "serveStatic",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


25. **set** - 1.83ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.332Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


26. **GET /** - 589.67ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.332Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/app/assets/Inter-Medium-RUQTUVA3-CKLJZXR2.ttf",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/app/assets/Inter-Medium-RUQTUVA3-CKLJZXR2.ttf",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14684,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/"
}


27. **serveStatic** - 514.09ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.332Z
   - Attributes: {
  "http.route": "/",
  "express.name": "serveStatic",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


28. **set** - 0.93ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.331Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


29. **GET /** - 636.06ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.329Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/app/assets/Inter-Regular-CKBOXRQ3-DYjygwQm.ttf",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/app/assets/Inter-Regular-CKBOXRQ3-DYjygwQm.ttf",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14672,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/"
}


30. **serveStatic** - 607.70ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.328Z
   - Attributes: {
  "http.route": "/",
  "express.name": "serveStatic",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


31. **set** - 3.11ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.328Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


32. **GET /admin/db-stats** - 40.28ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.328Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/admin/db-stats",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/admin/db-stats",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14798,
  "http.status_code": 503,
  "http.status_text": "SERVICE UNAVAILABLE",
  "http.route": "/admin/db-stats"
}


33. **GET /admin/users** - 70.17ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.328Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/admin/users?q=&limit=3&fields=id%2Cemail%2Cfirst_name%2Clast_name",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/admin/users?q=&limit=3&fields=id%2Cemail%2Cfirst_name%2Clast_name",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14786,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/users"
}


34. **GET /admin/db-stats** - 18.06ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.328Z
   - Attributes: {
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/admin/db-stats",
  "http.target": "/admin/db-stats",
  "http.status_code": 503,
  "http.response_time_ms": 18
}


35. **GET /admin/users?q=&limit=3&fields=id%2Cemail%2Cfirst_name%2Clast_name** - 42.76ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.327Z
   - Attributes: {
  "http.method": "GET",
  "http.url": "/?q=&limit=3&fields=id%2Cemail%2Cfirst_name%2Clast_name",
  "http.route": "/admin/users?q=&limit=3&fields=id%2Cemail%2Cfirst_name%2Clast_name",
  "http.target": "/admin/users?q=&limit=3&fields=id%2Cemail%2Cfirst_name%2Clast_name",
  "http.status_code": 200,
  "http.response_time_ms": 42
}


36. **set** - 2.00ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.326Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


37. **set** - 4.73ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.325Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


38. **/admin/db-stats** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.324Z
   - Attributes: {
  "http.route": "/admin/db-stats",
  "express.name": "/admin/db-stats",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


39. **queryCommentInjectorMiddleware** - 0.13ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.324Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


40. **queryTaggingMiddleware** - 13.09ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.323Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


41. **pg.query:SET railway** - 12.02ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.323Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


42. **pg.query:SELECT railway** - 19.15ms ([object Object])
   - Category: DB Query (SELECT)
   - Timestamp: 2026-02-12T07:53:02.320Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "select count(*) as \"count\" from \"public\".\"user\" as \"u0\" where \"u0\".\"deleted_at\" is null",
  "sentry.origin": "auto.db.otel.postgres"
}


43. **pg.query:SELECT railway** - 17.23ms ([object Object])
   - Category: DB Query (SELECT)
   - Timestamp: 2026-02-12T07:53:02.318Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "select \"u0\".\"id\", \"u0\".\"email\", \"u0\".\"first_name\", \"u0\".\"last_name\" from \"public\".\"user\" as \"u0\" where \"u0\".\"deleted_at\" is null order by \"u0\".\"id\" asc limit 3",
  "sentry.origin": "auto.db.otel.postgres"
}


44. **GET /admin/product-types** - 103.42ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.311Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/admin/product-types?q=&limit=3&fields=id%2Cvalue",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/admin/product-types?q=&limit=3&fields=id%2Cvalue",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14778,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/product-types"
}


45. **GET /admin/campaigns** - 81.10ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.311Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/admin/campaigns?q=&limit=3&fields=id%2Cname",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/admin/campaigns?q=&limit=3&fields=id%2Cname",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14784,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/campaigns"
}


46. **GET /admin/product-types?q=&limit=3&fields=id%2Cvalue** - 58.25ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.311Z
   - Attributes: {
  "http.method": "GET",
  "http.url": "/?q=&limit=3&fields=id%2Cvalue",
  "http.route": "/admin/product-types?q=&limit=3&fields=id%2Cvalue",
  "http.target": "/admin/product-types?q=&limit=3&fields=id%2Cvalue",
  "http.status_code": 200,
  "http.response_time_ms": 58
}


47. **GET /admin/campaigns?q=&limit=3&fields=id%2Cname** - 56.75ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.310Z
   - Attributes: {
  "http.method": "GET",
  "http.url": "/?q=&limit=3&fields=id%2Cname",
  "http.route": "/admin/campaigns?q=&limit=3&fields=id%2Cname",
  "http.target": "/admin/campaigns?q=&limit=3&fields=id%2Cname",
  "http.status_code": 200,
  "http.response_time_ms": 57
}


48. **GET /** - 0.97ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.309Z
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/"
}


49. **telemetryMiddleware** - 0.04ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.310Z
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


50. **sentryMiddleware** - 0.12ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.309Z
   - Attributes: {
  "http.route": "*",
  "express.name": "sentryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


51. **authMiddleware** - 0.47ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.308Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "authMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


52. **corsMiddleware** - 0.11ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.308Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "corsMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


53. **urlencodedBodyParser** - 0.03ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.307Z
   - Attributes: {
  "http.route": "/",
  "express.name": "urlencodedBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


54. **textBodyParser** - 0.03ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.307Z
   - Attributes: {
  "http.route": "/",
  "express.name": "textBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


55. **jsonBodyParser** - 0.06ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.306Z
   - Attributes: {
  "http.route": "/",
  "express.name": "jsonBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


56. **<anonymous>** - 0.05ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.306Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


57. **<anonymous>** - 0.02ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.305Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


58. **<anonymous>** - 0.07ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.305Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


59. **<anonymous>** - 0.12ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.304Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


60. **session** - 14.14ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.304Z
   - Attributes: {
  "http.route": "/",
  "express.name": "session",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


61. **set** - 6.97ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.302Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


62. **set** - 8.35ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.303Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


63. **get** - 12.69ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.302Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "get sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


64. **/admin/users** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.299Z
   - Attributes: {
  "http.route": "/admin/users",
  "express.name": "/admin/users",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


65. **/admin/users** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.298Z
   - Attributes: {
  "http.route": "/admin/users",
  "express.name": "/admin/users",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


66. **/admin/users** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.298Z
   - Attributes: {
  "http.route": "/admin/users",
  "express.name": "/admin/users",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


67. **queryCommentInjectorMiddleware** - 0.08ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.298Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


68. **queryTaggingMiddleware** - 12.05ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.297Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


69. **pg.query:SET railway** - 10.88ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.296Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


70. **pg.query:SELECT railway** - 22.35ms ([object Object])
   - Category: DB Query (SELECT)
   - Timestamp: 2026-02-12T07:53:02.295Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "select count(*) as \"count\" from \"public\".\"product_type\" as \"p0\" where \"p0\".\"deleted_at\" is null",
  "sentry.origin": "auto.db.otel.postgres"
}


71. **pg.query:SELECT railway** - 26.75ms ([object Object])
   - Category: DB Query (SELECT)
   - Timestamp: 2026-02-12T07:53:02.293Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "select count(*) as \"count\" from \"public\".\"promotion_campaign\" as \"c0\" where \"c0\".\"deleted_at\" is null",
  "sentry.origin": "auto.db.otel.postgres"
}


72. **pg.query:SELECT railway** - 19.91ms ([object Object])
   - Category: DB Query (SELECT)
   - Timestamp: 2026-02-12T07:53:02.292Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "select \"p0\".\"id\", \"p0\".\"value\" from \"public\".\"product_type\" as \"p0\" where \"p0\".\"deleted_at\" is null order by \"p0\".\"id\" asc limit 3",
  "sentry.origin": "auto.db.otel.postgres"
}


73. **pg.query:SELECT railway** - 25.00ms ([object Object])
   - Category: DB Query (SELECT)
   - Timestamp: 2026-02-12T07:53:02.291Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "select \"c0\".\"id\", \"c0\".\"name\" from \"public\".\"promotion_campaign\" as \"c0\" where \"c0\".\"deleted_at\" is null order by \"c0\".\"id\" asc limit 3",
  "sentry.origin": "auto.db.otel.postgres"
}


74. **cookieParser** - 0.07ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.289Z
   - Attributes: {
  "http.route": "/",
  "express.name": "cookieParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


75. **logger** - 0.16ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.289Z
   - Attributes: {
  "http.route": "/",
  "express.name": "logger",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


76. **expressInit** - 0.07ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.288Z
   - Attributes: {
  "http.route": "/",
  "express.name": "expressInit",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


77. **query** - 0.04ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.288Z
   - Attributes: {
  "http.route": "/",
  "express.name": "query",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


78. **GET /admin/promotions** - 112.34ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.286Z
   - Attributes: {
  "http.url": "http://artovnia-production.up.railway.app/admin/promotions?q=&limit=3&fields=id%2Ccode%2Cstatus",
  "http.host": "artovnia-production.up.railway.app",
  "net.host.name": "artovnia-production.up.railway.app",
  "http.method": "GET",
  "http.scheme": "http",
  "http.client_ip": "217.97.110.223",
  "http.target": "/admin/promotions?q=&limit=3&fields=id%2Ccode%2Cstatus",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::ffff:10.250.10.48",
  "net.host.port": 9000,
  "net.peer.ip": "::ffff:100.64.0.9",
  "net.peer.port": 14764,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/promotions"
}


79. **GET /admin/promotions?q=&limit=3&fields=id%2Ccode%2Cstatus** - 88.59ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.286Z
   - Attributes: {
  "http.method": "GET",
  "http.url": "/?q=&limit=3&fields=id%2Ccode%2Cstatus",
  "http.route": "/admin/promotions?q=&limit=3&fields=id%2Ccode%2Cstatus",
  "http.target": "/admin/promotions?q=&limit=3&fields=id%2Ccode%2Cstatus",
  "http.status_code": 200,
  "http.response_time_ms": 88
}


80. **GET /** - 1.04ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.285Z
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/?q=&limit=3&fields=id%2Cemail%2Cfirst_name%2Clast_name",
  "http.route": "/"
}


81. **telemetryMiddleware** - 0.05ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.285Z
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


82. **sentryMiddleware** - 0.13ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.284Z
   - Attributes: {
  "http.route": "*",
  "express.name": "sentryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


83. **authMiddleware** - 0.23ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.284Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "authMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


84. **corsMiddleware** - 0.13ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.283Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "corsMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


85. **urlencodedBodyParser** - 0.03ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.283Z
   - Attributes: {
  "http.route": "/",
  "express.name": "urlencodedBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


86. **textBodyParser** - 0.09ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.282Z
   - Attributes: {
  "http.route": "/",
  "express.name": "textBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


87. **jsonBodyParser** - 0.10ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.280Z
   - Attributes: {
  "http.route": "/",
  "express.name": "jsonBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


88. **<anonymous>** - 0.07ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.277Z
   - Attributes: {
  "http.route": "/admin",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


89. **<anonymous>** - 0.15ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.276Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


90. **<anonymous>** - 0.07ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.276Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


91. **<anonymous>** - 0.16ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.275Z
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


92. **session** - 14.46ms ([object Object])
   - Category: HTTP Request
   - Timestamp: 2026-02-12T07:53:02.274Z
   - Attributes: {
  "http.route": "/",
  "express.name": "session",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


93. **get** - 13.53ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.273Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "get sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


94. **set** - 35.51ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.273Z
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:qGWJKA5nIx0fWs9frRGTQ0ftqIf4hOGk [3 other arguments]",
  "net.peer.name": "shinkansen.proxy.rlwy.net",
  "net.peer.port": 32860,
  "db.connection_string": "redis://shinkansen.proxy.rlwy.net:32860",
  "sentry.origin": "auto.db.otel.redis"
}


95. **/admin/product-types** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.269Z
   - Attributes: {
  "http.route": "/admin/product-types",
  "express.name": "/admin/product-types",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


96. **/admin/product-types** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.268Z
   - Attributes: {
  "http.route": "/admin/product-types",
  "express.name": "/admin/product-types",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


97. **queryCommentInjectorMiddleware** - 0.07ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.268Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


98. **queryTaggingMiddleware** - 13.87ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.267Z
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


99. **pg.query:SET railway** - 11.01ms ([object Object])
   - Category: DB Query
   - Timestamp: 2026-02-12T07:53:02.267Z
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "railway",
  "db.connection_string": "postgresql://centerbeam.proxy.rlwy.net:23657/railway",
  "net.peer.name": "centerbeam.proxy.rlwy.net",
  "net.peer.port": 23657,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


100. **/admin/campaigns** - 0.01ms ([object Object])
   - Category: Admin API
   - Timestamp: 2026-02-12T07:53:02.264Z
   - Attributes: {
  "http.route": "/admin/campaigns",
  "express.name": "/admin/campaigns",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


---

## Recommendations for AI Analysis

This report contains:
1. **Metadata** - Export information and time range
2. **Summary Statistics** - High-level performance metrics
3. **Performance Analysis** - Slowest operations and percentiles
4. **Error Analysis** - Operations with errors and error rates
5. **Detailed Traces** - Individual trace data with attributes

### Suggested Analysis Questions:
- Which operations are consistently slow?
- Are there any error patterns or correlations?
- What's the performance distribution across categories?
- Are there any bottlenecks or performance regressions?
- Which operations should be optimized first?

### JSON Export
For more detailed analysis, use the JSON export format which includes:
- Complete aggregation data with all percentiles
- Full trace history (up to 1000 recent traces)
- Structured data for programmatic analysis
