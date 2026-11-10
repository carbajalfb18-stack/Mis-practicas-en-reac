# 01 · Fundamentos: el render y qué es un hook

## 1. El problema

```jsx
function Contador() {
  let contador = 0;
  return (
    <button onClick={() => {
      contador++;
      console.log(contador);
    }}>
      Clics: {contador}
    </button>
  );
}
```

Después de tres clics:
- La **consola** muestra `3`.
- La **pantalla** muestra `Clics: 0`.

¿Dónde se perdieron los clics?

## 2. Un componente es una función que React vuelve a llamar

El ciclo es este:

```
Ocurre un evento  →  Se pide un cambio  →  React vuelve a   →  React compara y
(clic, tecla,         de estado              llamar Contador()    actualiza el DOM
 respuesta)
```

Cada vez que React llama a tu función se produce un **render**. En cada render la función se ejecuta **desde la primera línea**.

Por eso el ejemplo falla por **dos** motivos:
1. `let contador = 0` se vuelve a crear en cada render, así que siempre vale 0.
2. Modificar una variable normal **no avisa a React**, así que ni siquiera hay un nuevo render.

## 3. ¿Qué es un hook?

Un **hook** es una función cuyo nombre empieza con `use` y que conecta tu componente con React. Le da lo que una función normal no tiene:

| Necesidad | Hooks |
|---|---|
| Memoria entre renders | `useState`, `useRef` |
| Efectos (mundo exterior) | `useEffect` |
| Datos compartidos | `useContext` |
| Rendimiento | `useMemo`, `useCallback` |
| Router | `useParams`, `useNavigate` |

## 4. Vocabulario que debes dominar

| Término | Significado |
|---|---|
| **Render** | Cada vez que React ejecuta tu componente para saber qué mostrar |
| **Montar** | La primera vez que el componente aparece en pantalla |
| **Desmontar** | Cuando el componente desaparece de la pantalla |
| **Estado** | Un dato que React recuerda entre renders y que, al cambiar, provoca un nuevo render |
| **Props** | Datos que un componente padre le pasa a un hijo |
| **Efecto secundario** | Cualquier cosa que toca algo fuera de React: API, temporizador, `document`, `localStorage` |

---

## Ejercicios

### Ejercicio 1.1: Predice (básico)

¿Cuántas veces se imprime `"render"` en la consola si el usuario hace 2 clics?

```jsx
function App() {
  let n = 0;
  console.log('render');
  return <button onClick={() => n++}>{n}</button>;
}
```

<details><summary>Solución</summary>

**Solo una vez** (o dos en desarrollo, por el modo estricto). Cambiar `n` no avisa a React, así que nunca hay un nuevo render. Los clics modifican una variable que nadie mira.
</details>

### Ejercicio 1.2: Explica con tus palabras (básico)

Escribe en dos líneas por qué `let` no sirve para guardar datos que cambian la pantalla.

<details><summary>Respuesta modelo</summary>

Porque la función del componente se vuelve a ejecutar en cada render y `let` se reinicia. Además, cambiar una variable normal no le avisa a React que tiene que volver a dibujar.
</details>

### Ejercicio 1.3: Clasifica (básico)

¿Cuáles de estas cosas son **efectos secundarios**?

a) Calcular `precio * cantidad`
b) Hacer `fetch('/api/productos')`
c) Cambiar `document.title`
d) Devolver `<h1>Hola</h1>`
e) Guardar algo en `localStorage`
f) Iniciar un `setInterval`

<details><summary>Solución</summary>

**b, c, e, f.** Todos tocan algo fuera de React. a) y d) son cálculos puros: con la misma entrada dan siempre la misma salida.
</details>

### Ejercicio 1.4: ¿Es un hook? (básico)

¿Cuáles de estas funciones son hooks?

`useState` · `fetchUsuarios` · `useFetch` · `handleClick` · `useNavigate` · `usarDatos`

<details><summary>Solución</summary>

`useState`, `useFetch` y `useNavigate`. Un hook **debe** empezar con `use` (en inglés, en minúscula y seguido de mayúscula). `usarDatos` no cuenta: el linter de React no lo reconoce como hook.
</details>
