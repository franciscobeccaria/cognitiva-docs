# Comparativa de Bases de Datos

Elegir la base de datos correcta es una de las decisiones arquitectónicas más importantes. Esta guía compara las opciones más comunes con énfasis en casos de uso reales.

## Bases de Datos Relacionales (SQL)

Las RDBMS son la opción predeterminada para la mayoría de las aplicaciones. Ofrecen transacciones ACID, esquemas fuertes y un lenguaje de consulta maduro.

### PostgreSQL vs MySQL

| Característica | PostgreSQL | MySQL |
|----------------|-----------|-------|
| ACID completo | ✓ | ✓ (InnoDB) |
| JSON nativo | ✓ (JSONB con índices) | Limitado |
| Full-text search | ✓ | Básico |
| Window functions | ✓ completo | ✓ desde 8.0 |
| Extensiones | PostGIS, pgvector, etc. | Limitadas |
| Licencia | Open source (PostgreSQL) | GPL / comercial |

**Recomendación:** PostgreSQL para nuevos proyectos. MySQL si ya está en el stack o si usás PlanetScale.

### Esquema de ejemplo

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT,
  published   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published) WHERE published = true;
```

## Bases de Datos NoSQL

NoSQL no es una alternativa a SQL — es un conjunto de herramientas distintas para problemas distintos.

### Comparativa general

| Base de datos | Modelo | Ideal para |
|---------------|--------|-----------|
| MongoDB | Documentos (JSON) | CMS, catálogos, datos variables |
| Redis | Clave-valor / estructuras | Caché, sesiones, colas, rate limiting |
| Cassandra | Columnar distribuida | Escritura masiva, series temporales |
| DynamoDB | Clave-valor + documentos | Serverless, escala automática |
| Elasticsearch | Búsqueda full-text | Logs, search, analítica |
| Neo4j | Grafos | Redes sociales, recomendaciones |

### Redis: casos de uso típicos

```javascript
// Caché de API con TTL
await redis.setex(`user:${userId}`, 300, JSON.stringify(userData));
const cached = await redis.get(`user:${userId}`);

// Rate limiting
const key = `rate:${ip}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 60);
if (count > 100) throw new TooManyRequestsError();

// Cola de tareas (simple)
await redis.lpush('jobs:email', JSON.stringify(emailJob));
const job = await redis.brpop('jobs:email', 0);
```

## Cómo Elegir

El proceso de decisión:

| Pregunta | Si es SÍ | Considera |
|----------|---------|-----------|
| ¿Necesito transacciones complejas? | — | SQL (Postgres) |
| ¿Los datos tienen estructura variable? | — | MongoDB o JSONB en Postgres |
| ¿Necesito caché en memoria? | — | Redis |
| ¿Escala de escritura masiva? | — | Cassandra / DynamoDB |
| ¿Búsqueda full-text avanzada? | — | Elasticsearch / Typesense |
| ¿Relaciones complejas entre entidades? | — | Neo4j o SQL con joins |

**Regla de oro:** empezá con PostgreSQL. Añadí Redis para caché cuando lo necesites. Solo migrá a algo más especializado cuando tengas un problema concreto que Postgres no pueda resolver.
