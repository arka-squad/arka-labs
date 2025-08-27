import { ButtonPrimary, ButtonSecondary } from "../../src/ui/buttons/Button"; import { GRADIENT, COLOR } from "../../src/ui/tokens";
export default function ArkaLandingPublic(){
  return (
    <div style={{ background: COLOR.body }} className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: GRADIENT }}>A</div>
          <span className="text-sm font-bold text-white">Arka</span>
        </div>
        <nav className="hidden gap-4 text-sm text-slate-300 sm:flex">
          <a className="hover:text-white" href="#features">Fonctionnalités</a>
          <a className="hover:text-white" href="#security">Sécurité</a>
          <a className="hover:text-white" href="#pricing">Tarification</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/login" className="rounded-xl border px-3 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLOR.block, borderColor: COLOR.border }}>Se connecter</a>
          <ButtonPrimary>Ouvrir la console</ButtonPrimary>
        </div>
      </header>
    </div>
  );
}
