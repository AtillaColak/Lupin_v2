import React from "react";

function ChatBubble({text, from}) {
  const messageClass = from === 'User' ? 'self-end bg-red-300' : 'self-start bg-orange-50';
  return (
    <div className={`chat-bubble ${messageClass} m-2 p-2 rounded-md`}>
      <p style={{"max-width": "180px", "word-wrap": "break-word"}}>{text}</p>
    </div>
  );
}

export default ChatBubble;
