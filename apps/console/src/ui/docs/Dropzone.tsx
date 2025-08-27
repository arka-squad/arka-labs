import React from "react"; import { COLOR } from "../tokens";
export const Dropzone: React.FC<{ onFiles:(files:FileList)=>void; state?:'idle'|'drag'|'error' }>=({onFiles,state='idle'})=> (
  <label className="block cursor-pointer">
    <div className="grid place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition" style={{ background: COLOR.body, borderColor: state==='drag'? '#FAB652': COLOR.border }}>
      <input type="file" className="hidden" multiple onChange={(e)=> e.target.files && onFiles(e.target.files)} />
      <div className="flex flex-col items-center gap-2 text-sm" style={{ color: state==='error'? '#F25636': '#E5E7EB' }}>
        {state==='drag'? 'Déposez les fichiers…' : state==='error'? 'Échec de l\'upload — réessayez' : 'Glissez-déposez ou cliquez pour ajouter'}
      </div>
    </div>
  </label>
);
