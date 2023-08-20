import React from "react"; 
import style from "../styles/rabbit.css"

function Rabbit({onClick}){ 
    return (    <div className="container">
    <div className="tail"></div>
    <span className="z-1">Z</span>
    <span className="z-2">Z</span>
    <span className="z-3">Z</span>
    <div onClick={onClick} className="rabbit-body">
      <div onClick={onClick} className="face-container">
        <div className="rabbit-face">
          <div className="ear"></div>
          <div className="eye-l"></div>
          <div className="eye-r"></div>
          <div className="mouth"></div>
        </div>
      </div>
      <div className="leaf"></div>
      <div className="carrot"></div>
      <div className="hand-l"></div>
      <div className="hand-r"></div>
    </div>
    <div className="shadow"></div>
  </div>
); 
}

export default Rabbit;