# 11 · Examen de práctica

Resuélvelo **sin mirar** los otros archivos. Anota tus respuestas y luego revisa las soluciones al final de cada parte.

**Puntaje:** Parte A (10 × 1) + Parte B (5 × 2) + Parte C (2 × 5) = **30 puntos**. Aprobado: 18.

---

## Parte A · Opción múltiple (1 punto cada una)

**A1.** ¿Qué devuelve `useState(0)`?
a) El número 0 · b) Un objeto `{ valor, set }` · c) Un arreglo `[valor, función]` · d) Una promesa

**A2.** ¿Cuándo se ejecuta `useEffect(fn, [])`?
a) En cada render · b) Una vez, al montar · c) Nunca · d) Antes del primer render

**A3.** ¿Cuál actualiza bien un arreglo en el estado?
a) `lista.push(x); setLista(lista)` · b) `setLista(lista.push(x))` · c) `setLista([...lista, x])` · d) `lista = [...lista, x]`

**A4.** ¿Qué hook usarías para guardar el id de un `setInterval`?
a) `useState` · b) `useRef` · c) `useMemo` · d) `useContext`

**A5.** `useParams()` en la URL `/productos/7` con la ruta `/productos/:id` devuelve:
a) `{ id: 7 }` · b) `{ id: "7" }` · c) `7` · d) `"7"`

**A6.** ¿Cuál es la diferencia entre `useMemo` y `useCallback`?
a) Ninguna · b) `useMemo` guarda un valor y `useCallback` una función · c) `useMemo` es para APIs · d) `useCallback` provoca un render

**A7.** ¿Qué problema resuelve `useContext`?
a) Bucles infinitos · b) Prop drilling · c) Peticiones lentas · d) Errores de `key`

**A8.** ¿Dónde está prohibido llamar a un hook?
a) Al inicio de un componente · b) Dentro de un custom hook · c) Dentro de un `if` · d) Antes del `return`

**A9.** ¿Para qué sirve la función que devuelve un `useEffect`?
a) Devolver datos al componente · b) Limpiar lo que abrió el efecto · c) Volver a ejecutar el efecto · d) Nada, es opcional y no se ejecuta

**A10.** Para ir a `/login` sin que el botón Atrás regrese aquí:
a) `navigate('/login')` · b) `navigate(-1)` · c) `navigate('/login', { replace: true })` · d) `<Link to="/login" />`

<details><summary>Respuestas de la Parte A</summary>

A1 c · A2 b · A3 c · A4 b · A5 b · A6 b · A7 b · A8 c · A9 b · A10 c
</details>

---

## Parte B · Predice o encuentra el error (2 puntos cada una)

**B1.** `n` empieza en 0. ¿Cuánto vale después de un clic?

```jsx
<button onClick={() => {
  setN(n + 1);
  setN(c => c + 1);
  setN(c => c + 1);
}}>
```

**B2.** ¿Qué pasa con este código?

```jsx
const [datos, setDatos] = useState([]);
useEffect(() => {
  fetch('/api/items').then(r => r.json()).then(setDatos);
});
```

**B3.** ¿Por qué falla y cómo lo arreglas?

```jsx
function Item({ visible }) {
  if (!visible) return null;
  const [abierto, setAbierto] = useState(false);
  return <div onClick={() => setAbierto(!abierto)}>…</div>;
}
```

**B4.** El usuario escribe en el input, pero `ref.current` cambia y la pantalla no muestra el nuevo valor. ¿Por qué?

```jsx
const ref = useRef('');
<input onChange={e => (ref.current = e.target.value)} />
<p>Escribiste: {ref.current}</p>
```

**B5.** ¿Por qué este detalle nunca encuentra el producto?

```jsx
const { id } = useParams();
const producto = productos.find(p => p.id === id); // p.id es un número
```

<details><summary>Respuestas de la Parte B</summary>

**B1.** **3.** La primera encola "poner 1", las dos siguientes suman 1 cada una al último valor: 1 → 2 → 3.

**B2.** **Bucle infinito.** No hay arreglo de dependencias: render → efecto → `setDatos` → render → … Arreglo: `}, []);`.

**B3.** El `useState` está después de un `return` temprano: si `visible` cambia, cambia el número de hooks (`Rendered more hooks…`). Arreglo: mueve el `useState` arriba del `if`.

**B4.** Cambiar `ref.current` **no provoca un render**. Para lo que se muestra en pantalla hay que usar `useState`.

**B5.** `useParams` devuelve texto: `"3" === 3` es `false`. Arreglo: `p.id === Number(id)`.
</details>

---

## Parte C · Programación (5 puntos cada una)

### C1. Reloj digital

Crea un componente que muestre la hora actual (`hh:mm:ss`) y se actualice cada segundo. Debe limpiar el intervalo al desmontarse. Agrega un botón que alterne entre formato de 24 h y de 12 h (con AM/PM).

**Rúbrica:**
- (1) Estado de la hora con `useState`
- (2) `useEffect` con `setInterval` y limpieza correcta
- (1) Estado para el formato y botón que lo alterna
- (1) Formato correcto con ceros a la izquierda

<details><summary>Solución C1</summary>

```jsx
import { useState, useEffect } from 'react';

export default function Reloj() {
  const [ahora, setAhora] = useState(new Date());
  const [formato24, setFormato24] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dos = n => String(n).padStart(2, '0');
  let h = ahora.getHours();
  let sufijo = '';
  if (!formato24) {
    sufijo = h >= 12 ? ' PM' : ' AM';
    h = h % 12 || 12;
  }

  return (
    <div>
      <h1>{dos(h)}:{dos(ahora.getMinutes())}:{dos(ahora.getSeconds())}{sufijo}</h1>
      <button onClick={() => setFormato24(f => !f)}>
        Cambiar a {formato24 ? '12 h' : '24 h'}
      </button>
    </div>
  );
}
```
</details>

### C2. Galería de fotos con detalle

Con `https://jsonplaceholder.typicode.com/photos?_limit=12`:
- `/` → cuadrícula de miniaturas (`thumbnailUrl`) con su título. Cada una es un `<Link>` a `/foto/:id`.
- `/foto/:id` → la foto grande (`url`, desde `/photos/:id`), su título y un botón **← Volver** con `useNavigate`.
- Usa un custom hook `useFetch` en ambas páginas.
- Muestra `Cargando…` mientras llegan los datos.

> Nota: si las imágenes de `via.placeholder.com` no cargan, usa `https://picsum.photos/id/${foto.id}/150` como alternativa.

**Rúbrica:**
- (1) Router configurado con las dos rutas
- (1) `useFetch` como custom hook reutilizado
- (1) Lista con `map` y `key`
- (1) Detalle con `useParams`, con el id en las dependencias
- (1) Botón volver con `useNavigate` y estado de carga

<details><summary>Solución C2</summary>

```jsx
// main.jsx → envuelve <App /> en <BrowserRouter>

import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useFetch } from './hooks/useFetch';

const API = 'https://jsonplaceholder.typicode.com/photos';

function Galeria() {
  const { datos: fotos, cargando } = useFetch(`${API}?_limit=12`);
  if (cargando) return <p>Cargando…</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {fotos.map(f => (
        <Link key={f.id} to={`/foto/${f.id}`}>
          <img src={`https://picsum.photos/id/${f.id}/150`} alt={f.title} />
          <p>{f.title}</p>
        </Link>
      ))}
    </div>
  );
}

function DetalleFoto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { datos: foto, cargando } = useFetch(`${API}/${id}`);
  if (cargando) return <p>Cargando…</p>;
  return (
    <article>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <img src={`https://picsum.photos/id/${foto.id}/600`} alt={foto.title} />
      <h2>{foto.title}</h2>
    </article>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Galeria />} />
      <Route path="/foto/:id" element={<DetalleFoto />} />
    </Routes>
  );
}
```

Como `useFetch` tiene `[url]` en sus dependencias y la URL incluye `id`, el detalle se recarga solo cuando cambia el parámetro.
</details>

---

## ¿Cómo te fue?

| Puntaje | Qué hacer |
|---|---|
| 26–30 | ¡Listo! Ataca los ejercicios de reto de cada archivo |
| 18–25 | Repasa los temas de las preguntas que fallaste |
| < 18 | Vuelve a los archivos 02 y 03: `useState` y `useEffect` son la base de todo |
