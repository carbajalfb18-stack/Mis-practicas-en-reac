import { useState } from 'react'
function Prueba1() {
  
  const [contador, setContador] = useState(0);
  const[visible, setVisible] = useState(false);
  const[tareas, setTareas] = useState(["Matematicas"]);




  function sumar() {
    setContador (contador + 1)
  }

  function contadorR (valo){
    if(valo === "sumar") setContador(c => c + 1);
    if(valo === "restar") setContador(c => c - 1);
    if(valo === "reset") setContador(0);
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
    </div>
  
  </>)

  
}

export default Prueba1