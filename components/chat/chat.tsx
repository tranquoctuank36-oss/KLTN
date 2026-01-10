"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { MessageSquareMore, Send, Loader2, X } from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { useChat } from "@/context/ChatContext";

type ChatFabProps = {
  bottom?: number;
  right?: number;
};

const CHAT_STORAGE_KEY = "chatbot_messages";
const CHAT_TIMESTAMP_KEY = "chatbot_last_activity";
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 phút

export default function ChatFab({ bottom = 24, right = 24 }: ChatFabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, toggleChat, closeChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages từ localStorage khi component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      const lastActivity = localStorage.getItem(CHAT_TIMESTAMP_KEY);
      
      if (savedMessages && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        
        // Nếu chưa quá 30 phút, restore messages
        if (timeSinceLastActivity < INACTIVITY_TIMEOUT) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
          console.log("[Chat] Restored messages from localStorage");
        } else {
          // Quá 30 phút, xóa dữ liệu cũ
          localStorage.removeItem(CHAT_STORAGE_KEY);
          localStorage.removeItem(CHAT_TIMESTAMP_KEY);
          console.log("[Chat] Cleared old messages (inactive > 30 min)");
        }
      }
    } catch (error) {
      console.error("[Chat] Error loading messages from localStorage:", error);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem(CHAT_TIMESTAMP_KEY);
    }
  }, []);

  // Save messages vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        localStorage.setItem(CHAT_TIMESTAMP_KEY, Date.now().toString());
      } catch (error) {
        console.error("[Chat] Error saving messages to localStorage:", error);
      }
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue.trim().substring(0, 3000), // Giới hạn 3000 ký tự
    };

    // Thêm tin nhắn của user vào chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("[Chat] Sending message:", userMessage.content);
      
      // Chỉ giữ 6 tin nhắn gần nhất để gửi lên server (API giới hạn 6 tin nhắn)
      // Và đảm bảo mỗi content không quá 3000 ký tự
      const limitedHistory = messages
        .slice(-6)
        .map(msg => ({
          role: msg.role,
          content: String(msg.content || "").substring(0, 3000)
        }));
      
      console.log("[Chat] Conversation history:", limitedHistory);
      
      // Gọi API chatbot
      const response = await chatService.sendMessage({
        message: userMessage.content,
        conversationHistory: limitedHistory,
      });

      console.log("[Chat] Response received:", response);

      // Thêm phản hồi từ AI vào chat
      if (response?.data?.reply) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.data.reply,
        };
        console.log("[Chat] Adding assistant message:", assistantMessage);
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        console.warn("[Chat] Invalid response format:", response);
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("[Chat] Error:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        error: error,
      });
      
      // Lấy error message trực tiếp từ backend
      const errorContent = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.";
      
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: errorContent,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        variant="default"
        size="icon"
        aria-label="Mở Chat"
        onClick={toggleChat}
        className="
          fixed z-50 grid place-items-center rounded-full
          h-12 w-12 md:h-14 md:w-14
          bg-[#1e7bf4] text-white
          drop-shadow-lg hover:bg-blue-800
          transition-transform duration-300
        "
        style={{ bottom, right }}
      >
        <MessageSquareMore className="!h-8 !w-8 !md:h-10 !md:w-10" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-50 bg-white shadow-2xl overflow-hidden flex flex-col"
          style={{
            top: '60px',
            bottom: bottom,
            right,
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: 'auto',
            borderRadius: '16px 16px 0 0',
          }}
        >
          {/* Header with Gradient */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <Image 
                src="https://static.ada.support/images/ada02714-712b-476d-afb5-98710ee74666.svg" 
                alt="Chat assistant"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h2 className="text-lg font-semibold">Chat với chúng tôi</h2>
                <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button
              onClick={closeChat} 
              className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Đóng chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Image 
                  src="https://static.ada.support/images/ada02714-712b-476d-afb5-98710ee74666.svg" 
                  alt="Chat assistant"
                  width={64}
                  height={64}
                  className="w-16 h-16 mb-4"
                />
                <p className="text-center text-gray-700 font-medium mb-2">
                  👋 Xin Chào!
                </p>
                <p className="text-center text-sm text-gray-500">
                  Chúng tôi có thể giúp bạn như thế nào hôm nay?
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in slide-in-from-bottom duration-300`}
              >
                {message.role === "assistant" && (
                  <Image 
                    src="https://static.ada.support/images/ada02714-712b-476d-afb5-98710ee74666.svg" 
                    alt="Chat assistant"
                    width={32}
                    height={32}
                    className="w-8 h-8 mr-2 flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                  }`}
                  style={{
                    wordBreak: "break-word",
                  }}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none
                      prose-p:my-2 prose-p:leading-relaxed
                      prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
                      prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                      prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                      prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
                      prose-li:my-1
                      prose-strong:font-bold prose-strong:text-gray-900
                      prose-em:italic
                      prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                      prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded-lg prose-pre:overflow-x-auto
                      prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                      prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom duration-300">
                <Image 
                  src="https://static.ada.support/images/ada02714-712b-476d-afb5-98710ee74666.svg" 
                  alt="Chat assistant"
                  width={32}
                  height={32}
                  className="w-8 h-8 mr-2 flex-shrink-0"
                />
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            className="flex items-center gap-3 p-4 bg-white border-t border-gray-200"
            onSubmit={handleSendMessage}
          >
            <input
              className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Nhập tin nhắn của bạn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
