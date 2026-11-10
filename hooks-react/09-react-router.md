# 09 · React Router: useParams y useNavigate

## 0. Instalación y configuración mínima

```bash
npm install react-router-dom
```

```jsx
// main.jsx
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

```jsx
// App.jsx
import { Routes, Route, Link } from 'react-router-dom';

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Inicio</Link> · <Link to="/cursos">Cursos</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/cursos/:id" element={<Detalle />} />
        <Route path="*" element={<p>404: Página no encontrada</p>} />
      </Routes>
    </>
  );
}
```

> Usa `<Link to="…">` en vez de `<a href="…">`: `<a>` recarga toda la página y pierdes el estado.

## 1. useParams: leer datos de la URL

La ruta **declara** el parámetro con dos puntos (`:id`):

```jsx
<Route path="/cursos/:id" element={<Detalle />} />
```

El componente lo **lee**:

```jsx
import { useParams } from 'react-router-dom';

function Detalle() {
  const { id } = useParams();
  const { datos } = useFetch(`/api/cursos/${id}`);
  // ...
}
```

```
/cursos/42   →   useParams()   →   { id: "42" }
```

**⚠️ Ojo: siempre es texto.** Para comparar con un número, usa `Number(id)`:

```jsx
const curso = cursos.find(c => c.id === Number(id));   // ✅
const curso = cursos.find(c => c.id === id);           // ❌ "42" !== 42
```

### Varios parámetros

```jsx
<Route path="/cursos/:cursoId/alumnos/:alumnoId" element={<Alumno />} />

const { cursoId, alumnoId } = useParams();
```

## 2. useNavigate: cambiar de página desde el código

```jsx
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  async function ingresar() {
    const ok = await iniciarSesion(email, clave);
    if (ok) navigate('/dashboard');
  }
  // ...
}
```

| Llamada | Qué hace |
|---|---|
| `navigate('/dashboard')` | Ir a una ruta |
| `navigate(-1)` | Volver atrás (como el botón del navegador) |
| `navigate('/login', { replace: true })` | Ir sin dejar historial (el botón Atrás no regresa aquí) |

### ¿Link o navigate?

- **¿Un clic del usuario en un enlace?** → `<Link>`
- **¿Después de validar, guardar o una lógica?** → `navigate`

> ⚠️ No llames a `navigate()` directamente en el cuerpo del componente: hazlo en un evento o en un `useEffect`.

## 3. Extra útil: useSearchParams

Para la parte `?q=react&pagina=2` de la URL:

```jsx
import { useSearchParams } from 'react-router-dom';

const [params, setParams] = useSearchParams();
const q = params.get('q') ?? '';
setParams({ q: 'nuevo' });
```

## 4. Errores típicos

| Síntoma | Causa |
|---|---|
| `useNavigate() may be used only in the context of a <Router>` | Falta `<BrowserRouter>` en `main.jsx` |
| `"42"` no coincide con `42` | `useParams` siempre devuelve texto |
| La página se recarga entera | Usaste `<a href>` en vez de `<Link>` |
| `useParams` devuelve `{}` | El nombre en la ruta (`:id`) no coincide con el que lees |
| El detalle no cambia al pasar de `/cursos/1` a `/cursos/2` | Falta `id` en las dependencias del `useEffect` |

---

## Ejercicios

Usa este arreglo en un archivo `datos.js`:

```js
export const cursos = [
  { id: 1, nombre: 'Programación Web', creditos: 4, profesor: 'J. Romaina' },
  { id: 2, nombre: 'Base de Datos', creditos: 4, profesor: 'M. Torres' },
  { id: 3, nombre: 'Algoritmos', creditos: 3, profesor: 'L. Pérez' },
];
```

### Ejercicio 9.1: Lista y detalle (básico)

- `/cursos` → lista de cursos, cada uno con un `<Link>` a su detalle.
- `/cursos/:id` → nombre, créditos y profesor del curso.
- Si el id no existe (`/cursos/99`), muestra `Curso no encontrado`.

<details><summary>Solución</summary>

```jsx
function Cursos() {
  return (
    <ul>
      {cursos.map(c => <li key={c.id}><Link to={`/cursos/${c.id}`}>{c.nombre}</Link></li>)}
    </ul>
  );
}

function Detalle() {
  const { id } = useParams();
  const curso = cursos.find(c => c.id === Number(id));
  if (!curso) return <p>Curso no encontrado</p>;
  return (
    <article>
      <h2>{curso.nombre}</h2>
      <p>{curso.creditos} créditos · {curso.profesor}</p>
    </article>
  );
}
```
</details>

### Ejercicio 9.2: Botón volver (básico)

En el detalle, agrega un botón **← Volver** que regrese a la página anterior con `useNavigate`.

<details><summary>Solución</summary>

```jsx
const navigate = useNavigate();
<button onClick={() => navigate(-1)}>← Volver</button>
```
</details>

### Ejercicio 9.3: Anterior y siguiente (intermedio)

En el detalle, agrega botones **Anterior** y **Siguiente** que naveguen al curso con id − 1 e id + 1. Deshabilítalos en los extremos.

<details><summary>Solución</summary>

```jsx
const num = Number(id);
const navigate = useNavigate();
<button disabled={num <= 1} onClick={() => navigate(`/cursos/${num - 1}`)}>Anterior</button>
<button disabled={num >= cursos.length} onClick={() => navigate(`/cursos/${num + 1}`)}>Siguiente</button>
```
</details>

### Ejercicio 9.4: Login con redirección (intermedio)

- `/login` → formulario con usuario y contraseña. Si el usuario es `admin` y la contraseña `1234`, navega a `/panel` **sin dejar historial**. Si no, muestra un error.
- `/panel` → `Bienvenido al panel` y un botón **Cerrar sesión** que lleve a `/login`.

(Es una simulación de práctica: los datos están en el código, no es seguridad real).

<details><summary>Solución</summary>

```jsx
function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usuario: '', clave: '' });
  const [error, setError] = useState('');

  function enviar(e) {
    e.preventDefault();
    if (form.usuario === 'admin' && form.clave === '1234') {
      navigate('/panel', { replace: true });
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  }

  const cambiar = e => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={enviar}>
      <input name="usuario" value={form.usuario} onChange={cambiar} />
      <input name="clave" type="password" value={form.clave} onChange={cambiar} />
      <button>Entrar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```
</details>

### Ejercicio 9.5: Detalle desde una API (intermedio)

- `/usuarios` → lista desde `https://jsonplaceholder.typicode.com/users`.
- `/usuarios/:id` → detalle desde `https://jsonplaceholder.typicode.com/users/:id` (nombre, email, teléfono, empresa).
- En el detalle, un enlace a `/usuarios/:id/posts` que liste los posts de ese usuario (`/posts?userId=:id`).

<details><summary>Pista</summary>

Si ya tienes `useFetch` del archivo 08, cada página son unas pocas líneas. Recuerda que `useFetch` depende de la URL, así que si cambia `id`, recarga solo.
</details>

### Ejercicio 9.6: Protección de rutas (reto)

Combina el `AuthProvider` del ejercicio 5.3 con React Router. Crea un componente `<RutaPrivada>` que, si no hay usuario, redirija a `/login`:

```jsx
<Route path="/panel" element={<RutaPrivada><Panel /></RutaPrivada>} />
```

<details><summary>Pista</summary>

Usa el componente `<Navigate to="/login" replace />` de React Router (con mayúscula: es un componente, no el hook).

```jsx
function RutaPrivada({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" replace />;
}
```
</details>
