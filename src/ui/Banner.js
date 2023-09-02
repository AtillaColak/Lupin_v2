import React from "react"; 
import { AiOutlineDownload } from "react-icons/ai";
import ClearButton from "./ClearButton";
import Information from "./Information";
import DownloadConvo from "./DownloadConvo";

function Banner({onClick, downloadHistory}){
    return (
        <div>
            <div className="flex justify-between items-center p-2 border-b-2 border-gray-400">
                <div className="flex items-center">
                    <img className="rounded-full w-12 h-12" src="../../lupin-pp.jpg"/>
                    <div className="pl-2">
                        <div className="font-semibold">
                            <a className="text-gray-700" href="#">Lupin</a>
                        </div>
                        <div className="text-xs text-gray-600">Online</div>
                    </div>
                </div>
                <div>
                    <ClearButton onClick={onClick}/>
                    <DownloadConvo onClick={downloadHistory}/>
                    <Information/> 
                </div>
            </div>
        </div>
    ); 

}

export default Banner; 