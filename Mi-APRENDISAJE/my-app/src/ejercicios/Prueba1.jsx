import { useState } from 'react'
function Prueba1() {
  
  const [contador, setContador] = useState(0);
  const[visible, setVisible] = useState(false);

  const[tareas, setTareas] = useState([]);
  const [texto, setTexto] = useState("");




  function sumar() {
    setContador (contador + 1)
  }

  function contadorR (valo){
    if(valo === "sumar") setContador(c => c + 1);
    if(valo === "restar") setContador(c => c - 1);
    if(valo === "reset") setContador(0);
  }

  function alternar (id){
    setTareas(tareas.map(t => (t.id === id ? { ...t  , hecha : !t.hecha} : t )));
  }

  const encontrarPendientes = tareas.filter(t => !t.hecha).length;

  function eliminar (id) {
    setTareas(tareas.filter(t =>t.id !== id));
  }

  function agregar(e) {
  e.preventDefault();
  if (!texto.trim()) return;
  setTareas([...tareas, { id: Date.now(), texto: texto.trim(), hecha: false }]);
  setTexto("");
  }


  return (
  
  <>
    <div>
      <h1>{contador}</h1>
      <button onClick={() => contadorR("restar")}>-1</button>
      <button onClick={() => contadorR("reset")}> Reiniciar</button>
      <button onClick={() => contadorR("sumar")}>+1</button>

      <br></br>

      <button onClick={() => setVisible(c => !c)}> {visible ? `Ahora me ves` : `Ahora no me ves`} </button>
      {visible && <p>Hola Mundo</p>}  

      <br></br>

      <input value={texto} onChange={e => setTexto(e.target.value)} />
      <button onClick={agregar}>Agregar</button>

     <ul>
          {tareas.map(t => (
            <li key={t.id}>
              <input type="checkbox" checked={t.hecha} onChange={() => alternar(t.id)} />
              <span>{JSON.stringify(t)}</span>  
              <button onClick={() => eliminar(t.id)}>✕</button>
            </li>
          ))}
     </ul>

    <p>Pendientes: {encontrarPendientes}</p>

    </div>
  
  </>)

  
}

export default Prueba1