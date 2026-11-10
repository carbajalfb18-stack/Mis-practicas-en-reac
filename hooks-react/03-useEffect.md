# 03 · useEffect: sincronizar con lo que está fuera de React

## 1. ¿Para qué sirve?

Para hablar con cosas que **React no controla**:

| Categoría | Ejemplos |
|---|---|
| Pedir datos a una API | `fetch`, `axios` |
| Temporizadores | `setInterval`, `setTimeout` |
| APIs del navegador | `document.title`, `localStorage`, `window.addEventListener` |

```jsx
import { useState, useEffect } from 'react';

function Contador() {
  const [contador, setContador] = useState(0);

  useEffect(() => {
    document.title = `Clics: ${contador}`;
  }, [contador]);

  return <button onClick={() => setContador(c => c + 1)}>Clics: {contador}</button>;
}
```

El efecto se ejecuta **después** de que React pinta la pantalla.

## 2. El arreglo de dependencias

| Forma | ¿Cuándo se ejecuta? | Úsalo para |
|---|---|---|
| `useEffect(fn)` | Después de **cada** render | Casi nunca: es el origen de muchos bucles |
| `useEffect(fn, [])` | **Una sola vez**, al montar | La carga inicial de datos |
| `useEffect(fn, [id])` | Al montar y **cada vez que cambia** `id` | Recargar cuando cambia un filtro o un parámetro |

**Regla:** todo valor del componente (estado, props, funciones) que uses dentro del efecto va en el arreglo.

## 3. La función de limpieza

Si el efecto **abre** algo, debe **cerrarlo**:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setSegundos(s => s + 1);    // forma con función, siempre en temporizadores
  }, 1000);

  return () => clearInterval(id);   // ← limpieza
}, []);
```

La limpieza se ejecuta:
1. **Antes** de volver a ejecutar el efecto (cuando cambia una dependencia).
2. **Cuando el componente desaparece** de la pantalla.

| Si abres… | Cierras con… |
|---|---|
| `setInterval` | `clearInterval(id)` |
| `setTimeout` | `clearTimeout(id)` |
| `addEventListener` | `removeEventListener` (con la **misma** función) |
| Un `fetch` | `AbortController` → `controller.abort()` |

> En desarrollo, el **modo estricto** (`<StrictMode>`) monta, desmonta y vuelve a montar cada componente. Si ves todo doble (dos peticiones, el contador sube de 2 en 2), te falta la limpieza.

## 4. El patrón para pedir datos

```jsx
const [usuarios, setUsuarios] = useState([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setCargando(true);
  fetch('https://jsonplaceholder.typicode.com/users')
    .then(r => {
      if (!r.ok) throw new Error('Error ' + r.status);
      return r.json();
    })
    .then(datos => setUsuarios(datos))
    .catch(err => setError(err.message))
    .finally(() => setCargando(false));
}, []);

if (cargando) return <p>Cargando…</p>;
if (error) return <p>Error: {error}</p>;
return <ul>{usuarios.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
```

### Con `async/await`

La función del efecto **no puede** ser `async` (porque `async` devuelve una promesa, y el efecto solo puede devolver la limpieza). Crea una función dentro:

```jsx
useEffect(() => {
  async function cargar() {
    const r = await fetch(url);
    const datos = await r.json();
    setUsuarios(datos);
  }
  cargar();
}, [url]);
```

### Cancelar peticiones viejas (nivel pro)

Si `url` cambia rápido, una respuesta vieja podría llegar después de una nueva y pisarla:

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then(r => r.json())
    .then(setDatos)
    .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
  return () => controller.abort();
}, [url]);
```

## 5. El bucle infinito

```jsx
// ❌ MAL: bucle infinito
useEffect(() => {
  fetch(url).then(r => r.json()).then(d => setUsuarios(d));
});
```

```
render → efecto → fetch → setUsuarios → render → efecto → fetch → …
```

Abre la pestaña **Network** y verás cientos de peticiones. La solución es agregar `[url]`.

## 6. Cuándo NO usar useEffect

Si puedes **calcular** algo a partir del estado o las props, hazlo directamente en el render:

```jsx
// ❌ Innecesario
const [completo, setCompleto] = useState('');
useEffect(() => setCompleto(nombre + ' ' + apellido), [nombre, apellido]);

// ✅ Directo
const completo = nombre + ' ' + apellido;
```

Tampoco lo uses para responder a un clic: eso va en el `onClick`.

## 7. Errores típicos

| Síntoma | Causa |
|---|---|
| Cientos de peticiones en Network | Efecto sin arreglo de dependencias que cambia el estado |
| El efecto usa un valor viejo | Falta una dependencia en el arreglo |
| Todo pasa dos veces en desarrollo | Modo estricto, y falta la limpieza |
| El temporizador se acelera | No limpiaste el `setInterval` |
| `useEffect must not return anything besides a function` | Pusiste `async` en la función del efecto |

---

## Ejercicios

### Ejercicio 3.1: Título de la pestaña (básico)

Un input de texto. Lo que escribas debe aparecer como título de la pestaña del navegador. Si está vacío, el título es `Mi app`.

<details><summary>Solución</summary>

```jsx
const [texto, setTexto] = useState('');
useEffect(() => {
  document.title = texto || 'Mi app';
}, [texto]);
return <input value={texto} onChange={e => setTexto(e.target.value)} />;
```
</details>

### Ejercicio 3.2: Predice el orden (básico)

¿En qué orden se imprimen los mensajes al montar?

```jsx
function App() {
  console.log('A');
  useEffect(() => console.log('B'), []);
  console.log('C');
  return <p>{console.log('D')}</p>;
}
```

<details><summary>Solución</summary>

**A, C, D, B.** Todo el cuerpo de la función se ejecuta durante el render (A, C, y D al construir el JSX). El efecto corre **después** de pintar (B).
</details>

### Ejercicio 3.3: Cronómetro (intermedio)

Un cronómetro con botones **Iniciar**, **Pausar** y **Reiniciar**, que muestre `mm:ss`.

<details><summary>Pista</summary>

Usa dos estados: `segundos` y `corriendo` (booleano). El efecto depende de `[corriendo]`: si es `false`, no hace nada; si es `true`, crea el intervalo y devuelve la limpieza. Para formatear: `String(n).padStart(2, '0')`.
</details>

<details><summary>Solución</summary>

```jsx
export default function App() {
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setSegundos(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');

  return (
    <div>
      <h1>{mm}:{ss}</h1>
      <button onClick={() => setCorriendo(true)}>Iniciar</button>
      <button onClick={() => setCorriendo(false)}>Pausar</button>
      <button onClick={() => { setCorriendo(false); setSegundos(0); }}>Reiniciar</button>
    </div>
  );
}
```
</details>

### Ejercicio 3.4: Encuentra el error (intermedio)

El contador se queda en 1 y no sigue subiendo. ¿Por qué?

```jsx
useEffect(() => {
  const id = setInterval(() => setSegundos(segundos + 1), 1000);
  return () => clearInterval(id);
}, []);
```

<details><summary>Solución</summary>

Con `[]`, el efecto se ejecuta una sola vez y la función del intervalo **recuerda** el `segundos` del primer render (0). Cada segundo calcula `0 + 1 = 1`. A esto se le llama *closure obsoleto* (stale closure).

**Solución:** `setSegundos(s => s + 1)`.
</details>

### Ejercicio 3.5: Lista de usuarios desde una API (intermedio)

Usa `https://jsonplaceholder.typicode.com/users` para mostrar nombre, email y ciudad (`address.city`) de cada usuario. Muestra `Cargando…` mientras llega y un mensaje si hay error.

**Prueba el error:** cambia la URL a `/usersx` y verifica que aparece tu mensaje.

<details><summary>Solución</summary>

Usa el patrón completo de la sección 4 de este archivo y cambia el `map`:

```jsx
{usuarios.map(u => (
  <li key={u.id}><b>{u.name}</b> · {u.email} · {u.address.city}</li>
))}
```
</details>

### Ejercicio 3.6: Detalle según selección (intermedio)

Un `<select>` con los números del 1 al 10. Cada vez que cambias el número, carga `https://jsonplaceholder.typicode.com/posts/{n}` y muestra el `title` y el `body`.

<details><summary>Pista</summary>

El estado `id` va en las dependencias: `[id]`. Recuerda que `e.target.value` es texto, aunque aquí la URL lo acepta igual.
</details>

<details><summary>Solución</summary>

```jsx
export default function App() {
  const [id, setId] = useState('1');
  const [post, setPost] = useState(null);

  useEffect(() => {
    setPost(null);
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then(r => r.json())
      .then(setPost);
  }, [id]);

  return (
    <div>
      <select value={id} onChange={e => setId(e.target.value)}>
        {Array.from({ length: 10 }, (_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>
      {post ? <article><h2>{post.title}</h2><p>{post.body}</p></article> : <p>Cargando…</p>}
    </div>
  );
}
```
</details>

### Ejercicio 3.7: Guardar en localStorage (intermedio)

Toma la lista de tareas del ejercicio 2.6 y haz que **no se pierda al recargar** la página.

<details><summary>Pista</summary>

Dos piezas:
1. **Leer** al iniciar: `useState(() => JSON.parse(localStorage.getItem('tareas')) ?? [])`. Pasarle una función a `useState` hace que solo se lea una vez (*inicialización perezosa*).
2. **Guardar** cuando cambie: `useEffect(() => localStorage.setItem('tareas', JSON.stringify(tareas)), [tareas])`.
</details>

<details><summary>Solución</summary>

```jsx
const [tareas, setTareas] = useState(() => {
  const guardadas = localStorage.getItem('tareas');
  return guardadas ? JSON.parse(guardadas) : [];
});

useEffect(() => {
  localStorage.setItem('tareas', JSON.stringify(tareas));
}, [tareas]);
```
</details>

### Ejercicio 3.8: Ancho de la ventana (intermedio)

Muestra en pantalla el ancho actual de la ventana (`window.innerWidth`) y que se actualice al redimensionar. Además muestra `📱 Móvil` si es menor de 768 px y `🖥️ Escritorio` si no.

<details><summary>Solución</summary>

```jsx
const [ancho, setAncho] = useState(window.innerWidth);

useEffect(() => {
  const alCambiar = () => setAncho(window.innerWidth);
  window.addEventListener('resize', alCambiar);
  return () => window.removeEventListener('resize', alCambiar);
}, []);

return <p>{ancho}px · {ancho < 768 ? '📱 Móvil' : '🖥️ Escritorio'}</p>;
```

Fíjate en que `removeEventListener` recibe **la misma** función `alCambiar`. Si pasaras una función nueva, no quitaría nada.
</details>

### Ejercicio 3.9: Buscador con espera (debounce) (reto)

Un input que busque posts por título en `https://jsonplaceholder.typicode.com/posts?title_like=TEXTO`, pero que **espere 500 ms** después de que el usuario deje de escribir antes de hacer la petición. Verifica en Network que no se hace una petición por cada tecla.

<details><summary>Pista</summary>

En el efecto con `[texto]`, usa `setTimeout` para hacer el fetch a los 500 ms, y en la limpieza `clearTimeout`. Como la limpieza corre antes de cada nueva ejecución, cada tecla cancela el temporizador anterior.
</details>

<details><summary>Solución</summary>

```jsx
export default function App() {
  const [texto, setTexto] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!texto.trim()) { setPosts([]); return; }
    const id = setTimeout(() => {
      fetch(`https://jsonplaceholder.typicode.com/posts?title_like=${encodeURIComponent(texto)}`)
        .then(r => r.json())
        .then(setPosts);
    }, 500);
    return () => clearTimeout(id);
  }, [texto]);

  return (
    <div>
      <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Buscar…" />
      <p>{posts.length} resultados</p>
      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}
```
</details>
