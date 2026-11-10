# 07 · useMemo y useCallback: evitar recalcular, pero solo cuando duele

## 1. El problema

En cada render, **todo** el cuerpo del componente se vuelve a ejecutar: los cálculos y también la creación de funciones.

```jsx
function Tienda({ productos }) {
  const [max, setMax] = useState(100);
  const [tema, setTema] = useState('claro');

  // se vuelve a filtrar aunque solo cambie el tema
  const baratos = productos.filter(p => p.precio < max);
}
```

Casi siempre esto **no importa**: JavaScript es rapidísimo. Pero si el cálculo es costoso (miles de elementos, ordenamientos pesados) o si una función se usa como dependencia de un efecto, conviene recordar el resultado.

## 2. useMemo: guarda un **valor**

```jsx
const baratos = useMemo(
  () => productos.filter(p => p.precio < max),
  [productos, max]
);
```

- Ejecuta la función y **guarda el resultado**.
- Solo vuelve a calcular si cambia algo del arreglo `[productos, max]`.
- Si solo cambia `tema`, devuelve el valor guardado.

## 3. useCallback: guarda una **función**

```jsx
const buscar = useCallback(async () => {
  const r = await fetch(`/api?q=${q}`);
  setDatos(await r.json());
}, [q]);
```

- Devuelve **la misma función** entre renders mientras `q` no cambie.
- `useCallback(fn, deps)` equivale a `useMemo(() => fn, deps)`.

### ¿Por qué importa que sea "la misma" función?

Cada render crea una función **nueva** (con otra referencia). Si esa función está en las dependencias de un efecto, el efecto se ejecutaría en **cada** render:

```jsx
// ❌ buscar es nueva en cada render → el efecto se ejecuta siempre
const buscar = async () => { /* fetch con q */ };
useEffect(() => { buscar(); }, [buscar]);

// ✅ buscar solo cambia cuando cambia q
const buscar = useCallback(async () => { /* fetch con q */ }, [q]);
useEffect(() => { buscar(); }, [buscar]);
```

Este es el patrón del buscador del libro *React práctico*.

## 4. Comparación

| | `useMemo` | `useCallback` |
|---|---|---|
| Guarda | El **resultado** de una función | La **función** misma |
| Devuelve | Un valor (número, arreglo, objeto…) | Una función |
| Ejemplo | Lista filtrada, total calculado | Manejador que va a un efecto o a un hijo |

## 5. Cuándo usarlos (y cuándo no)

**Son optimizaciones, no requisitos.** Úsalos si:
- ✅ Un cálculo es **costoso** y se repite sin necesidad.
- ✅ Una función es **dependencia de un `useEffect`**.
- ✅ Pasas una función u objeto a un hijo envuelto en `React.memo`.

**No los uses** para:
- ❌ Sumar dos números o concatenar texto.
- ❌ "Por si acaso" en todos lados: hacen el código más difícil de leer y también cuestan.

> En React 19 existe el **React Compiler**, que puede aplicar estas optimizaciones automáticamente. Aun así, debes entenderlos para el curso y para leer código existente.

## 6. Errores típicos

| Síntoma | Causa |
|---|---|
| El valor memorizado no se actualiza | Falta una dependencia en el arreglo |
| El efecto sigue ejecutándose en cada render | La función de las dependencias no está envuelta en `useCallback` |
| Confundir los dos | `useMemo(() => valor)` · `useCallback(funcion)` |

---

## Ejercicios

### Ejercicio 7.1: ¿useMemo, useCallback o nada? (básico)

a) `const total = precio * cantidad;`
b) Ordenar una lista de 10 000 productos por nombre.
c) Una función `cargarDatos` que se usa dentro de `useEffect` y aparece en sus dependencias.
d) `const saludo = 'Hola ' + nombre;`
e) Filtrar 5000 alumnos según un texto de búsqueda, en un componente que también tiene un reloj que se actualiza cada segundo.

<details><summary>Solución</summary>

a) Nada · b) `useMemo` · c) `useCallback` · d) Nada · e) `useMemo` (si no, el filtro se repite cada segundo por el reloj).
</details>

### Ejercicio 7.2: Mide la diferencia (intermedio)

Usa este generador de datos:

```js
const alumnos = Array.from({ length: 20000 }, (_, i) => ({
  id: i,
  nombre: `Alumno ${i}`,
  nota: Math.floor(Math.random() * 21),
}));
```

Crea un componente con:
- Un input de texto para filtrar por nombre.
- Un select de nota mínima (0 a 20).
- Un botón que alterne un tema claro u oscuro (estado independiente).
- La lista filtrada (muestra solo los primeros 50) y cuántos resultados hay.

Primero hazlo **sin** `useMemo`, y pon `console.time('filtro')` / `console.timeEnd('filtro')` alrededor del filtro. Haz clic en el botón de tema y mira la consola. Luego agrega `useMemo` y compara.

<details><summary>Solución</summary>

```jsx
const filtrados = useMemo(() => {
  console.time('filtro');
  const r = alumnos.filter(
    a => a.nombre.toLowerCase().includes(texto.toLowerCase()) && a.nota >= notaMin
  );
  console.timeEnd('filtro');
  return r;
}, [texto, notaMin]);
```

Con `useMemo`, al cambiar el tema **no** aparece el mensaje `filtro` en la consola: el cálculo no se repite.

Nota: `alumnos` debe estar **fuera** del componente; si no, se generaría un arreglo nuevo en cada render.
</details>

### Ejercicio 7.3: Arregla el efecto que se repite (intermedio)

Este componente hace una petición en **cada** render, incluso al escribir en el input `nota` que no tiene nada que ver. Arréglalo con `useCallback`.

```jsx
function Posts() {
  const [userId, setUserId] = useState(1);
  const [posts, setPosts] = useState([]);
  const [nota, setNota] = useState('');

  const cargar = async () => {
    const r = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    setPosts(await r.json());
  };

  useEffect(() => { cargar(); }, [cargar]);
  // ...
}
```

<details><summary>Solución</summary>

```jsx
const cargar = useCallback(async () => {
  const r = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
  setPosts(await r.json());
}, [userId]);

useEffect(() => { cargar(); }, [cargar]);
```

Ahora `cargar` solo es una función nueva cuando cambia `userId`, así que el efecto solo se repite en ese caso.

**Alternativa igual de válida:** mover la función **dentro** del efecto y usar `[userId]`.
</details>

### Ejercicio 7.4: Estadísticas (reto)

Con el arreglo de 20 000 alumnos del ejercicio 7.2, calcula con un solo `useMemo`: el promedio, la nota máxima, la mínima y cuántos aprobaron (nota ≥ 11), **solo de los alumnos filtrados**. Muéstralo en cuatro tarjetas.

<details><summary>Pista</summary>

Encadena dos `useMemo`: uno para `filtrados` (depende de `[texto, notaMin]`) y otro para `stats` (depende de `[filtrados]`). Devuelve un objeto `{ promedio, max, min, aprobados }`. Cuidado con la división entre 0 si no hay resultados.
</details>
