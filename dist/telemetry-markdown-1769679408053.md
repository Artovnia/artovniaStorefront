# Performance Monitoring Report

## Export Metadata
- **Exported At:** 2026-01-29T09:36:48.046Z
- **Total Traces:** 1377
- **Unique Operations:** 64
- **Total Errors:** 0
- **Average Duration:** 9.63ms
- **Time Range:** undefined to undefined

## Summary Statistics

### Overall Performance
- **Total Traces:** 1377
- **Unique Operations:** 64
- **Total Errors:** 0
- **Average Duration:** 9.63ms

### By Category

#### DB Query
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


#### Admin API
- Count: 0
- Avg Duration: 0.00ms
- Errors: 0


#### HTTP Request
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

1. **GET /store/seller/:handle/page** (Store API)
   - Avg: 213.27ms
   - P95: 213.27ms
   - P99: 213.27ms
   - Count: 1
   - Errors: 0


2. **GET /store/vendors/:id/holiday** (Store API)
   - Avg: 196.51ms
   - P95: 196.51ms
   - P99: 196.51ms
   - Count: 1
   - Errors: 0


3. **GET /store/vendors/:id/suspension** (Store API)
   - Avg: 192.35ms
   - P95: 192.35ms
   - P99: 192.35ms
   - Count: 1
   - Errors: 0


4. **GET /store/seller/grzesiowska.art/page** (Store API)
   - Avg: 183.30ms
   - P95: 183.30ms
   - P99: 183.30ms
   - Count: 1
   - Errors: 0


5. **GET /store/vendors/sel_01JRQRPXXEKREAE925JG6SVZ1A/holiday** (Store API)
   - Avg: 172.14ms
   - P95: 172.14ms
   - P99: 172.14ms
   - Count: 1
   - Errors: 0


6. **GET /store/vendors/sel_01JRQRPXXEKREAE925JG6SVZ1A/suspension** (Store API)
   - Avg: 169.25ms
   - P95: 169.25ms
   - P99: 169.25ms
   - Count: 1
   - Errors: 0


7. **GET /admin/db-stats** (Admin API)
   - Avg: 166.77ms
   - P95: 326.14ms
   - P99: 329.25ms
   - Count: 32
   - Errors: 0


8. **GET /store/vendors/:id/availability** (Store API)
   - Avg: 150.13ms
   - P95: 150.13ms
   - P99: 150.13ms
   - Count: 1
   - Errors: 0


9. **pg.connect** (Other)
   - Avg: 143.17ms
   - P95: 172.75ms
   - P99: 172.75ms
   - Count: 3
   - Errors: 0


10. **POST /store/variants/lowest-prices-batch** (Store API)
   - Avg: 141.07ms
   - P95: 144.39ms
   - P99: 144.39ms
   - Count: 2
   - Errors: 0


11. **GET /store/vendors/sel_01JRQRPXXEKREAE925JG6SVZ1A/availability** (Store API)
   - Avg: 126.93ms
   - P95: 126.93ms
   - P99: 126.93ms
   - Count: 1
   - Errors: 0


12. **GET /store/seller/:id/products** (Store API)
   - Avg: 98.56ms
   - P95: 112.28ms
   - P99: 112.28ms
   - Count: 3
   - Errors: 0


13. **GET /store/seller/:handle/reviews** (Store API)
   - Avg: 95.47ms
   - P95: 161.28ms
   - P99: 161.28ms
   - Count: 2
   - Errors: 0


14. **GET /store/seller/sel_01JRQRPXXEKREAE925JG6SVZ1A/products?limit=20&offset=0&region_id=reg_01JQK4VQD6VHDXKCYTD932KTPN&sortBy=created_at_desc** (Store API)
   - Avg: 87.95ms
   - P95: 87.95ms
   - P99: 87.95ms
   - Count: 1
   - Errors: 0


15. **GET /store/seller/grzesiowska.art/reviews?limit=100** (Store API)
   - Avg: 87.44ms
   - P95: 153.31ms
   - P99: 153.31ms
   - Count: 2
   - Errors: 0


16. **GET /store/seller/sel_01JRQRPXXEKREAE925JG6SVZ1A/products?limit=1000&offset=0&region_id=reg_01JQK4VQD6VHDXKCYTD932KTPN** (Store API)
   - Avg: 84.40ms
   - P95: 102.97ms
   - P99: 102.97ms
   - Count: 2
   - Errors: 0


17. **GET /store/sellers** (Store API)
   - Avg: 77.53ms
   - P95: 77.53ms
   - P99: 77.53ms
   - Count: 1
   - Errors: 0


18. **GET /store/products/promotions** (Store API)
   - Avg: 77.36ms
   - P95: 77.36ms
   - P99: 77.36ms
   - Count: 1
   - Errors: 0


19. **GET /store/seller/:handle** (Store API)
   - Avg: 72.71ms
   - P95: 72.71ms
   - P99: 72.71ms
   - Count: 1
   - Errors: 0


20. **GET /store/products/promotions?limit=5&offset=0&region_id=reg_01JQK4VQD6VHDXKCYTD932KTPN** (Store API)
   - Avg: 68.04ms
   - P95: 68.04ms
   - P99: 68.04ms
   - Count: 1
   - Errors: 0


## Error Analysis

### Operations with Errors
No errors recorded

## Detailed Trace Data

### Recent Traces (Last 100)

1. **/admin/telemetry/export** - 0.01ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/telemetry/export",
  "express.name": "/admin/telemetry/export",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


2. **queryCommentInjectorMiddleware** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


3. **queryTaggingMiddleware** - 0.54ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


4. **pg.query:SET mercurArtovnia** - 0.24ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


5. **GET /** - 0.20ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/?format=markdown",
  "http.route": "/"
}


6. **telemetryMiddleware** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


7. **sentryMiddleware** - 0.06ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "sentryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


8. **authMiddleware** - 0.12ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "authMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


9. **corsMiddleware** - 0.14ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "corsMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


10. **urlencodedBodyParser** - 0.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "urlencodedBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


11. **textBodyParser** - 0.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "textBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


12. **jsonBodyParser** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "jsonBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


13. **<anonymous>** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


14. **<anonymous>** - 0.06ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


15. **<anonymous>** - 0.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


16. **<anonymous>** - 0.06ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


17. **session** - 1.12ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "session",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


18. **get** - 0.86ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "redis",
  "db.statement": "get sess:Vj0yoicEBX6RKbeGiSAUWmJMKF_tW1aq",
  "net.peer.name": "127.0.0.1",
  "net.peer.port": 6379,
  "db.connection_string": "redis://127.0.0.1:6379",
  "sentry.origin": "auto.db.otel.redis"
}


19. **cookieParser** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "cookieParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


20. **logger** - 0.09ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "logger",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


21. **expressInit** - 0.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "expressInit",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


22. **query** - 0.07ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "query",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


23. **GET /admin/db-stats** - 147.19ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.url": "http://localhost:9000/admin/db-stats",
  "http.host": "localhost:9000",
  "net.host.name": "localhost",
  "http.method": "GET",
  "http.scheme": "http",
  "http.target": "/admin/db-stats",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::1",
  "net.host.port": 9000,
  "net.peer.ip": "::1",
  "net.peer.port": 53143,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/db-stats"
}


24. **GET /admin/db-stats** - 142.58ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/admin/db-stats",
  "http.target": "/admin/db-stats",
  "http.status_code": 200,
  "http.response_time_ms": 142
}


25. **set** - 0.54ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:Vj0yoicEBX6RKbeGiSAUWmJMKF_tW1aq [3 other arguments]",
  "net.peer.name": "127.0.0.1",
  "net.peer.port": 6379,
  "db.connection_string": "redis://127.0.0.1:6379",
  "sentry.origin": "auto.db.otel.redis"
}


26. **pg.query:
 mercurArtovnia** - 33.63ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT \n        COUNT(*) as total_unique_queries,\n        SUM(calls) as total_query_calls,\n        ROUND(SUM(total_exec_time)::numeric, 2) as total_execution_time_ms,\n        ROUND(AVG(mean_exec_time)::numeric, 2) as avg_query_time_ms\n      FROM pg_stat_statements\n      WHERE query NOT LIKE '%pg_stat_statements%'\n        AND query NOT LIKE '%pg_stat_activity%'\n        AND query NOT LIKE '%pg_extension%'\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


27. **pg.query:
 mercurArtovnia** - 47.59ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT \n        query,\n        calls,\n        ROUND(mean_exec_time::numeric, 2) as avg_time_ms,\n        ROUND(max_exec_time::numeric, 2) as max_time_ms,\n        ROUND(total_exec_time::numeric, 2) as total_time_ms\n      FROM pg_stat_statements\n      WHERE query NOT LIKE '%pg_stat_statements%'\n        AND query NOT LIKE '%pg_stat_activity%'\n        AND query NOT LIKE '%pg_extension%'\n      ORDER BY mean_exec_time DESC\n      LIMIT 30\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


28. **pg.query:
 mercurArtovnia** - 48.43ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT \n        query,\n        queryid,\n        calls as total_calls,\n        ROUND(total_exec_time::numeric, 2) as total_time_ms,\n        ROUND(mean_exec_time::numeric, 2) as avg_time_ms,\n        ROUND(max_exec_time::numeric, 2) as max_time_ms,\n        1 as unique_queries\n      FROM pg_stat_statements\n      WHERE query NOT LIKE '%pg_stat_statements%'\n        AND query NOT LIKE '%pg_stat_activity%'\n        AND query NOT LIKE '%pg_extension%'\n      ORDER BY total_exec_time DESC\n      LIMIT 20\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


29. **pg.query:
 mercurArtovnia** - 2.65ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT EXISTS (\n        SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'\n      ) as enabled\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


30. **GET /admin/telemetry** - 12.40ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.url": "http://localhost:9000/admin/telemetry",
  "http.host": "localhost:9000",
  "net.host.name": "localhost",
  "http.method": "GET",
  "http.scheme": "http",
  "http.target": "/admin/telemetry",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::1",
  "net.host.port": 9000,
  "net.peer.ip": "::1",
  "net.peer.port": 53142,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/telemetry"
}


31. **GET /admin/telemetry** - 6.95ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/admin/telemetry",
  "http.target": "/admin/telemetry",
  "http.status_code": 200,
  "http.response_time_ms": 7
}


32. **set** - 1.72ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:Vj0yoicEBX6RKbeGiSAUWmJMKF_tW1aq [3 other arguments]",
  "net.peer.name": "127.0.0.1",
  "net.peer.port": 6379,
  "db.connection_string": "redis://127.0.0.1:6379",
  "sentry.origin": "auto.db.otel.redis"
}


33. **/admin/db-stats** - 0.01ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/db-stats",
  "express.name": "/admin/db-stats",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


34. **queryCommentInjectorMiddleware** - 0.07ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


35. **queryTaggingMiddleware** - 3.80ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


36. **pg.query:SET mercurArtovnia** - 3.16ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


37. **/admin/telemetry** - 0.01ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/telemetry",
  "express.name": "/admin/telemetry",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


38. **queryCommentInjectorMiddleware** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


39. **queryTaggingMiddleware** - 1.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


40. **pg.query:SET mercurArtovnia** - 0.37ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


41. **GET /** - 0.26ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/"
}


42. **GET /** - 0.50ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/"
}


43. **telemetryMiddleware** - 0.07ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


44. **sentryMiddleware** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "sentryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


45. **authMiddleware** - 0.41ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "authMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


46. **telemetryMiddleware** - 0.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


47. **sentryMiddleware** - 0.07ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "sentryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


48. **authMiddleware** - 2.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "authMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


49. **corsMiddleware** - 0.06ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "corsMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


50. **urlencodedBodyParser** - 0.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "urlencodedBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


51. **textBodyParser** - 0.06ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "textBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


52. **jsonBodyParser** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "jsonBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


53. **<anonymous>** - 0.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


54. **<anonymous>** - 0.01ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


55. **<anonymous>** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


56. **<anonymous>** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


57. **session** - 1.59ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "session",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


58. **corsMiddleware** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "corsMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


59. **urlencodedBodyParser** - 0.01ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "urlencodedBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


60. **textBodyParser** - 0.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "textBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


61. **jsonBodyParser** - 0.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "jsonBodyParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


62. **<anonymous>** - 0.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


63. **<anonymous>** - 0.02ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


64. **<anonymous>** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


65. **<anonymous>** - 0.17ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "<anonymous>",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


66. **session** - 1.75ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "session",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


67. **get** - 0.29ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "redis",
  "db.statement": "get sess:Vj0yoicEBX6RKbeGiSAUWmJMKF_tW1aq",
  "net.peer.name": "127.0.0.1",
  "net.peer.port": 6379,
  "db.connection_string": "redis://127.0.0.1:6379",
  "sentry.origin": "auto.db.otel.redis"
}


68. **get** - 1.44ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "redis",
  "db.statement": "get sess:Vj0yoicEBX6RKbeGiSAUWmJMKF_tW1aq",
  "net.peer.name": "127.0.0.1",
  "net.peer.port": 6379,
  "db.connection_string": "redis://127.0.0.1:6379",
  "sentry.origin": "auto.db.otel.redis"
}


69. **cookieParser** - 0.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "cookieParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


70. **logger** - 0.09ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "logger",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


71. **expressInit** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "expressInit",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


72. **query** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "query",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


73. **cookieParser** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "cookieParser",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


74. **logger** - 0.10ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "logger",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


75. **expressInit** - 0.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "expressInit",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


76. **query** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/",
  "express.name": "query",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


77. **GET /admin/db-stats** - 166.24ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.url": "http://localhost:9000/admin/db-stats",
  "http.host": "localhost:9000",
  "net.host.name": "localhost",
  "http.method": "GET",
  "http.scheme": "http",
  "http.target": "/admin/db-stats",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::1",
  "net.host.port": 9000,
  "net.peer.ip": "::1",
  "net.peer.port": 53128,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/db-stats"
}


78. **GET /admin/db-stats** - 163.00ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/admin/db-stats",
  "http.target": "/admin/db-stats",
  "http.status_code": 200,
  "http.response_time_ms": 163
}


79. **set** - 1.40ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:Vj0yoicEBX6RKbeGiSAUWmJMKF_tW1aq [3 other arguments]",
  "net.peer.name": "127.0.0.1",
  "net.peer.port": 6379,
  "db.connection_string": "redis://127.0.0.1:6379",
  "sentry.origin": "auto.db.otel.redis"
}


80. **pg.query:
 mercurArtovnia** - 35.10ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT \n        COUNT(*) as total_unique_queries,\n        SUM(calls) as total_query_calls,\n        ROUND(SUM(total_exec_time)::numeric, 2) as total_execution_time_ms,\n        ROUND(AVG(mean_exec_time)::numeric, 2) as avg_query_time_ms\n      FROM pg_stat_statements\n      WHERE query NOT LIKE '%pg_stat_statements%'\n        AND query NOT LIKE '%pg_stat_activity%'\n        AND query NOT LIKE '%pg_extension%'\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


81. **pg.query:
 mercurArtovnia** - 51.61ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT \n        query,\n        calls,\n        ROUND(mean_exec_time::numeric, 2) as avg_time_ms,\n        ROUND(max_exec_time::numeric, 2) as max_time_ms,\n        ROUND(total_exec_time::numeric, 2) as total_time_ms\n      FROM pg_stat_statements\n      WHERE query NOT LIKE '%pg_stat_statements%'\n        AND query NOT LIKE '%pg_stat_activity%'\n        AND query NOT LIKE '%pg_extension%'\n      ORDER BY mean_exec_time DESC\n      LIMIT 30\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


82. **pg.query:
 mercurArtovnia** - 63.54ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT \n        query,\n        queryid,\n        calls as total_calls,\n        ROUND(total_exec_time::numeric, 2) as total_time_ms,\n        ROUND(mean_exec_time::numeric, 2) as avg_time_ms,\n        ROUND(max_exec_time::numeric, 2) as max_time_ms,\n        1 as unique_queries\n      FROM pg_stat_statements\n      WHERE query NOT LIKE '%pg_stat_statements%'\n        AND query NOT LIKE '%pg_stat_activity%'\n        AND query NOT LIKE '%pg_extension%'\n      ORDER BY total_exec_time DESC\n      LIMIT 20\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


83. **pg.query:
 mercurArtovnia** - 1.30ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "\n      SELECT EXISTS (\n        SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'\n      ) as enabled\n    ",
  "sentry.origin": "auto.db.otel.postgres"
}


84. **GET /admin/telemetry** - 10.30ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.url": "http://localhost:9000/admin/telemetry",
  "http.host": "localhost:9000",
  "net.host.name": "localhost",
  "http.method": "GET",
  "http.scheme": "http",
  "http.target": "/admin/telemetry",
  "http.user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "http.flavor": "1.1",
  "net.transport": "ip_tcp",
  "sentry.origin": "auto.http.otel.http",
  "net.host.ip": "::1",
  "net.host.port": 9000,
  "net.peer.ip": "::1",
  "net.peer.port": 53127,
  "http.status_code": 200,
  "http.status_text": "OK",
  "http.route": "/admin/telemetry"
}


85. **GET /admin/telemetry** - 6.32ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/admin/telemetry",
  "http.target": "/admin/telemetry",
  "http.status_code": 200,
  "http.response_time_ms": 6
}


86. **set** - 1.21ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "redis",
  "db.statement": "set sess:Vj0yoicEBX6RKbeGiSAUWmJMKF_tW1aq [3 other arguments]",
  "net.peer.name": "127.0.0.1",
  "net.peer.port": 6379,
  "db.connection_string": "redis://127.0.0.1:6379",
  "sentry.origin": "auto.db.otel.redis"
}


87. **/admin/db-stats** - 0.01ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/db-stats",
  "express.name": "/admin/db-stats",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


88. **queryCommentInjectorMiddleware** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


89. **queryTaggingMiddleware** - 4.74ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


90. **pg.query:SET mercurArtovnia** - 3.23ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


91. **/admin/telemetry** - 0.01ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/telemetry",
  "express.name": "/admin/telemetry",
  "express.type": "request_handler",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "request_handler.express"
}


92. **queryCommentInjectorMiddleware** - 0.05ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryCommentInjectorMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


93. **queryTaggingMiddleware** - 1.99ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin/*",
  "express.name": "queryTaggingMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


94. **pg.query:SET mercurArtovnia** - 1.43ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "db.system": "postgresql",
  "db.name": "mercurArtovnia",
  "db.connection_string": "postgresql://localhost:5432/mercurArtovnia",
  "net.peer.name": "localhost",
  "net.peer.port": 5432,
  "db.user": "postgres",
  "db.statement": "SET application_name = 'medusa:GET_/'",
  "sentry.origin": "auto.db.otel.postgres"
}


95. **GET /** - 0.22ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/"
}


96. **GET /** - 0.45ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "sentry.op": "http.server",
  "http.method": "GET",
  "http.url": "/",
  "http.route": "/"
}


97. **telemetryMiddleware** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


98. **sentryMiddleware** - 0.04ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "sentryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


99. **authMiddleware** - 0.39ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "/admin",
  "express.name": "authMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
}


100. **telemetryMiddleware** - 0.03ms ([object Object])
   - Category: uncategorized
   - Timestamp: N/A
   - Attributes: {
  "http.route": "*",
  "express.name": "telemetryMiddleware",
  "express.type": "middleware",
  "sentry.origin": "auto.http.otel.express",
  "sentry.op": "middleware.express"
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
