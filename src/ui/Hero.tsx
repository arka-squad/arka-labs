import React from 'react';
import { GRADIENT, RAD, COLOR } from '../../apps/console/src/ui/tokens';
import { ButtonPrimary, ButtonSecondary } from '../../apps/console/src/ui/buttons/Button';

export type HeroProps = {
  onTry?: () => void;
  onConsole?: () => void;
};

export const Hero: React.FC<HeroProps> = ({ onTry, onConsole }) => (
  <section className="text-center">
    <div
      className="mx-auto mb-6 grid h-16 w-16 place-items-center text-2xl text-white"
      style={{ background: GRADIENT, borderRadius: RAD.xxl }}
    >
      A
    </div>
    <h1 className="mx-auto max-w-2xl text-3xl font-bold" style={{ color: COLOR.text }}>
      Arka — la puissance des grandes équipes, mise entre les mains des petites.
    </h1>
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <ButtonPrimary onClick={onTry}>Essayer</ButtonPrimary>
      <ButtonSecondary onClick={onConsole}>Console</ButtonSecondary>
    </div>
  </section>
);

