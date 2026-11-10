# 08 · Custom hooks: empaquetar lógica para reutilizarla

## 1. ¿Qué es un custom hook?

Es **solo una función** que:
1. Empieza con `use`.
2. Usa otros hooks dentro.
3. Devuelve lo que quieras (un valor, un objeto, un arreglo).

Y lo más importante: **cada componente que la usa tiene su propio estado**. No se comparte (para compartir está `useContext`).

## 2. El ejemplo de clase: useFetch

```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { setDatos(d); setCargando(false); });
  }, [url]);

  return { datos, cargando };
}
```

Así se usa:

```jsx
const { datos, cargando } = useFetch('/api/cursos');
```

### Versión mejorada (con error y cancelación)

```jsx
export function useFetch(url) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then(setDatos)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setCargando(false));

    return () => controller.abort();
  }, [url]);

  return { datos, cargando, error };
}
```

## 3. ¿Cuándo crear uno?

Cuando ves **la misma combinación de hooks** repetida en dos o más componentes:
- `useState` + `useEffect` para pedir datos → `useFetch`
- `useState` + `localStorage` → `useLocalStorage`
- `useState` + `useEffect` con `resize` → `useAnchoVentana`
- `useState` con `v => !v` → `useToggle`

## 4. ¿Objeto o arreglo?

```jsx
// Objeto: cuando devuelves varias cosas con nombre
return { datos, cargando, error };
const { datos, cargando } = useFetch(url);

// Arreglo: cuando imitas a useState (el usuario elige los nombres)
return [valor, setValor];
const [tema, setTema] = useLocalStorage('tema', 'claro');
```

## 5. Organización recomendada

```
src/
├── hooks/
│   ├── useFetch.js
│   ├── useLocalStorage.js
│   └── useToggle.js
├── components/
└── App.jsx
```

---

## Ejercicios

### Ejercicio 8.1: useToggle (básico)

Crea `useToggle(inicial = false)` que devuelva `[valor, alternar]`. Úsalo para mostrar u ocultar un menú.

<details><summary>Solución</summary>

```jsx
function useToggle(inicial = false) {
  const [valor, setValor] = useState(inicial);
  const alternar = () => setValor(v => !v);
  return [valor, alternar];
}

// uso
const [abierto, alternarMenu] = useToggle();
<button onClick={alternarMenu}>{abierto ? 'Cerrar' : 'Menú'}</button>
{abierto && <nav>…</nav>}
```
</details>

### Ejercicio 8.2: useContador (básico)

Crea `useContador(inicial = 0, paso = 1)` que devuelva `{ valor, sumar, restar, reiniciar }`. Usa **dos** contadores independientes en la misma página (uno de 1 en 1 y otro de 10 en 10) para comprobar que cada uno tiene su propio estado.

<details><summary>Solución</summary>

```jsx
function useContador(inicial = 0, paso = 1) {
  const [valor, setValor] = useState(inicial);
  return {
    valor,
    sumar: () => setValor(v => v + paso),
    restar: () => setValor(v => v - paso),
    reiniciar: () => setValor(inicial),
  };
}

export default function App() {
  const a = useContador();
  const b = useContador(0, 10);
  return (
    <>
      <p>A: {a.valor} <button onClick={a.sumar}>+</button><button onClick={a.restar}>−</button></p>
      <p>B: {b.valor} <button onClick={b.sumar}>+</button><button onClick={b.restar}>−</button></p>
    </>
  );
}
```
</details>

### Ejercicio 8.3: useLocalStorage (intermedio)

Crea `useLocalStorage(clave, inicial)` que funcione **igual que `useState`**, pero que guarde el valor en `localStorage` y lo recupere al recargar. Úsalo para recordar el nombre del usuario en un input.

<details><summary>Solución</summary>

```jsx
function useLocalStorage(clave, inicial) {
  const [valor, setValor] = useState(() => {
    const guardado = localStorage.getItem(clave);
    return guardado !== null ? JSON.parse(guardado) : inicial;
  });

  useEffect(() => {
    localStorage.setItem(clave, JSON.stringify(valor));
  }, [clave, valor]);

  return [valor, setValor];
}

// uso
const [nombre, setNombre] = useLocalStorage('nombre', '');
```
</details>

### Ejercicio 8.4: Refactoriza con useFetch (intermedio)

Toma tu solución del ejercicio 3.5 (lista de usuarios) y la del 3.6 (detalle de post) y reescríbelas usando la versión mejorada de `useFetch`. Cada componente debe quedar en menos de 15 líneas.

<details><summary>Solución (3.6)</summary>

```jsx
export default function App() {
  const [id, setId] = useState('1');
  const { datos: post, cargando, error } = useFetch(`https://jsonplaceholder.typicode.com/posts/${id}`);

  return (
    <div>
      <select value={id} onChange={e => setId(e.target.value)}>
        {[...Array(10)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
      </select>
      {cargando && <p>Cargando…</p>}
      {error && <p>{error}</p>}
      {post && !cargando && <article><h2>{post.title}</h2><p>{post.body}</p></article>}
    </div>
  );
}
```
</details>

### Ejercicio 8.5: useDebounce (reto)

Crea `useDebounce(valor, ms)` que devuelva el valor **solo después** de que deje de cambiar durante `ms` milisegundos. Luego reescribe el buscador del ejercicio 3.9 combinando `useDebounce` + `useFetch`.

<details><summary>Pista</summary>

Dentro: un `useState` con el valor "retrasado" y un `useEffect` con `[valor, ms]` que haga `setTimeout` y limpie con `clearTimeout`. Uso:

```jsx
const textoRetrasado = useDebounce(texto, 500);
const { datos } = useFetch(`…?title_like=${textoRetrasado}`);
```
</details>

<details><summary>Solución</summary>

```jsx
function useDebounce(valor, ms = 500) {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return retrasado;
}
```
</details>

### Ejercicio 8.6: useUsuarios (reto de la clase)

Este es el **reto 1 para la próxima clase**: extrae la carga del buscador de usuarios (archivo 10) a un hook `useUsuarios(genero, pais)` que devuelva `{ usuarios, cargando, error }`.

<details><summary>Pista</summary>

Puede usar `useFetch` por dentro, construyendo la URL con `genero` y `pais`. Ojo: `randomuser.me` devuelve `{ results: [...] }`, así que devuelve `datos?.results ?? []`.
</details>
