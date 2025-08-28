import React from "react";
import { COLOR, RAD } from "../tokens";

export const Dropzone: React.FC<{
  onFiles: (files: FileList) => void;
  state?: "idle" | "drag" | "error";
}> = ({ onFiles, state = "idle" }) => (
  <label className="block cursor-pointer">
    <div
      className="grid place-items-center border-2 border-dashed p-8 text-center transition"
      style={{
        background: COLOR.body,
        borderColor: state === "drag" ? COLOR.accent : COLOR.border,
        borderRadius: RAD.xxl,
      }}
    >
      <input
        type="file"
        className="hidden"
        multiple
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      <div
        className="flex flex-col items-center gap-2 text-sm"
        style={{ color: state === "error" ? COLOR.error : COLOR.text }}
      >
        {state === "drag"
          ? "Déposez les fichiers…"
          : state === "error"
          ? "Échec de l'upload — réessayez"
          : "Glissez-déposez ou cliquez pour ajouter"}
      </div>
    </div>
  </label>
);

