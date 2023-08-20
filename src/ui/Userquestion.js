import React, { useState } from "react";
import "../App.css";
import {AiOutlineSend} from "react-icons/ai"; 

function UserQuestion({submitHandleFunction}) {
  const [input, setInput] = useState(''); // The state to store the user's input
  const [limitReached, setLimitReached] = useState(false); 

  const handleChange = (e) => {
    const newInput = e.target.value; 
    if(newInput.length >= 3600 || newInput.split(" ").length >= 500){
      console.log('Limit reached'); // For debugging
      if(!limitReached) setLimitReached(true); 
    } else { 
      setInput(newInput); // Update the state when the user types
      if(limitReached) setLimitReached(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    console.log(`User submitted: ${input}`); // Handle the input 
    if(!limitReached){
      submitHandleFunction(input); 
      setInput(''); // Clear the input field
    }
  }

  return (
    <div className="flex flex-col h-screen justify-end items-center">
      <form onSubmit={handleSubmit} className="w-full flex flex-col">
        {/* Render error message conditionally */}
        {limitReached && <span className="text-red-500 mb-2 self-center">Input limit reached. Please shorten your text.</span>}

        <div className="flex">
          <textarea
            className="text-base resize-none w-full focus:outline-none h-9 focus:placeholder-gray-400 text-gray-50 placeholder-gray-50 bg-zinc-400 rounded-md"
            value={input}
            rows="2" 
            maxLength="3600"
            placeholder="Seek your Wisdom from Lupin"
            onChange={handleChange}
          />
          <button 
            type="submit" 
            className="w-1/5 bg-blue-400 rounded flex items-center justify-center">
            <AiOutlineSend size={26}/>
          </button>
        </div>
      </form> 
    </div>
  );  
}

export default UserQuestion;