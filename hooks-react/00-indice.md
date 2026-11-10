# Hooks en React: guía de estudio

Basado en la clase **Semana 7: Hooks en React** (Programación Web 2026-2, Universidad de Lima).   CTR + SHIFT + V

Cada archivo es **independiente**: tiene la teoría, ejemplos, errores típicos y ejercicios con pistas y soluciones ocultas.

## Cómo usar esta guía

1. Lee la teoría del archivo.
2. Haz los ejercicios **sin mirar la solución**. Están dentro de bloques `<details>` que se despliegan con un clic.
3. Si te trabas, abre primero la **pista**. La solución va al final.
4. Avanza en orden: cada tema usa lo del anterior.

## Archivos

| # | Archivo | Tema | Pregunta que responde |
|---|---|---|---|
| 1 | [01-fundamentos.md](01-fundamentos.md) | Render y qué es un hook | ¿Por qué `let` no funciona? |
| 2 | [02-useState.md](02-useState.md) | `useState` | ¿Cómo guardo un dato que cambia la pantalla? |
| 3 | [03-useEffect.md](03-useEffect.md) | `useEffect` | ¿Cómo hablo con una API o un temporizador? |
| 4 | [04-reglas-de-los-hooks.md](04-reglas-de-los-hooks.md) | Reglas y errores | ¿Por qué me sale *Rendered more hooks…*? |
| 5 | [05-useContext.md](05-useContext.md) | `useContext` | ¿Cómo evito pasar props por todos lados? |
| 6 | [06-useRef.md](06-useRef.md) | `useRef` | ¿Cómo guardo algo sin redibujar o toco el DOM? |
| 7 | [07-useMemo-useCallback.md](07-useMemo-useCallback.md) | Optimización | ¿Cómo evito recalcular? |
| 8 | [08-custom-hooks.md](08-custom-hooks.md) | Custom hooks | ¿Cómo reutilizo lógica? |
| 9 | [09-react-router.md](09-react-router.md) | `useParams` y `useNavigate` | ¿Cómo leo la URL y cambio de página? |
| 10 | [10-proyecto-buscador.md](10-proyecto-buscador.md) | Proyecto guiado | Actividad de clase + reto |
| 11 | [11-examen-practica.md](11-examen-practica.md) | Autoevaluación | ¿Estoy listo para el examen? |

## Chuleta rápida: ¿qué hook necesito?

| Pregunta | Hook |
|---|---|
| ¿Debe cambiar la pantalla? | `useState` |
| ¿Hablo con algo fuera de React? | `useEffect` |
| ¿Componentes lejanos comparten el dato? | `useContext` |
| ¿Guardar sin redibujar o tocar el DOM? | `useRef` |
| ¿Un cálculo costoso se repite? | `useMemo` |
| ¿Una función es dependencia de un efecto? | `useCallback` |
| ¿Necesito un dato de la URL? | `useParams` |
| ¿Cambio de página desde el código? | `useNavigate` |

## Preparar un proyecto para practicar

```bash
npm create vite@latest practica-hooks -- --template react
cd practica-hooks
npm install
npm install react-router-dom   # solo para el archivo 09 y el proyecto
npm run dev
```

Cada ejercicio se puede resolver reemplazando el contenido de `src/App.jsx`.

> **Idea central del curso:** no le digas a React qué hacer. Dile qué debe mostrar.
