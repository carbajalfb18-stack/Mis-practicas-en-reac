# 05 · useContext: compartir datos sin pasar props por todos lados

## 1. El problema: prop drilling

```
App           ← tiene usuario
 └─ Layout    ← no lo usa, solo lo pasa
     └─ Sidebar  ← no lo usa, solo lo pasa
         └─ Avatar  ← ¡lo necesita!
```

```jsx
function App()            { return <Layout usuario={usuario} />; }
function Layout({ usuario })  { return <Sidebar usuario={usuario} />; }
function Sidebar({ usuario }) { return <Avatar usuario={usuario} />; }
function Avatar({ usuario })  { return <img src={usuario.foto} />; }
```

`Layout` y `Sidebar` reciben `usuario` solo para pasarlo hacia abajo. Eso se llama **prop drilling** y deja de escalar cuando hay muchos niveles o muchos datos.

## 2. La solución en 3 pasos

```jsx
import { createContext, useContext, useState } from 'react';

// 1. CREAR (normalmente en su propio archivo)
export const UsuarioContext = createContext(null);

// 2. PROVEER, arriba del árbol
function App() {
  const [usuario, setUsuario] = useState({ nombre: 'Ana', foto: '/ana.png' });
  return (
    <UsuarioContext.Provider value={usuario}>
      <Layout />
    </UsuarioContext.Provider>
  );
}

// 3. CONSUMIR, donde se necesite
function Avatar() {
  const usuario = useContext(UsuarioContext);
  return <img src={usuario.foto} alt={usuario.nombre} />;
}
```

Ahora `Layout` y `Sidebar` ya no reciben ni pasan nada.

> En React 19 también puedes escribir `<UsuarioContext value={usuario}>` sin `.Provider`. Ambas formas funcionan; en clase se usa `.Provider`.

## 3. Compartir también la función para cambiarlo

Pasa un objeto con el valor **y** el setter:

```jsx
<TemaContext.Provider value={{ tema, setTema }}>
```

```jsx
const { tema, setTema } = useContext(TemaContext);
<button onClick={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')}>Cambiar tema</button>
```

## 4. Patrón profesional: Provider + custom hook

```jsx
// contexts/TemaContext.jsx
import { createContext, useContext, useState } from 'react';

const TemaContext = createContext(null);

export function TemaProvider({ children }) {
  const [tema, setTema] = useState('claro');
  const alternar = () => setTema(t => (t === 'claro' ? 'oscuro' : 'claro'));
  return (
    <TemaContext.Provider value={{ tema, alternar }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema debe usarse dentro de <TemaProvider>');
  return ctx;
}
```

```jsx
// main.jsx
<TemaProvider><App /></TemaProvider>

// cualquier componente
const { tema, alternar } = useTema();
```

`children` es todo lo que va entre las etiquetas `<TemaProvider>…</TemaProvider>`.

## 5. Cuándo usarlo y cuándo no

**Ideal para** datos **globales** que cambian poco:
- Usuario autenticado
- Tema claro u oscuro
- Idioma
- Carrito de compras

**Ojo:** cada cambio en `value` vuelve a renderizar **a todos los consumidores**. No lo uses para todo: si un dato solo lo usan un padre y su hijo, pasa props.

## 6. Errores típicos

| Síntoma | Causa |
|---|---|
| `useContext` devuelve `null` o `undefined` | El componente está **fuera** del `Provider` |
| `Cannot read properties of null` | Igual que arriba, o falta el valor por defecto en `createContext` |
| Se olvida importar | Hay que importar el **mismo** objeto de contexto que usa el `Provider` |

---

## Ejercicios

### Ejercicio 5.1: Tema claro u oscuro (básico)

Crea un `TemaContext`. En `App` pon un botón que alterne el tema. Crea un componente `Tarjeta` (anidado dentro de otro componente `Contenedor`) que cambie su fondo y color de texto según el tema, **sin recibir props**.

<details><summary>Solución</summary>

```jsx
import { createContext, useContext, useState } from 'react';

const TemaContext = createContext('claro');

function Tarjeta() {
  const tema = useContext(TemaContext);
  const estilos = tema === 'oscuro'
    ? { background: '#222', color: '#eee' }
    : { background: '#fff', color: '#222' };
  return <div style={{ ...estilos, padding: 16 }}>Tema actual: {tema}</div>;
}

function Contenedor() {
  return <section><Tarjeta /></section>;
}

export default function App() {
  const [tema, setTema] = useState('claro');
  return (
    <TemaContext.Provider value={tema}>
      <button onClick={() => setTema(t => (t === 'claro' ? 'oscuro' : 'claro'))}>Cambiar tema</button>
      <Contenedor />
    </TemaContext.Provider>
  );
}
```
</details>

### Ejercicio 5.2: Elimina el prop drilling (intermedio)

Refactoriza este código para que `Layout` y `Sidebar` no reciban `usuario`:

```jsx
function App() {
  const usuario = { nombre: 'Luis', rol: 'admin' };
  return <Layout usuario={usuario} />;
}
function Layout({ usuario })  { return <main><Sidebar usuario={usuario} /></main>; }
function Sidebar({ usuario }) { return <aside><Saludo usuario={usuario} /></aside>; }
function Saludo({ usuario })  { return <p>Hola, {usuario.nombre} ({usuario.rol})</p>; }
```

<details><summary>Solución</summary>

```jsx
const UsuarioContext = createContext(null);

function App() {
  const usuario = { nombre: 'Luis', rol: 'admin' };
  return (
    <UsuarioContext.Provider value={usuario}>
      <Layout />
    </UsuarioContext.Provider>
  );
}
function Layout()  { return <main><Sidebar /></main>; }
function Sidebar() { return <aside><Saludo /></aside>; }
function Saludo() {
  const usuario = useContext(UsuarioContext);
  return <p>Hola, {usuario.nombre} ({usuario.rol})</p>;
}
```
</details>

### Ejercicio 5.3: Login simulado (intermedio)

Crea un `AuthProvider` con:
- `usuario` (empieza en `null`)
- `login(nombre)` → guarda `{ nombre }`
- `logout()` → vuelve a `null`

Y un hook `useAuth()`. Luego:
- Un componente `Header` que muestre `Hola, <nombre>` y un botón **Salir**, o `No has iniciado sesión`.
- Un componente `FormLogin` con un input y un botón **Entrar**, visible solo si no hay usuario.

<details><summary>Pista</summary>

Sigue el patrón de la sección 4. El `value` del Provider es `{ usuario, login, logout }`.
</details>

<details><summary>Solución</summary>

```jsx
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const login = nombre => setUsuario({ nombre });
  const logout = () => setUsuario(null);
  return <AuthContext.Provider value={{ usuario, login, logout }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

function Header() {
  const { usuario, logout } = useAuth();
  return usuario
    ? <header>Hola, {usuario.nombre} <button onClick={logout}>Salir</button></header>
    : <header>No has iniciado sesión</header>;
}

function FormLogin() {
  const { usuario, login } = useAuth();
  const [nombre, setNombre] = useState('');
  if (usuario) return null;
  return (
    <form onSubmit={e => { e.preventDefault(); if (nombre) login(nombre); }}>
      <input value={nombre} onChange={e => setNombre(e.target.value)} />
      <button>Entrar</button>
    </form>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <FormLogin />
    </AuthProvider>
  );
}
```

Fíjate en que `useState` está **antes** del `if (usuario) return null`. Regla de los hooks respetada.
</details>

### Ejercicio 5.4: Carrito global (reto)

Lleva el carrito del ejercicio 2.8 a un `CarritoContext` con `agregar`, `cambiarCantidad` y `total`. Crea:
- `Catalogo` → lista de productos con el botón Agregar.
- `IconoCarrito` (en un `Header`) → muestra `🛒 N` con el número **total de unidades**.
- `ResumenCarrito` → el detalle con + y −.

Los tres deben estar en ramas distintas del árbol y comunicarse solo por el contexto.

<details><summary>Pista</summary>

Mueve toda la lógica del ejercicio 2.8 dentro de `CarritoProvider`. Las unidades totales: `carrito.reduce((acc, p) => acc + p.cantidad, 0)`.
</details>
