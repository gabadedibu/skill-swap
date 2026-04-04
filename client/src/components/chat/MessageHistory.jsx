// src/components/chat/MessageHistory.jsx
import React, { useMemo, useRef, useEffect } from 'react';

const MessageHistory = ({ messages, loggedInUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const memoizedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      // ✅ FIX: Safe check — system messages have no senderId object
      const isSystem = msg.isSystem || !msg.senderId;
      const isOwn = !isSystem && (
        (msg.senderId?._id ?? msg.senderId) === loggedInUserId
      );

      if (isSystem) {
        return (
          <div key={index} className="message-system">
            <span dangerouslySetInnerHTML={{ __html: msg.content }} />
          </div>
        );
      }

      return (
        <div key={index} className={`message ${isOwn ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center space-x-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <p className={`text-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'} p-3 rounded-lg max-w-xs`}>
              <strong>{msg.senderName}:</strong>
              <span className="block mt-1" dangerouslySetInnerHTML={{ __html: msg.content }} />
              {msg.link && (
                <a href={msg.link} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-100 underline mt-2 block">
                  {msg.link}
                </a>
              )}
            </p>
          </div>

          {msg.mediaUrl && (
            <div className="mt-2">
              {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="Media" className="max-w-[300px] rounded-lg shadow-lg mt-2" />}
              {msg.mediaType === 'video' && <video controls className="max-w-[300px] rounded-lg shadow-lg mt-2"><source src={msg.mediaUrl} /></video>}
              {msg.mediaType === 'audio' && <audio controls className="mx-auto mt-2"><source src={msg.mediaUrl} /></audio>}
            </div>
          )}
        </div>
      );
    });
  }, [messages, loggedInUserId]);

  return (
    <div className="message-history overflow-y-scroll h-[calc(100vh-200px)] mb-4 p-4 space-y-4">
      {memoizedMessages}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageHistory;
