# TypeScript: Fundamentos

TypeScript es JavaScript con tipos estáticos. El compilador detecta errores antes de que el código llegue al runtime.

## Por Qué TypeScript

El argumento central no es "tipos son buenos en abstracto" sino "los errores de tipo son la categoría de bugs más común en JavaScript, y TypeScript los elimina en tiempo de desarrollo".

En equipos grandes, la diferencia es dramática: refactors que serían arriesgados en JS se vuelven seguros cuando el compilador verifica todas las referencias.

## Tipos Básicos

```typescript
// Primitivos
let nombre: string = "Ana";
let edad: number = 30;
let activo: boolean = true;

// Arrays
let numeros: number[] = [1, 2, 3];
let nombres: Array<string> = ["Ana", "Bob"];

// Objetos
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol?: "admin" | "user";  // propiedad opcional con union type
}

// Funciones
function saludar(usuario: Usuario): string {
  return `Hola, ${usuario.nombre}`;
}
```

## Tipos Avanzados

```typescript
// Union types
type Estado = "activo" | "inactivo" | "pendiente";

// Intersection types
type AdminUser = Usuario & { permisos: string[] };

// Generics
function primero<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Type guards
function esString(valor: unknown): valor is string {
  return typeof valor === "string";
}
```

## Configuración del Compilador

El archivo `tsconfig.json` controla el comportamiento del compilador:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "outDir": "./dist"
  }
}
```

`strict: true` habilita un conjunto de checks estrictos. Activalo desde el inicio del proyecto — retroactivamente es doloroso.

# TypeScript: Patrones Prácticos

Con los fundamentos claros, estos patrones aparecen constantemente en código TypeScript de producción.

## Discriminated Unions

Modelar estados mutuamente excluyentes:

```typescript
type ResultadoAPI =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "ok"; datos: Usuario[] };

function renderizarEstado(resultado: ResultadoAPI) {
  switch (resultado.estado) {
    case "cargando": return <Spinner />;
    case "error":    return <Error mensaje={resultado.mensaje} />;
    case "ok":       return <Lista usuarios={resultado.datos} />;
  }
}
```

El compilador garantiza que manejás todos los casos. Si agregás un nuevo estado, el código que no lo maneja falla en compilación.

## Utility Types

TypeScript incluye tipos utilitarios para transformar tipos existentes:

```typescript
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

// Todos opcionales (para updates parciales)
type ProductoUpdate = Partial<Producto>;

// Solo lectura
type ProductoReadonly = Readonly<Producto>;

// Subset de propiedades
type ProductoCard = Pick<Producto, "id" | "nombre" | "precio">;

// Excluir propiedades
type ProductoSinId = Omit<Producto, "id">;
```

## Template Literal Types

```typescript
type Método = "GET" | "POST" | "PUT" | "DELETE";
type Ruta = "/users" | "/posts" | "/comments";

type Endpoint = `${Método} ${Ruta}`;
// "GET /users" | "GET /posts" | "POST /users" | ...

// Útil para eventos tipados
type EventKey = `on${Capitalize<string>}`;
```

## Zod: Validación en Runtime

Los tipos de TypeScript desaparecen en runtime. Para validar datos externos (APIs, formularios), usá una librería como Zod:

```typescript
import { z } from "zod";

const UsuarioSchema = z.object({
  id: z.number().positive(),
  nombre: z.string().min(1).max(100),
  email: z.string().email(),
  rol: z.enum(["admin", "user"]).optional()
});

// Tipo inferido automáticamente del schema
type Usuario = z.infer<typeof UsuarioSchema>;

// Validación en runtime
const resultado = UsuarioSchema.safeParse(datosExternos);
if (!resultado.success) {
  console.error(resultado.error.issues);
} else {
  const usuario = resultado.data; // Tipado y validado
}
```
