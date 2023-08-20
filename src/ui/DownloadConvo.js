import React from "react";
import {AiOutlineDownload} from "react-icons/ai"; 

function DownloadConvo({onClick}){
    return (
        <button onClick={onClick} className="mr-8 rounded border-2 border-gray-500 hover:bg-gray-200 focus:outline-none">
            <AiOutlineDownload size={26} />
        </button>
    ); 
}

export default DownloadConvo; 