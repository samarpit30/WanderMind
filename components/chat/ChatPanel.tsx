"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../lib/store/useAppStore";
import { ChatMessage } from "../../lib/types";
import AgentsAtWorkStrip from "./AgentsAtWorkStrip";

function cleanMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/###?\s+/g, "");
}

export default function ChatPanel() {
  const {
    chatHistory,
    pushChatMessage,
    uiStatus,
    setUiStatus,
    persona,
    searchMode,
    locationQuery,
    pathQuery,
    setRecommendations,
    setPersonaScores,
  } = useAppStore();

  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, uiStatus]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || uiStatus === "loading") return;

    const userText = inputMsg.trim();
    setInputMsg("");

    // 1. Add user message
    const userMsg: ChatMessage = {
      role: "user",
      text: userText,
      timestamp: Date.now(),
    };
    pushChatMessage(userMsg);

    // 2. Set simulating status changes
    setUiStatus("loading", "Understanding your request...");
    const statusSequence = [
      "Analyzing user persona...",
      "Scouting nearby Google Places...",
      "Scoring persona matches...",
      "Organizing recommendations...",
    ];
    let seqIndex = 0;
    const seqInterval = setInterval(() => {
      if (seqIndex < statusSequence.length) {
        setUiStatus("loading", statusSequence[seqIndex]);
        seqIndex++;
      }
    }, 1200);

    // 3. Dispatch to API
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context: {
            persona,
            searchMode,
            locationQuery,
            pathQuery,
            chatHistory: [...chatHistory, userMsg],
          },
        }),
      });

      clearInterval(seqInterval);

      if (!response.ok) {
        throw new Error(`Agent request failed with status: ${response.status}`);
      }

      const data = await response.json();

      // 4. Handle agent response
      if (data.assistantText) {
        pushChatMessage({
          role: "assistant",
          text: data.assistantText,
          timestamp: Date.now(),
        });
      }

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
      
      if (data.personaScores) {
        setPersonaScores(data.personaScores);
      }

      setUiStatus("idle");
    } catch (error: unknown) {
      clearInterval(seqInterval);
      console.error("Chat panel error:", error);
      pushChatMessage({
        role: "assistant",
        text: "Sorry, I ran into an error communicating with the agent. Please verify your keys and network, or try manual search.",
        timestamp: Date.now(),
      });
      setUiStatus("error", "Failed to get response");
      setTimeout(() => setUiStatus("idle"), 3000);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputMsg(promptText);
  };

  return (
    <div className="flex flex-col border border-zinc-900 bg-zinc-950 rounded-2xl overflow-hidden h-[450px] shadow-lg">
      <div className="px-4 py-3 bg-zinc-900/40 border-b border-zinc-900 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scout Agent Chat</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <span className="text-3xl mb-2">🤖</span>
            <p className="text-xs font-semibold text-zinc-400">Ask the WanderMind Agent</p>
            <p className="text-[11px] text-zinc-650 max-w-xs mt-1">
              Provide search criteria like &quot;Show me street food spots in Indore&quot; or &quot;Where is a scenic place near here?&quot;
            </p>
            
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-4">
              <button
                type="button"
                onClick={() => handleQuickPrompt("Scout foodie places in Indore")}
                className="text-[10px] font-medium px-2 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 rounded-lg transition-all"
              >
                🍔 Street Food
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt("Show heritage sites near Rajwada")}
                className="text-[10px] font-medium px-2 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 rounded-lg transition-all"
              >
                🏛️ Heritage sites
              </button>
            </div>
          </div>
        ) : (
          chatHistory.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-violet-600 text-white rounded-tr-none"
                      : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none"
                  }`}
                >
                  {cleanMarkdown(msg.text)}
                </div>
                <span className="text-[9px] text-zinc-600 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Agents Strip */}
      <AgentsAtWorkStrip />

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-900 bg-zinc-950 flex gap-2">
        <input
          type="text"
          placeholder="Ask WanderMind..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          disabled={uiStatus === "loading"}
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputMsg.trim() || uiStatus === "loading"}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            inputMsg.trim() && uiStatus !== "loading"
              ? "bg-violet-600 hover:bg-violet-500 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
