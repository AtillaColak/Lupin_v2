import React from "react"; 
import style from "../styles/Synch.css";  
import "../App.css";
import Rabbit from "./Rabbit";


function Synchronize({onClick}) {
    return (
        <div className="flex flex-col items-center justify-between h-screen bg-zinc-300">
            <h1 className="font-mono text-xl text-red-500 mb-12">Poke Lupin to Wake Him Up</h1>
            <Rabbit className="font-mono text-xl mt-10" onClick={onClick}/>
        </div>
    );
}

export default Synchronize;