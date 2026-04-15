## Introducción

Este documento describe las mejores prácticas para escribir APIs REST. No tiene un título de documento explícito — solo secciones H2 que se convertirán en páginas.

Las APIs REST son el estándar de facto para comunicación entre servicios web. Una API bien diseñada es predecible, consistente y fácil de adoptar.

## Diseño de Endpoints

Los endpoints deben ser recursos, no acciones. Usá sustantivos en plural:

```
✓ GET  /users
✓ POST /users
✓ GET  /users/{id}
✗ GET  /getUsers
✗ POST /createUser
```

### Jerarquía de recursos

Para recursos anidados, reflejá la relación en la URL:

```
GET  /users/{id}/posts        → posts de un usuario
GET  /users/{id}/posts/{pid}  → post específico de un usuario
```

Evitá más de dos niveles de anidamiento. Si el recurso puede existir independientemente, exponelo en su propio endpoint raíz.

## Códigos de Estado HTTP

Usá los códigos HTTP con semántica correcta:

| Código | Uso |
|--------|-----|
| 200 OK | Solicitud exitosa (GET, PUT, PATCH) |
| 201 Created | Recurso creado exitosamente (POST) |
| 204 No Content | Operación exitosa sin cuerpo (DELETE) |
| 400 Bad Request | Parámetros inválidos del cliente |
| 401 Unauthorized | Autenticación requerida |
| 403 Forbidden | Sin permisos para este recurso |
| 404 Not Found | Recurso no existe |
| 422 Unprocessable | Validación falló (datos bien formados pero inválidos) |
| 429 Too Many Requests | Rate limit excedido |
| 500 Internal Server Error | Error no manejado del servidor |

Nunca devuelvas 200 con un campo `"error"` en el cuerpo. Usá el código HTTP correcto.

## Autenticación y Autorización

### API Keys

Para comunicación server-to-server. Enviá en header:
```
Authorization: Bearer <api-key>
```

Nunca en query params (quedan en logs).

### JWT

Para autenticación de usuarios. El token contiene los claims del usuario y se firma con una clave secreta. El servidor puede verificarlo sin consultar la base de datos.

Puntos críticos:
- Usá tiempos de expiración cortos (15–60 min para access tokens)
- Implementá refresh tokens con rotación
- No guardés información sensible en el payload (es base64, no cifrado)

## Paginación

Nunca retornés colecciones completas sin límite. Existen tres patrones comunes:

**Offset pagination** (simple, con problemas en datasets que cambian):
```
GET /posts?limit=20&offset=40
```

**Cursor pagination** (más robusto para feeds en tiempo real):
```
GET /posts?limit=20&after=cursor_abc123
```

**Page-based** (familiar para UIs de tabla):
```
GET /posts?page=3&per_page=20
```

Incluí metadatos en la respuesta:
```json
{
  "data": [...],
  "meta": {
    "total": 847,
    "page": 3,
    "per_page": 20,
    "has_next": true
  }
}
```

## Versionado

Versioná desde el día uno, aunque no lo necesités de inmediato.

El enfoque más común y pragmático es el versionado en la URL:
```
/api/v1/users
/api/v2/users
```

Alternativas: header `API-Version: 2024-01-15`, content negotiation. Son más limpias en teoría pero más difíciles de implementar y debuggear.

**Regla práctica:** no rompas compatibilidad hacia atrás dentro de una versión. Depreciá endpoints con al menos 6 meses de anticipación antes de eliminarlos.
