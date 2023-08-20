import React, {useState} from "react";
import { AiFillInfoCircle } from "react-icons/ai";

function Information(){

    const [isInfoVisible, setIsInfoVisible] = useState(false); 


	function revealInfo(){
		setIsInfoVisible(prevState => !prevState);
	}

    return (   
        <span>       
        <button onClick={revealInfo} className="mr-2 rounded border-2 border-gray-500 hover:bg-gray-200 focus:outline-none">
            <AiFillInfoCircle size={26} />
        </button>
            {isInfoVisible && 
            <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-5 rounded shadow-md">
                <p>For better results, please keep your questions concise and to the point. The broom erases chat history and download button downloads the conversation as pdf.</p>
                <button onClick={revealInfo} className="mt-4 px-4 py-2 bg-blue-400 text-white rounded">Close</button>
            </div>
            </div>}
        </span>
    );
}

export default Information; 