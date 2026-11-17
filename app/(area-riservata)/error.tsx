"use client";

import { Button } from "@/components/ui/button";

export default function PrivateAreaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-medium text-primary">Area riservata</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Pagina non disponibile</h1>
      <p className="mt-3 text-muted-foreground">
        Il caricamento si è interrotto mentre la sessione veniva aggiornata. Puoi riprovare senza uscire.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Riprova
      </Button>
    </div>
  );
}
