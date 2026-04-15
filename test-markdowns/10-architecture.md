# Arquitectura de Software Moderna

Este documento describe los patrones y decisiones arquitectónicas más relevantes para sistemas distribuidos en producción. No es una guía exhaustiva — es una referencia opinionada de los patrones que resuelven los problemas más comunes.

## Por Qué Importa la Arquitectura

La arquitectura es el conjunto de decisiones que son difíciles de cambiar después. Elegir una base de datos, definir los límites de los servicios, decidir el protocolo de comunicación — estas decisiones tienen un costo de reversión alto.

Una buena arquitectura no es aquella que usa las tecnologías más nuevas. Es la que maximiza la capacidad del equipo para responder a cambios futuros sin reescribir todo.

# Arquitecturas Monolíticas vs Distribuidas

El debate monolito vs microservicios a menudo se plantea como una elección binaria. No lo es.

## El Monolito bien Hecho

Un monolito modular bien estructurado supera a una arquitectura de microservicios mal implementada en casi todos los aspectos:
- Deploys atómicos
- Debugging straightforward (un proceso, un log)
- Transacciones ACID sin coordinación distribuida
- Desarrollo más rápido en equipos pequeños

La pregunta no es "¿monolito o microservicios?" sino "¿qué escala organizacional tengo y qué complejidad puedo absorber?".

### Cuándo tiene sentido el monolito

| Señal | Monolito es correcto |
|-------|---------------------|
| Equipo < 20 personas | ✓ |
| Producto en fase de descubrimiento | ✓ |
| Dominios no bien definidos | ✓ |
| Operaciones simples (< 10k RPM) | ✓ |

## Microservicios

Los microservicios resuelven un problema organizacional más que uno técnico. Cuando múltiples equipos trabajan sobre el mismo codebase, la coordinación se convierte en el cuello de botella.

La regla de Conway aplica: la arquitectura de un sistema refleja la estructura de comunicación de la organización que lo creó.

### Los costos reales

```
Complejidad añadida por microservicios:
- Latencia de red entre servicios
- Consistencia eventual (no ACID entre servicios)
- Service discovery y load balancing
- Distributed tracing (no más stack traces simples)
- Multiple deploys coordinados
- Schema contracts entre servicios
```

Antes de partir un monolito, preguntate: ¿el cuello de botella es técnico o de coordinación de equipo?

# Patrones de Comunicación

Cómo se comunican los servicios define en gran parte la resiliencia y el acoplamiento del sistema.

## Comunicación Síncrona

HTTP/REST y gRPC son los patrones síncronos dominantes.

### REST vs gRPC

| Aspecto | REST | gRPC |
|---------|------|------|
| Protocolo | HTTP/1.1 o HTTP/2 | HTTP/2 obligatorio |
| Serialización | JSON (human-readable) | Protobuf (binario, eficiente) |
| Tipado | Opcional (OpenAPI) | Obligatorio (proto files) |
| Streaming | Limitado | Bidireccional nativo |
| Ecosistema | Universal | Mejor en backend-to-backend |

REST para APIs públicas y mobile. gRPC para comunicación interna donde la performance importa.

### Circuit Breaker

Cuando un servicio downstream falla, el circuit breaker previene que el fallo se propague:

```javascript
const breaker = new CircuitBreaker(callExternalService, {
  timeout: 3000,          // Falla si tarda más de 3s
  errorThresholdPercentage: 50,  // Abre si >50% fallan
  resetTimeout: 30000     // Intenta cerrar después de 30s
});

breaker.fire(data)
  .then(result => process(result))
  .catch(err => handleDegradedMode(err));
```

## Comunicación Asíncrona

Los eventos y colas desacoplan servicios en el tiempo. El productor no necesita que el consumidor esté disponible.

### Event-Driven Architecture

```
Productor → Broker (Kafka/SQS) → Consumidor(es)
```

Ventajas:
- Los servicios pueden fallar y recuperarse sin pérdida de mensajes
- Múltiples consumidores pueden procesar el mismo evento
- Natural para workflows largos (sagas)

Desventajas:
- Debugging más complejo (flujo no lineal)
- Consistencia eventual puede ser difícil de razonar
- Idempotencia: los consumidores deben manejar duplicados

### Cuándo usar cada patrón

```
Síncrono  → cuando necesitás respuesta inmediata (queries, operaciones CRUD)
Asíncrono → cuando el procesamiento puede diferirse (emails, reportes, webhooks)
```

# Observabilidad

No podés mejorar lo que no podés medir. En sistemas distribuidos, la observabilidad es infraestructura, no una feature opcional.

## Los Tres Pilares

Los tres pilares de la observabilidad son complementarios:

**Métricas** — agregaciones numéricas en el tiempo (Prometheus, DataDog)
```
http_requests_total{status="500"} por minuto
p99 de latencia por endpoint
```

**Logs** — eventos discretos con contexto (estructurado en JSON)
```json
{"level":"error","trace_id":"abc123","user_id":42,"msg":"Payment failed","code":"INSUFFICIENT_FUNDS"}
```

**Trazas** — el viaje de una request a través de múltiples servicios (Jaeger, Tempo)

### Distributed Tracing

Cada request genera un `trace_id` que se propaga a través de todos los servicios involucrados:

```
[API Gateway] → [User Service] → [Payment Service] → [Notification Service]
  trace: abc    trace: abc        trace: abc            trace: abc
  span: 1       span: 2           span: 3               span: 4
```

Con trazas podés ver exactamente dónde se gastó el tiempo en una request lenta.

## SLOs y Error Budgets

Los SLOs (Service Level Objectives) son acuerdos internos sobre la confiabilidad aceptable:

```
SLO: 99.9% de requests HTTP 200 en ventana de 30 días
Error budget: 0.1% = ~43 minutos de downtime por mes
```

El error budget crea un lenguaje común entre desarrollo y operaciones. Cuando el budget está lleno, no se hacen cambios arriesgados. Cuando hay budget disponible, se pueden hacer experimentos.

# Seguridad en Arquitectura

La seguridad no se agrega al final — se diseña desde el inicio.

## Defense in Depth

No dependas de un solo control de seguridad. Cada capa debe asumir que la anterior puede fallar:

```
Internet
  └→ WAF (Web Application Firewall)
       └→ API Gateway (autenticación, rate limiting)
            └→ Servicios (autorización, validación)
                 └→ Base de datos (permisos mínimos, cifrado at rest)
```

## Principio de Mínimo Privilegio

Cada servicio debe tener solo los permisos que necesita para su función. Un servicio de lectura de catálogo no necesita acceso de escritura a la base de datos.

```yaml
# IAM Role para el servicio de catálogo
policies:
  - Effect: Allow
    Action:
      - dynamodb:GetItem
      - dynamodb:Query
    Resource: "arn:aws:dynamodb:*:*:table/products"
  # No tiene acceso a PutItem, DeleteItem ni a otras tablas
```

## Gestión de Secretos

Los secretos no van en el código, no van en variables de entorno hardcodeadas en imágenes, y no van en logs.

```
✓ AWS Secrets Manager / HashiCorp Vault
✓ Variables de entorno inyectadas en runtime por el orquestador
✓ Rotación automática de credenciales
✗ .env commiteado al repo
✗ Secretos en Dockerfile o en logs
```
