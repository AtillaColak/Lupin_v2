import React from "react";
import { AiOutlineClear } from "react-icons/ai";

function ClearButton({onClick}){
    return (          
    <button onClick={onClick} className="mr-2 rounded border-2 border-gray-500 hover:bg-gray-200 focus:outline-none">
        <AiOutlineClear size={26} />
    </button>);
}

export default ClearButton; 