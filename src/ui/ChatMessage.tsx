import React from "react";

const GRADIENT = "linear-gradient(135deg, #FAB652 0%, #F25636 50%, #E0026D 100%)";
const ROLE_ICONS: Record<string, string> = { user: "👤", agent: "🤖", system: "⚙️" };

export type ChatMessageProps = {
  role: "user" | "agent" | "system";
  content: string;
  streaming?: boolean;
};
export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, streaming }) => (
  <li className="flex items-start gap-3">
    <div
      className={`mt-1 grid h-8 w-8 place-items-center rounded-lg ${role === "user" ? "bg-slate-600 text-white" : role === "agent" ? "text-white" : "bg-slate-800 text-white"}`}
      style={role === "agent" ? { background: GRADIENT } : undefined}
    >
      <span aria-hidden className="text-sm">
        {ROLE_ICONS[role]}
      </span>
    </div>
    <div className="flex-1">
      <div className="rounded-2xl border p-3 text-sm" style={{ borderColor: "#1F2A33", backgroundColor: "#151F27" }}>
        <p className="whitespace-pre-wrap leading-relaxed">
          {content}
          {streaming && <span className="ml-0.5 inline-block animate-pulse">▌</span>}
        </p>
      </div>
    </div>
  </li>
);
