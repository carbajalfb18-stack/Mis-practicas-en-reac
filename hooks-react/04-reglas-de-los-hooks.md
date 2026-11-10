# 04 · Las reglas de los hooks y los errores más comunes

## 1. Dos reglas que React no negocia

### Regla 1: solo en el nivel superior

Nunca dentro de `if`, `for`, `while` ni funciones anidadas.

**¿Por qué?** React **no sabe el nombre** de tus estados. Los identifica por el **orden** en que se llaman: "el primer `useState` es el contador, el segundo es el nombre…". Si un `if` hace que un hook se salte en algún render, el orden cambia y React confunde los datos.

```jsx
// ❌ MAL
if (logueado) {
  const [n, setN] = useState('');
}

// ✅ BIEN
const [n, setN] = useState('');
if (logueado) { /* usar n */ }
```

### Regla 2: solo en componentes o custom hooks

No en funciones JavaScript normales ni dentro de manejadores de eventos.

```jsx
// ❌ MAL: dentro de un manejador
function manejarClic() {
  const [x, setX] = useState(0);
}

// ❌ MAL: en una función normal
function calcular() {
  useEffect(() => {}, []);
}

// ✅ BIEN: en un componente (empieza con mayúscula) o un custom hook (empieza con use)
function MiComponente() { const [x, setX] = useState(0); }
function useMiHook()    { const [x, setX] = useState(0); }
```

**Si las rompes verás:** `Rendered more hooks than during the previous render` o `Invalid hook call`.

## 2. Otro caso traicionero: el return temprano

```jsx
// ❌ MAL: el useEffect no se ejecuta si cargando es true
function Perfil({ cargando }) {
  if (cargando) return <p>Cargando…</p>;
  const [datos, setDatos] = useState(null);
  useEffect(() => { /* ... */ }, []);
}

// ✅ BIEN: todos los hooks primero, los return después
function Perfil({ cargando }) {
  const [datos, setDatos] = useState(null);
  useEffect(() => { /* ... */ }, []);
  if (cargando) return <p>Cargando…</p>;
}
```

## 3. Tabla maestra de errores

| Síntoma | Causa probable | Solución |
|---|---|---|
| La pantalla no cambia | Mutas el estado o usas `let` | Usa el setter con un valor nuevo (`[...arr]`, `{...obj}`) |
| Cientos de peticiones en Network | Efecto sin arreglo de dependencias | Agrega `[]` o `[dep]` |
| El efecto usa un valor viejo | Falta una dependencia | Agrégala al arreglo o usa `x => ...` |
| `Rendered more hooks than…` | Hook dentro de `if`/`for` o después de un `return` | Mueve todos los hooks arriba |
| `"42"` no coincide con `42` | `useParams` siempre devuelve texto | `Number(id)` |
| `Too many re-renders` | `onClick={setX(1)}` | `onClick={() => setX(1)}` |
| `Each child in a list should have a unique "key"` | `map` sin `key` | `key={item.id}` |
| `Cannot read properties of undefined` | Datos aún no llegan de la API | Valor inicial correcto o `datos?.campo` |
| `Invalid hook call` | Hook fuera de un componente | Muévelo a un componente o custom hook |

## 4. Instala el linter

El plugin `eslint-plugin-react-hooks` detecta casi todos estos errores **mientras escribes**. Vite ya lo trae configurado: fíjate en los subrayados amarillos de tu editor, sobre todo el aviso `React Hook useEffect has a missing dependency`.

---

## Ejercicios

En cada caso: **¿qué regla se rompe, qué error aparece y cómo lo arreglas?**

### Ejercicio 4.1

```jsx
function Lista({ items }) {
  for (const item of items) {
    const [seleccionado, setSeleccionado] = useState(false);
  }
}
```

<details><summary>Solución</summary>

Rompe la regla 1 (hook dentro de un `for`). Si `items` cambia de tamaño, el número de hooks cambia.

**Arreglo:** crea un componente hijo `<Item />` con su propio `useState`, o guarda un arreglo de ids seleccionados en un solo estado:

```jsx
const [seleccionados, setSeleccionados] = useState([]);
```
</details>

### Ejercicio 4.2

```jsx
function App() {
  const [n, setN] = useState(0);
  return <button onClick={setN(n + 1)}>{n}</button>;
}
```

<details><summary>Solución</summary>

`setN(n + 1)` se **ejecuta** durante el render (no al hacer clic) → cambia el estado → nuevo render → se ejecuta otra vez… Error: `Too many re-renders`.

**Arreglo:** `onClick={() => setN(n + 1)}`.
</details>

### Ejercicio 4.3

```jsx
function Perfil({ id }) {
  if (!id) return <p>Sin usuario</p>;
  const [usuario, setUsuario] = useState(null);
  useEffect(() => { fetch(`/api/${id}`).then(r => r.json()).then(setUsuario); }, [id]);
  return <p>{usuario?.nombre}</p>;
}
```

<details><summary>Solución</summary>

Hooks después de un `return` temprano: si `id` pasa de vacío a tener valor, aparecen dos hooks nuevos. Error: `Rendered more hooks than during the previous render`.

**Arreglo:** mueve los dos hooks arriba del `if`, y dentro del efecto pon `if (!id) return;`.
</details>

### Ejercicio 4.4

```jsx
function formatearPrecio(p) {
  const [moneda] = useState('S/');
  return `${moneda} ${p}`;
}
```

<details><summary>Solución</summary>

Rompe la regla 2: es una función normal (no empieza con mayúscula ni con `use`). Además, no necesita estado: el valor nunca cambia.

**Arreglo:** `const formatearPrecio = p => \`S/ ${p.toFixed(2)}\`;`
</details>

### Ejercicio 4.5

```jsx
useEffect(() => {
  fetch(`/api/productos?cat=${categoria}`)
    .then(r => r.json())
    .then(setProductos);
}, []);
```

El usuario cambia de categoría y los productos no cambian. ¿Por qué?

<details><summary>Solución</summary>

Falta `categoria` en las dependencias. Con `[]`, solo se carga al montar.

**Arreglo:** `}, [categoria]);`
</details>

### Ejercicio 4.6

```jsx
const [config, setConfig] = useState({ tema: 'claro' });
useEffect(() => {
  setConfig({ ...config, cargado: true });
}, [config]);
```

<details><summary>Solución</summary>

Bucle infinito: el efecto depende de `config`, y al ejecutarse crea un **objeto nuevo** `config` → la dependencia cambió → vuelve a ejecutarse…

**Arreglo:** usa `[]` y la forma con función: `setConfig(c => ({ ...c, cargado: true }))`. O mejor: un estado aparte `const [cargado, setCargado] = useState(false)`.
</details>
