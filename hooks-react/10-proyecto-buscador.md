# 10 · Proyecto guiado: buscador de usuarios

La actividad de la diapositiva 24, más el reto de la diapositiva 26. Basado en el capítulo 4 de *React práctico*.

**Entrega:** repositorio en GitHub con **un commit por paso**.

## La API

```
https://randomuser.me/api/?results=12&gender=female&nat=US
```

| Parámetro | Valores |
|---|---|
| `results` | Cuántos usuarios (usa 12) |
| `gender` | `female`, `male` |
| `nat` | `US`, `ES`, `MX`, `BR`, `FR`, `GB`, `DE`… |

Abre esa URL en el navegador y mira la estructura. Lo que te importa:

```json
{
  "results": [
    {
      "login":    { "uuid": "a1b2c3…" },
      "name":     { "first": "Ana", "last": "López" },
      "picture":  { "medium": "https://…/women/12.jpg" },
      "location": { "country": "Spain" },
      "email":    "ana@example.com"
    }
  ]
}
```

---

## Paso 1 · useState: el estado

**Objetivo:** crear los estados `genero`, `pais` y `usuarios`, y dos `<select>` conectados.

Antes de escribir, responde:
1. ¿Qué tipo de dato es cada uno?
2. ¿Qué valor inicial le das a cada uno? (Mira la URL de ejemplo).
3. Si `usuarios` empieza en `null`, ¿qué pasa al hacer `.map()`?

**Comprobación:** pon `<p>{genero} - {pais}</p>` debajo. Si cambia al mover los selects, el paso está listo.

<details><summary>Pista</summary>

Inputs controlados: `value={estado}` + `onChange={e => setEstado(e.target.value)}`.
</details>

<details><summary>Solución del paso 1</summary>

```jsx
import { useState } from 'react';

export default function App() {
  const [genero, setGenero] = useState('female');
  const [pais, setPais] = useState('US');
  const [usuarios, setUsuarios] = useState([]);

  return (
    <div>
      <h1>Buscador de usuarios</h1>
      <select value={genero} onChange={e => setGenero(e.target.value)}>
        <option value="female">Mujeres</option>
        <option value="male">Hombres</option>
      </select>
      <select value={pais} onChange={e => setPais(e.target.value)}>
        <option value="US">Estados Unidos</option>
        <option value="ES">España</option>
        <option value="MX">México</option>
        <option value="BR">Brasil</option>
        <option value="FR">Francia</option>
      </select>
      <p>{genero} - {pais}</p>
    </div>
  );
}
```
</details>

📌 **Commit:** `Paso 1: estado de genero, pais y usuarios`

---

## Paso 2 · useEffect: pedir los datos

**Objetivo:** pedir 12 usuarios a la API cada vez que cambie `genero` o `pais`.

Responde:
1. ¿Qué va en el arreglo de dependencias?
2. ¿Qué pasa si no pones arreglo? (Revisa la pestaña Network si te atreves).
3. La respuesta trae `{ results: [...] }`. ¿Qué guardas en `usuarios`: la respuesta completa o solo `results`?

**Comprobación:** pon `console.log(usuarios)` y verifica que llegan 12 objetos al cambiar los filtros.

<details><summary>Pista</summary>

Construye la URL con un template string: `` `https://randomuser.me/api/?results=12&gender=${genero}&nat=${pais}` ``.
</details>

<details><summary>Solución del paso 2</summary>

```jsx
import { useState, useEffect } from 'react';

// dentro de App, después de los useState:
const [cargando, setCargando] = useState(false);

useEffect(() => {
  setCargando(true);
  fetch(`https://randomuser.me/api/?results=12&gender=${genero}&nat=${pais}`)
    .then(r => r.json())
    .then(datos => setUsuarios(datos.results))
    .finally(() => setCargando(false));
}, [genero, pais]);
```

Agregué un estado `cargando` extra: no lo pide la actividad, pero mejora mucho la experiencia.
</details>

📌 **Commit:** `Paso 2: cargar usuarios con useEffect`

---

## Paso 3 · map + key: mostrar las tarjetas

**Objetivo:** una tarjeta por usuario con foto, nombre completo y país.

Responde:
1. ¿Qué campo usas como `key`? Tiene que ser **único** y **estable**.
2. ¿Por qué no es buena idea usar el índice del `map` como `key`?

**Extra de estilo:** usa CSS Grid para mostrarlas en 3 o 4 columnas.

<details><summary>Pista</summary>

`u.login.uuid` es único. Nombre: `` `${u.name.first} ${u.name.last}` ``. Foto: `u.picture.medium`.
</details>

<details><summary>Solución del paso 3</summary>

```jsx
{cargando && <p>Cargando…</p>}

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
  {usuarios.map(u => (
    <div key={u.login.uuid} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, textAlign: 'center' }}>
      <img src={u.picture.medium} alt={u.name.first} style={{ borderRadius: '50%' }} />
      <h3>{u.name.first} {u.name.last}</h3>
      <p>{u.location.country}</p>
    </div>
  ))}
</div>
```

**¿Por qué no el índice?** Si la lista cambia de orden o se filtra, el índice 0 pasa a ser otro usuario y React puede reutilizar mal los elementos.
</details>

📌 **Commit:** `Paso 3: tarjetas de usuarios con map y key`

---

## Paso 4 · useRef: foco en el selector de país

**Objetivo:** al cargar la página, el foco debe estar en el `<select>` de país.

Responde:
1. ¿Por qué tiene que hacerse en un `useEffect` y no directamente en el cuerpo del componente?
2. ¿Qué dependencias lleva ese efecto?

<details><summary>Solución del paso 4</summary>

```jsx
import { useState, useEffect, useRef } from 'react';

const paisRef = useRef(null);

useEffect(() => {
  paisRef.current.focus();
}, []);

<select ref={paisRef} value={pais} onChange={e => setPais(e.target.value)}>
```

1. Durante el render el `<select>` todavía no existe en el DOM; en el efecto, sí.
2. `[]`: solo una vez, al montar.
</details>

📌 **Commit:** `Paso 4: foco inicial con useRef`

---

## 🏆 Reto para la próxima clase

### Reto 1 · Custom hook `useUsuarios(genero, pais)`

Mueve toda la lógica del paso 2 a `src/hooks/useUsuarios.js`. `App` debe quedar así:

```jsx
const { usuarios, cargando, error } = useUsuarios(genero, pais);
```

<details><summary>Solución del reto 1</summary>

```jsx
// src/hooks/useUsuarios.js
import { useState, useEffect } from 'react';

export function useUsuarios(genero, pais) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError(null);
    fetch(`https://randomuser.me/api/?results=12&gender=${genero}&nat=${pais}`, {
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then(d => setUsuarios(d.results))
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setCargando(false));
    return () => controller.abort();
  }, [genero, pais]);

  return { usuarios, cargando, error };
}
```
</details>

### Reto 2 · Ruta `/usuario/:id` con `useParams`

Cada tarjeta debe ser un `<Link>` a `/usuario/:id` que muestre el detalle del usuario (foto grande, email, teléfono, ciudad).

**El problema:** `randomuser.me` genera usuarios **al azar** en cada petición, así que no puedes pedir "el usuario con este id" a la API.

<details><summary>Pista: dos formas de resolverlo</summary>

**Opción A (simple):** pasa el usuario por el estado de la navegación:
```jsx
<Link to={`/usuario/${u.login.uuid}`} state={{ usuario: u }}>…</Link>

// en Detalle
import { useLocation, useParams } from 'react-router-dom';
const { id } = useParams();
const { state } = useLocation();
const u = state?.usuario;
```
Desventaja: si recargas la página del detalle, se pierde.

**Opción B (mejor):** sube los `usuarios` a un **Context** (archivo 05) y en el detalle búscalo con `usuarios.find(u => u.login.uuid === id)`.

**Opción C:** usa el parámetro `seed` de la API (`&seed=ulima`) para que siempre devuelva los mismos usuarios.
</details>

### Reto 3 · Volver con `useNavigate`

En el detalle, un botón **← Volver a la lista** con `navigate(-1)`.

---

## ✅ Lista de verificación antes de entregar

- [ ] Hay 4 commits (uno por paso) + los del reto.
- [ ] No hay avisos amarillos del linter (`missing dependency`).
- [ ] En Network solo hay **una** petición por cambio de filtro (dos en desarrollo por el modo estricto es normal).
- [ ] No sale el aviso de `key` en la consola.
- [ ] Al cargar, el foco está en el selector de país.
- [ ] Se muestra algo mientras carga y si hay un error.
