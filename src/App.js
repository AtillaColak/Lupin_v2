/* global chrome */

import React from "react"; 
import "./App.css";
import { useState, useEffect, useRef } from "react";
import UserQuestion from "./ui/Userquestion";
import ChatBubble from "./ui/ChatBubble"; 
import Banner from "./ui/Banner.js"; 
import Ai from "./api/ai"; 
import Synchronize from "./ui/Synchronize"; 
import {jsPDF} from "jspdf";
import sanitizeHtml from 'sanitize-html';


// store chathistory as array of objects with each object having array of chathistory and it's page id. the window size will be at most 5, so the 6th least used page data is cleared from the array and we don't overflow the local Storage. Have to clear everything if overflown storage or close to that. 

// LRU for caching with size of 5 windows. 
// npm install --save-dev copyfiles to "postbuild": "copyfiles -u 1 ./src/manifest.json ./build" and automate moving manifest to build. 
const MAX_HISTORY_COUNT = 5; 

function App() {

	// const [aiResponse, setAiResponse] = useState(""); 
	// set initial chatHistory value to localStorage history if no null, otherwise empty array. 
	const [chatHistory, setChatHistory] = useState(loadChatHistory(window.location.href));	

	const [pageBody, setPageBody] = useState(null); 

	const messagesEndRef = useRef(null)

	const scrollToBottom = () => {
	  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}
  
	useEffect(() => {
	  scrollToBottom(); 
	  if(chatHistory.length >= 80) {
		setTimeout(handleClear, 3500);  // Clear chat history after 2 seconds delay
	  } 
	}, [chatHistory]);  

	function getFormattedDateAndTime(date) {
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0'+minutes : minutes;
		const strTime = hours + ':' + minutes + ' ' + ampm;
		return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
	}	
	
	function downloadHistory(){
		const now = new Date();
		const report_generated_at = getFormattedDateAndTime(now);
	
		const doc = new jsPDF({ format: "a4" });
		var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
	
		doc.setFontSize(22);
		doc.text('Chat History', (pageWidth / 2) - 28, 25);
	
		let y = 40;  // Y position to start the chat history
	
		for (let i = 0; i < chatHistory.length; i++) {
			let speakerStr = '';
			let chatStr = '';
	
			if (chatHistory[i].from === "User") {
				speakerStr = "User: ";
				chatStr = chatHistory[i].text;
			} else {
				speakerStr = "Lupin: ";
				chatStr = chatHistory[i].text;
			}
	
			// Set font size for the speaker name
			doc.setFontSize(14);
			doc.setFont('helvetica', 'bolditalic');
	
			let speakerWidth = doc.getTextWidth(speakerStr);
			doc.text(speakerStr, 10, y);
	
			// Reset font size for the chat content
			doc.setFontSize(12);
			doc.setFont('helvetica', 'normal');
	
			let chatWidth = doc.getTextWidth(chatStr);
			let chatLines = doc.splitTextToSize(chatStr, pageWidth - 10 - speakerWidth);  // Wrap the chat text to fit the page
	
			for (let line of chatLines) {
				y += 10;
				if (y > doc.internal.pageSize.height - 30) {  // Check if we need to add a new page
					doc.text(`Generated at: ${report_generated_at}`, 10, doc.internal.pageSize.height - 10);  // footer
					doc.addPage();
					y = 20;  // Reset y for the new page
				}
	
				doc.text(line, 10 + speakerWidth, y);
			}
			y += 10;
		}
	
		doc.save('ChatHistory.pdf');
	}

	function updateChatHistory(tabId, question, aiResponse) {

		const message = { from: "User", text: question };
		const response = { from: "ai", text: aiResponse };
	  
		let tempHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
	  
		if (tempHistory.length === 0) tempHistory.push({ id: tabId, history: [message, response] });
		else {
		  let pageChat = tempHistory.find((x) => x.id === tabId);
		  if (pageChat) {
			// Update chat history for this page
			pageChat.history.push(message, response);
		  } else {
			if (tempHistory.length === MAX_HISTORY_COUNT) {
			  // Remove the least recently used chat history
			  tempHistory.shift();
			}
	  
			// Add new chat history
			tempHistory.push({ id: tabId, history: [message, response] });
		  }
		}
	  
		// Store back to localStorage as well as update chatHistory.
		localStorage.setItem('chatHistory', JSON.stringify(tempHistory));
		setChatHistory(loadChatHistory(tabId));
	}
	
	// On page load
	function loadChatHistory(tabId) {
		let tempHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
		const pageChat = tempHistory.find((x) => x.id === tabId);
		return pageChat ? pageChat.history : [];	  
	}

	// sends the message to get the body of the current page. 
	function scrapePage() {
		if (typeof chrome !== "undefined") {
		  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const activeTab = tabs[0];
			try {
			  chrome.tabs.sendMessage(activeTab.id, { message: "scrape" }, (response) => {
				setPageBody(response);
				setChatHistory(loadChatHistory(activeTab.id));
			  });
			} catch (error) {
			  console.error('Failed to send message to content script:', error);
			}
		  });
		} else {
		  console.log('Chrome object is not available');
		}
	}
	  
	// method to be called when a user submits a question. 
	async function handleSubmit(question) {
		let aiResponse = ""; 
		if (!question || question.trim() === "" || !(/[a-zA-Z]/.test(question))) {
			aiResponse = "Sorry, could you please rephrase?";
		}
		else if (pageBody && typeof pageBody === 'object') {
		  const { title, bodyText } = pageBody;
	  
		  // clean HTML with sanitize-html
		  const cleanHtml = sanitizeHtml(bodyText, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'span', 'div', 'p','h2','b','i','u','strong','h1','em','h3']),
			allowedAttributes: {
			  'a': ['href', 'name', 'target'],
			  'img': ['src']
			}
		  });
		  const text = cleanHtml.replace(/(&lt;([^>]+)>)/gi, "");
	  
		  // Convert HTML to plain text with strip-html	  
		  let start, end;

		  if (text.length < 3000) {
			start = 0;
			end = text.length;
		  } else if (text.length >= 3000 && text.length < 6000) {
			start = 800;
			end = 4000;
		  } else if (text.length >= 6000) {
			start = 2800;
			end = 6000;
		  }
		  
		  const prompt = `You are Lupin the Bunny, you have a playful, educatory and fun talking style. 
		  so answer this question also considering the content. Keep your answers concise and to the point. Avoid any fluff! \nContent: ${text.substring(start, end)}\nQuestion: ${question}`;
		  // if people like this extension, improve the text handling method by summarizing smaller parts of it and concatenate at the end.
		  // Call the aiInstance.getCompletion method 
			try {
				aiResponse = await new Ai().getCompletion(prompt);
				if (aiResponse.trim().startsWith('?')) {
					// Remove the leading question mark
					aiResponse = aiResponse.trim().slice(1);
				  }				  
				console.log(aiResponse); 
			} catch (error) {
				aiResponse = "Sorry I am too tired, so maybe try later?"; 
				console.error(error); 
			}
		} 
		else {
			aiResponse = "Sorry, the page content is not available for me.";
		}
	  
		// Get the current tab ID
		if (typeof chrome !== "undefined") {
		  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const activeTab = tabs[0];
			if (activeTab) {
			  // Pass the tab ID along with the question and AI response
			  if(aiResponse === ""){ aiResponse = "Sorry, I did not get this question. Could you be more specific and concise?";}
			  else if(aiResponse.startsWith("TypeError")){ aiResponse = "Sorry, the beta-testing period has ended. Be on the lookout for our next update.";}
				// maybe starts with TypeError instead of checking an exact mesage 
			  updateChatHistory(activeTab.id, question, aiResponse);
			}
		  });
		} else {
		  console.log('Chrome object is not available');
		}
	}	

	function handleClear(){
		if (typeof chrome !== "undefined") {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			  const activeTab = tabs[0];
			  if (activeTab) {
				// Clear the current history as well as one in the local storage. 
				let tempHistory = JSON.parse(localStorage.getItem('chatHistory')) || []; 
				const pageChat = tempHistory.find((x) => x.id === activeTab.id);
				if(pageChat){
					pageChat.history = []; 
					localStorage.setItem('chatHistory', JSON.stringify(tempHistory));
				}
				setChatHistory([]); 
			  }
			});
		  } else {
			console.log('Chrome object is not available');
		  }
  
	}


	// if the first time, render the page with synchronize scene. 
	if(!pageBody) {
		return (
			<div className="w-96 h-128 bg-zinc-300" style={{height: "32rem"}}>
				<Synchronize onClick={scrapePage}/> 
			</div>
		);
	}
	else {
		return (
			<div class="flex flex-col w-96 bg-zinc-300" style={{height: "32rem"}}>
				<Banner onClick={handleClear} downloadHistory={downloadHistory}/>
				<div className="chat-container flex flex-col grow overflow-auto overflow-y-scroll">
					{chatHistory && chatHistory.map((message, index) => (
					<ChatBubble key={index} text={message.text} from={message.from} />
					))}
					<div ref={messagesEndRef}/> 
				</div>
			    <UserQuestion submitHandleFunction={handleSubmit}/>
		    </div>
		);
	}
}

export default App;
// how to make the answers as concise as possible. 