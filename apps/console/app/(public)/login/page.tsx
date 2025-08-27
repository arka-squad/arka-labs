import { COLOR, GRADIENT } from "../../../src/ui/tokens";
export default function ArkaLoginPage(){
  return (
    <div className="min-h-screen grid place-items-center" style={{ background: COLOR.body }}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: COLOR.block, borderColor: COLOR.border }}>
        <h1 className="mb-4 text-lg font-bold text-white">Connexion</h1>
        <form className="space-y-3" onSubmit={(e)=>e.preventDefault()}>
          <label className="block text-sm font-medium text-slate-300">Email
            <input type="email" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ background: COLOR.block, borderColor: COLOR.border }} />
          </label>
          <label className="block text-sm font-medium text-slate-300">Mot de passe
            <input type="password" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ background: COLOR.block, borderColor: COLOR.border }} />
          </label>
          <button className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: GRADIENT }}>Se connecter</button>
          <p className="text-xs text-red-400">Erreur: identifiants incorrects</p>
        </form>
      </div>
    </div>
  );
}
