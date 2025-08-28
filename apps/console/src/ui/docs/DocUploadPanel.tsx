import React, { useState } from "react";
import { COLOR, RAD } from "../tokens";
import { Dropzone } from "./Dropzone";
import { DocListItem } from "./DocListItem";

export interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  tags?: string[];
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const DocUploadPanel: React.FC<{
  docs: UploadedDoc[];
  onUpload: (files: FileList) => Promise<void> | void;
  onDelete: (id: string) => void;
  state?: "idle" | "drag" | "error";
}> = ({ docs, onUpload, onDelete, state }) => {
  const [internalState, setInternalState] = useState<"idle" | "drag" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const dropState = state ?? internalState;

  const handleFiles = async (files: FileList) => {
    for (const f of Array.from(files)) {
      if (f.size > MAX_SIZE || !ALLOWED.includes(f.type)) {
        setInternalState("error");
        return;
      }
    }
    try {
      setLoading(true);
      await onUpload(files);
      setInternalState("idle");
    } catch {
      setInternalState("error");
    } finally {
      setLoading(false);
    }
  };

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setInternalState("drag");
    },
    onDragLeave: () => setInternalState("idle"),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.files && handleFiles(e.dataTransfer.files);
      setInternalState("idle");
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div {...dragHandlers}>
        <Dropzone onFiles={handleFiles} state={dropState} />
      </div>
      {loading && (
        <span className="text-xs" style={{ color: COLOR.textMuted }}>
          Upload en cours...
        </span>
      )}
      {docs.length > 0 && (
        <ul
          className="overflow-hidden border"
          style={{ borderColor: COLOR.border, borderRadius: RAD.xxl }}
        >
          {docs.map((d) => (
            <DocListItem
              key={d.id}
              name={d.name}
              type={d.type}
              size={d.size}
              tags={d.tags}
              onDelete={() => onDelete(d.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
