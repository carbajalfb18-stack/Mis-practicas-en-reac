# 06 · useRef: recordar sin redibujar y tocar el DOM

## 1. ¿Qué es?

`useRef` crea una "caja" `{ current: valor }` que React **recuerda entre renders**, pero que **no provoca un nuevo render** cuando la cambias.

```jsx
const ref = useRef(valorInicial);
ref.current;          // leer
ref.current = nuevo;  // escribir (sí se puede mutar)
```

| | `useState` | `useRef` |
|---|---|---|
| ¿Recuerda entre renders? | Sí | Sí |
| ¿Cambiarlo redibuja? | **Sí** | **No** |
| ¿Cómo se cambia? | `setX(nuevo)` | `ref.current = nuevo` |
| ¿Para qué? | Lo que se **ve** en pantalla | Lo que **no** se ve |

## 2. Uso 1: acceder a un elemento del DOM

```jsx
function Buscador() {
  const inputRef = useRef(null);
  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Buscar</button>
    </>
  );
}
```

Al pasar `ref={inputRef}`, React pone el elemento real del DOM en `inputRef.current`.

Cosas que puedes hacer con él:
- `.focus()` → poner el foco
- `.scrollIntoView({ behavior: 'smooth' })` → desplazarte hasta él
- `.play()` / `.pause()` → controlar un `<video>` o `<audio>`
- `.select()` → seleccionar el texto de un input

### Foco al cargar la página

```jsx
const inputRef = useRef(null);
useEffect(() => {
  inputRef.current.focus();
}, []);
```

Se hace en un efecto porque el elemento **no existe** hasta que React lo pinta.

## 3. Uso 2: guardar el id de un setInterval

```jsx
const intervaloRef = useRef(null);

function iniciar() {
  intervaloRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
}
function pausar() {
  clearInterval(intervaloRef.current);
}
```

No usamos `useState` porque el id no se muestra en pantalla: no tiene sentido redibujar al guardarlo.

## 4. Uso 3: recordar el valor anterior

```jsx
const [valor, setValor] = useState(0);
const anteriorRef = useRef(null);

useEffect(() => {
  anteriorRef.current = valor;   // se guarda DESPUÉS del render
}, [valor]);

// durante el render, anteriorRef.current todavía tiene el valor anterior
<p>Actual: {valor} · Anterior: {anteriorRef.current}</p>
```

## 5. Uso 4: contar sin redibujar

```jsx
const rendersRef = useRef(0);
rendersRef.current++;
console.log('Renders:', rendersRef.current);
```

## 6. Errores típicos

| Síntoma | Causa |
|---|---|
| `Cannot read properties of null (reading 'focus')` | Usas `ref.current` antes de que exista el elemento (durante el render, no en un efecto o evento) |
| Cambio `ref.current` y la pantalla no se actualiza | Es lo esperado. Si debe verse, usa `useState` |
| Escribí `ref={inputRef.current}` | Debe ser `ref={inputRef}`, sin `.current` |

> **Regla:** no leas ni escribas `ref.current` en medio del JSX para mostrar cosas. Úsalo en efectos y manejadores de eventos.

---

## Ejercicios

### Ejercicio 6.1: Foco automático (básico)

Un formulario de login con email y contraseña. Al cargar la página, el foco debe estar en el email.

<details><summary>Solución</summary>

```jsx
const emailRef = useRef(null);
useEffect(() => { emailRef.current.focus(); }, []);
return (
  <form>
    <input ref={emailRef} type="email" placeholder="Email" />
    <input type="password" placeholder="Contraseña" />
  </form>
);
```

Atajo: el atributo `autoFocus` hace lo mismo en este caso simple, pero la idea es practicar `useRef`.
</details>

### Ejercicio 6.2: ¿useState o useRef? (básico)

Para cada caso, elige el hook correcto:

a) El texto de un input que se muestra en pantalla.
b) El id de un `setTimeout` para cancelarlo después.
c) Cuántas veces el usuario hizo clic, mostrado en un contador.
d) Una referencia al `<video>` para pausarlo.
e) Si un modal está abierto o cerrado.
f) Si es el primer render (para no ejecutar algo al montar).

<details><summary>Solución</summary>

a) `useState` · b) `useRef` · c) `useState` · d) `useRef` · e) `useState` · f) `useRef`

**Pregunta clave:** ¿el usuario **ve** el cambio? Sí → `useState`. No → `useRef`.
</details>

### Ejercicio 6.3: Cronómetro con useRef (intermedio)

Rehaz el cronómetro del ejercicio 3.3, pero **sin** `useEffect`: inicia y pausa el intervalo directamente desde los botones, guardando su id en un `useRef`. Evita que al hacer doble clic en Iniciar se creen dos intervalos.

<details><summary>Pista</summary>

En `iniciar`, si `intervaloRef.current` ya tiene algo, sal con `return`. En `pausar`, haz `clearInterval` y vuelve a poner `intervaloRef.current = null`. Agrega también un `useEffect` con limpieza solo para cuando el componente se desmonte.
</details>

<details><summary>Solución</summary>

```jsx
export default function App() {
  const [segundos, setSegundos] = useState(0);
  const intervaloRef = useRef(null);

  function iniciar() {
    if (intervaloRef.current) return;
    intervaloRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
  }
  function pausar() {
    clearInterval(intervaloRef.current);
    intervaloRef.current = null;
  }
  function reiniciar() {
    pausar();
    setSegundos(0);
  }

  useEffect(() => () => clearInterval(intervaloRef.current), []);

  return (
    <div>
      <h1>{segundos}s</h1>
      <button onClick={iniciar}>Iniciar</button>
      <button onClick={pausar}>Pausar</button>
      <button onClick={reiniciar}>Reiniciar</button>
    </div>
  );
}
```
</details>

### Ejercicio 6.4: Ir a la sección (intermedio)

Una página con tres secciones largas (`<section style={{ height: 600 }}>`) y un menú arriba con tres botones. Cada botón hace scroll suave hasta su sección.

<details><summary>Solución</summary>

```jsx
export default function App() {
  const inicioRef = useRef(null);
  const serviciosRef = useRef(null);
  const contactoRef = useRef(null);
  const ir = ref => ref.current.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, background: '#fff' }}>
        <button onClick={() => ir(inicioRef)}>Inicio</button>
        <button onClick={() => ir(serviciosRef)}>Servicios</button>
        <button onClick={() => ir(contactoRef)}>Contacto</button>
      </nav>
      <section ref={inicioRef} style={{ height: 600 }}><h2>Inicio</h2></section>
      <section ref={serviciosRef} style={{ height: 600 }}><h2>Servicios</h2></section>
      <section ref={contactoRef} style={{ height: 600 }}><h2>Contacto</h2></section>
    </>
  );
}
```
</details>

### Ejercicio 6.5: Valor anterior (intermedio)

Un input numérico de precio. Debajo muestra `Precio anterior: X` y una flecha ⬆️ si subió o ⬇️ si bajó.

<details><summary>Solución</summary>

```jsx
export default function App() {
  const [precio, setPrecio] = useState(0);
  const anteriorRef = useRef(0);

  useEffect(() => {
    anteriorRef.current = precio;
  }, [precio]);

  const anterior = anteriorRef.current;
  const flecha = precio > anterior ? '⬆️' : precio < anterior ? '⬇️' : '';

  return (
    <>
      <input type="number" value={precio} onChange={e => setPrecio(Number(e.target.value))} />
      <p>Precio anterior: {anterior} {flecha}</p>
    </>
  );
}
```

Aquí se lee `ref.current` durante el render a propósito: es el patrón conocido de "valor anterior". Funciona porque el efecto actualiza la ref **después** de pintar.
</details>

### Ejercicio 6.6: Reproductor de video (reto)

Usa este video: `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`.

Crea botones propios **Play/Pausa** (un solo botón que cambia de texto), **−5 s** y **+5 s**, y muestra el tiempo actual del video.

<details><summary>Pista</summary>

- `videoRef.current.play()` / `.pause()`
- `videoRef.current.currentTime += 5`
- El estado `reproduciendo` sí va en `useState` (cambia el texto del botón).
- Para mostrar el tiempo, usa el evento `onTimeUpdate` del `<video>` y guarda `e.target.currentTime` en un estado.
</details>
