# 02 · useState: recordar un dato que cambia la pantalla

## 1. Sintaxis

```jsx
import { useState } from 'react';

function Contador() {
  const [contador, setContador] = useState(0);
  return (
    <button onClick={() => setContador(contador + 1)}>
      Clics: {contador}
    </button>
  );
}
```

| Parte | Qué es |
|---|---|
| `contador` | El valor actual. **Solo de lectura** |
| `setContador` | Guarda el nuevo valor **y pide un nuevo render** |
| `useState(0)` | Valor inicial. Solo se usa en el **primer** render |

Los corchetes `[a, b]` son **desestructuración de arreglos**: `useState` devuelve un arreglo de dos elementos. Por convención se nombran `algo` y `setAlgo`.

## 2. Puede guardar cualquier tipo de dato

```jsx
const [nombre, setNombre]     = useState('');          // texto
const [edad, setEdad]         = useState(18);          // número
const [activo, setActivo]     = useState(false);       // booleano
const [tareas, setTareas]     = useState([]);          // arreglo
const [usuario, setUsuario]   = useState({ nombre: '', email: '' }); // objeto
const [datos, setDatos]       = useState(null);        // "todavía no hay nada"
```

## 3. Regla de oro 1: el estado se reemplaza, nunca se modifica

React compara la **referencia** anterior con la nueva. Si es el mismo arreglo u objeto, asume que nada cambió y **no vuelve a dibujar**.

```jsx
// ❌ MAL: misma referencia
tareas.push(nueva);
setTareas(tareas);

usuario.nombre = 'Ana';
setUsuario(usuario);

// ✅ BIEN: un arreglo u objeto nuevo
setTareas([...tareas, nueva]);                    // agregar
setTareas(tareas.filter(t => t.id !== id));       // eliminar
setTareas(tareas.map(t =>                         // editar uno
  t.id === id ? { ...t, hecha: !t.hecha } : t
));
setUsuario({ ...usuario, nombre: 'Ana' });        // cambiar una propiedad
```

### Chuleta de operaciones inmutables

| Quiero… | Arreglo | Objeto |
|---|---|---|
| Agregar | `[...arr, x]` | `{ ...obj, nueva: x }` |
| Quitar | `arr.filter(...)` | `const { borrar, ...resto } = obj` |
| Editar | `arr.map(...)` | `{ ...obj, campo: nuevo }` |
| Ordenar | `[...arr].sort(...)` | — |

> ⚠️ `sort()`, `reverse()`, `push()`, `pop()`, `splice()` **modifican** el arreglo original. Haz una copia primero con `[...arr]`.

## 4. Regla de oro 2: si el valor nuevo depende del anterior, pasa una función

```jsx
// ❌ MAL: suma 1, no 3
setContador(contador + 1);
setContador(contador + 1);
setContador(contador + 1);

// ✅ BIEN: suma 3
setContador(c => c + 1);
setContador(c => c + 1);
setContador(c => c + 1);
```

¿Por qué? Las tres líneas leen el **mismo** `contador` de este render: las tres calculan `0 + 1`. Con la forma de función, React **encola** las funciones y le pasa a cada una el valor más reciente.

**Regla práctica:** dentro de temporizadores y efectos, usa **siempre** la forma con función.

## 5. El cambio no es inmediato

```jsx
function manejarClic() {
  setContador(contador + 1);
  console.log(contador); // ⚠️ imprime el valor VIEJO
}
```

`setContador` **pide** un nuevo render; no cambia la variable al instante. El nuevo valor aparece en el **siguiente** render.

## 6. Inputs controlados

Un input "controlado" es aquel cuyo valor lo maneja el estado:

```jsx
const [texto, setTexto] = useState('');

<input value={texto} onChange={e => setTexto(e.target.value)} />
```

- `value` → qué muestra (sale del estado).
- `onChange` → qué pasa cuando el usuario escribe (actualiza el estado).

Para un `<select>` es igual. Para un checkbox usa `checked` y `e.target.checked`.

### Formulario con un solo estado de objeto

```jsx
const [form, setForm] = useState({ nombre: '', email: '' });

function cambiar(e) {
  setForm({ ...form, [e.target.name]: e.target.value });
}

<input name="nombre" value={form.nombre} onChange={cambiar} />
<input name="email"  value={form.email}  onChange={cambiar} />
```

`[e.target.name]` es una **propiedad calculada**: usa el atributo `name` del input como clave.

## 7. Errores típicos

| Síntoma | Causa |
|---|---|
| La pantalla no cambia | Mutaste el estado (`push`, `obj.x = ...`) o usaste `let` |
| Suma de 1 en 1 aunque llames varias veces | No usaste la forma `c => c + 1` |
| `console.log` muestra el valor viejo | El estado se actualiza en el próximo render |
| `Cannot read properties of null (reading 'map')` | Estado inicial `null` y haces `.map()` sin verificar |
| `Too many re-renders` | Escribiste `onClick={setX(1)}` en vez de `onClick={() => setX(1)}` |

---

## Ejercicios

### Ejercicio 2.1: Contador completo (básico)

Crea un contador con tres botones: **−1**, **Reiniciar** y **+1**. El contador no debe bajar de 0.

<details><summary>Pista</summary>

Para no bajar de 0 puedes usar `Math.max(0, c - 1)` o deshabilitar el botón con `disabled={contador === 0}`.
</details>

<details><summary>Solución</summary>

```jsx
import { useState } from 'react';

export default function App() {
  const [contador, setContador] = useState(0);
  return (
    <div>
      <h1>{contador}</h1>
      <button onClick={() => setContador(c => Math.max(0, c - 1))}>−1</button>
      <button onClick={() => setContador(0)}>Reiniciar</button>
      <button onClick={() => setContador(c => c + 1)}>+1</button>
    </div>
  );
}
```
</details>

### Ejercicio 2.2: Mostrar u ocultar (básico)

Un botón que diga "Mostrar" u "Ocultar" y muestre u oculte un párrafo.

<details><summary>Pista</summary>

Usa un booleano. Para invertirlo: `setVisible(v => !v)`. Para mostrar condicionalmente: `{visible && <p>...</p>}`.
</details>

<details><summary>Solución</summary>

```jsx
const [visible, setVisible] = useState(false);
return (
  <>
    <button onClick={() => setVisible(v => !v)}>
      {visible ? 'Ocultar' : 'Mostrar'}
    </button>
    {visible && <p>¡Hola! Ahora me ves.</p>}
  </>
);
```
</details>

### Ejercicio 2.3: Saludo en vivo (básico)

Un input donde escribes tu nombre y debajo aparece `Hola, <nombre>!`. Si está vacío, muestra `Escribe tu nombre`. Muestra también cuántos caracteres llevas.

<details><summary>Solución</summary>

```jsx
const [nombre, setNombre] = useState('');
return (
  <>
    <input value={nombre} onChange={e => setNombre(e.target.value)} />
    <p>{nombre ? `Hola, ${nombre}!` : 'Escribe tu nombre'}</p>
    <small>{nombre.length} caracteres</small>
  </>
);
```
</details>

### Ejercicio 2.4: Encuentra el error (intermedio)

Este código no actualiza la lista. ¿Por qué? Corrígelo.

```jsx
const [frutas, setFrutas] = useState(['manzana']);

function agregar() {
  frutas.push('pera');
  setFrutas(frutas);
}
```

<details><summary>Solución</summary>

`push` modifica el **mismo** arreglo, así que React compara la referencia, ve que es igual y no redibuja.

```jsx
function agregar() {
  setFrutas([...frutas, 'pera']);
}
```
</details>

### Ejercicio 2.5: Predice (intermedio)

Si `n` vale 0, ¿cuánto vale después de un clic?

```jsx
<button onClick={() => {
  setN(n + 5);
  setN(n + 1);
  setN(x => x * 2);
}}>
```

<details><summary>Solución</summary>

**2.** Paso a paso:
1. `setN(n + 5)` → encola "poner 5".
2. `setN(n + 1)` → encola "poner 1" (`n` sigue siendo 0 en este render).
3. `setN(x => x * 2)` → toma el último valor encolado (1) y lo duplica → **2**.
</details>

### Ejercicio 2.6: Lista de tareas (intermedio)

Crea una lista de tareas (TODO) con:
- Un input y un botón **Agregar** (no agregues tareas vacías).
- Cada tarea con un checkbox para marcarla como hecha (texto tachado).
- Un botón **✕** para eliminarla.
- Un texto `Pendientes: N`.

Cada tarea debe ser un objeto `{ id, texto, hecha }`.

<details><summary>Pista 1: estado</summary>

Necesitas dos estados: `texto` (el input) y `tareas` (el arreglo). Para el `id` puedes usar `Date.now()` o `crypto.randomUUID()`.
</details>

<details><summary>Pista 2: operaciones</summary>

- Agregar → spread `[...]`
- Marcar → `map` con `{ ...t, hecha: !t.hecha }`
- Eliminar → `filter`
- Pendientes → `tareas.filter(t => !t.hecha).length` (¡no necesita estado propio!)
</details>

<details><summary>Solución</summary>

```jsx
import { useState } from 'react';

export default function App() {
  const [texto, setTexto] = useState('');
  const [tareas, setTareas] = useState([]);

  function agregar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    setTareas([...tareas, { id: Date.now(), texto: texto.trim(), hecha: false }]);
    setTexto('');
  }

  function alternar(id) {
    setTareas(tareas.map(t => (t.id === id ? { ...t, hecha: !t.hecha } : t)));
  }

  function eliminar(id) {
    setTareas(tareas.filter(t => t.id !== id));
  }

  const pendientes = tareas.filter(t => !t.hecha).length;

  return (
    <div>
      <form onSubmit={agregar}>
        <input value={texto} onChange={e => setTexto(e.target.value)} />
        <button>Agregar</button>
      </form>
      <ul>
        {tareas.map(t => (
          <li key={t.id}>
            <input type="checkbox" checked={t.hecha} onChange={() => alternar(t.id)} />
            <span style={{ textDecoration: t.hecha ? 'line-through' : 'none' }}>{t.texto}</span>
            <button onClick={() => eliminar(t.id)}>✕</button>
          </li>
        ))}
      </ul>
      <p>Pendientes: {pendientes}</p>
    </div>
  );
}
```

**Lección importante:** `pendientes` se **calcula** a partir de `tareas`. No crees estado para algo que puedes calcular: eso se llama *estado derivado*.
</details>

### Ejercicio 2.7: Formulario de registro (intermedio)

Formulario con `nombre`, `email` y `edad` usando **un solo** `useState` de objeto. Al enviarlo:
- Si algún campo está vacío, muestra un mensaje de error en rojo.
- Si la edad es menor de 18, muestra `Debes ser mayor de edad`.
- Si todo está bien, muestra una tarjeta con los datos y limpia el formulario.

<details><summary>Pista</summary>

Usa la función `cambiar` con `[e.target.name]`. Necesitarás estados adicionales para `error` y para `enviado`. Recuerda que `edad` llega como **texto**: usa `Number(form.edad)`.
</details>

<details><summary>Solución</summary>

```jsx
const vacio = { nombre: '', email: '', edad: '' };

export default function App() {
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(null);

  const cambiar = e => setForm({ ...form, [e.target.name]: e.target.value });

  function enviar(e) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.edad) return setError('Completa todos los campos');
    if (Number(form.edad) < 18) return setError('Debes ser mayor de edad');
    setError('');
    setEnviado(form);
    setForm(vacio);
  }

  return (
    <form onSubmit={enviar}>
      <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={cambiar} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={cambiar} />
      <input name="edad" type="number" placeholder="Edad" value={form.edad} onChange={cambiar} />
      <button>Registrar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {enviado && <div><h3>{enviado.nombre}</h3><p>{enviado.email} · {enviado.edad} años</p></div>}
    </form>
  );
}
```
</details>

### Ejercicio 2.8: Carrito de compras (reto)

Tienes este catálogo fijo:

```js
const productos = [
  { id: 1, nombre: 'Polo', precio: 40 },
  { id: 2, nombre: 'Gorra', precio: 25 },
  { id: 3, nombre: 'Zapatillas', precio: 180 },
];
```

Crea:
- Un botón **Agregar** por producto. Si el producto ya está en el carrito, aumenta su `cantidad` en lugar de duplicarlo.
- En el carrito, botones **+** y **−** por producto. Si la cantidad llega a 0, se elimina.
- El total en soles (`S/ 0.00`), calculado sin estado extra.

<details><summary>Pista</summary>

El carrito es un arreglo de `{ id, nombre, precio, cantidad }`. Para agregar: usa `find` para saber si ya existe; si existe, usa `map`; si no, usa spread. Para el total: `carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0)`. Para formatear: `total.toFixed(2)`.
</details>

<details><summary>Solución</summary>

```jsx
export default function App() {
  const [carrito, setCarrito] = useState([]);

  function agregar(prod) {
    const existe = carrito.find(p => p.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(p => (p.id === prod.id ? { ...p, cantidad: p.cantidad + 1 } : p)));
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
  }

  function cambiarCantidad(id, delta) {
    setCarrito(
      carrito
        .map(p => (p.id === id ? { ...p, cantidad: p.cantidad + delta } : p))
        .filter(p => p.cantidad > 0)
    );
  }

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  return (
    <div>
      <h2>Productos</h2>
      {productos.map(p => (
        <div key={p.id}>
          {p.nombre} · S/ {p.precio} <button onClick={() => agregar(p)}>Agregar</button>
        </div>
      ))}
      <h2>Carrito</h2>
      {carrito.length === 0 && <p>Vacío</p>}
      {carrito.map(p => (
        <div key={p.id}>
          {p.nombre} × {p.cantidad}
          <button onClick={() => cambiarCantidad(p.id, -1)}>−</button>
          <button onClick={() => cambiarCantidad(p.id, 1)}>+</button>
        </div>
      ))}
      <h3>Total: S/ {total.toFixed(2)}</h3>
    </div>
  );
}
```
</details>
