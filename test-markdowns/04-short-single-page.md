# Guía Rápida de Git

Git es el sistema de control de versiones más usado del mundo. Esta guía cubre los comandos esenciales para empezar.

## Comandos del Día a Día

Los comandos que usarás en cada sesión de trabajo:

```bash
# Ver estado del repositorio
git status

# Agregar cambios al staging
git add archivo.txt        # archivo específico
git add .                  # todos los cambios

# Crear un commit
git commit -m "feat: agregar autenticación de usuario"

# Subir cambios
git push origin main

# Traer cambios remotos
git pull origin main

# Ver historial
git log --oneline --graph
```

La convención **Conventional Commits** hace el historial más legible: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

## Ramas

```bash
# Crear y moverse a una rama
git checkout -b feature/login

# Listar ramas
git branch -a

# Mergear rama en main
git checkout main
git merge feature/login

# Eliminar rama (después de mergear)
git branch -d feature/login
```

> Trabajá siempre en ramas. Nunca commitees directo a `main` en proyectos compartidos.
