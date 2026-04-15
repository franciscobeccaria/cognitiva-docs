# Guía de Docker

Docker es una plataforma de contenedores que permite empaquetar aplicaciones junto con sus dependencias en unidades portables llamadas contenedores.

## Instalación

Descargá Docker Desktop desde el sitio oficial. En macOS y Windows viene con una interfaz gráfica. En Linux, instalá el engine directamente con el package manager de tu distribución.

```bash
# Ubuntu/Debian
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

Verificá la instalación:
```bash
docker --version
docker run hello-world
```

## Conceptos Básicos

Los tres conceptos centrales de Docker son:

| Concepto | Descripción |
|----------|-------------|
| **Imagen** | Plantilla de solo lectura para crear contenedores |
| **Contenedor** | Instancia ejecutable de una imagen |
| **Registry** | Repositorio donde se almacenan imágenes (ej: Docker Hub) |

Una imagen se define mediante un `Dockerfile`. El contenedor es lo que corre en producción.

## Dockerfile

El `Dockerfile` es el archivo de receta que describe cómo construir una imagen.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Buenas prácticas:
- Usá imágenes base livianas (`alpine` cuando sea posible)
- Ordená las instrucciones de menos a más frecuentemente cambiadas (cache layers)
- No incluyas secretos en el Dockerfile

## Comandos Esenciales

Los comandos más usados en el día a día:

```bash
# Construir imagen
docker build -t mi-app:v1 .

# Correr contenedor
docker run -d -p 3000:3000 --name mi-app mi-app:v1

# Ver contenedores activos
docker ps

# Ver logs
docker logs -f mi-app

# Detener y eliminar
docker stop mi-app && docker rm mi-app
```

## Volúmenes y Redes

Los contenedores son efímeros por naturaleza. Los volúmenes persisten datos entre reinicios.

```bash
# Crear volumen
docker volume create mis-datos

# Montar volumen en contenedor
docker run -v mis-datos:/app/data mi-app:v1
```

Las redes permiten comunicación entre contenedores:
```bash
docker network create mi-red
docker run --network mi-red --name db postgres:15
docker run --network mi-red --name api mi-app:v1
```

## Docker Compose

Para aplicaciones con múltiples servicios, Docker Compose simplifica la gestión:

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/mydb

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: pass

volumes:
  pgdata:
```

Iniciá todos los servicios con `docker compose up -d`.
