# MonProgrammeFit — App mobile (PWA)

Application athlète Next.js, **mêmes couleurs et même Firebase** que le site dans `feat/`.

## Lancer

```bash
cd mobile
npm install
npm run dev
```

Les clés Firebase sont dans `mobile/.env.local` (mappées depuis le `.env` racine : `VITE_*` → `NEXT_PUBLIC_*`).  
Si tu changes le `.env` du site, resynchronise :

```bash
# depuis mobile/
python3 - <<'PY'
from pathlib import Path
root = Path("../.env").read_text().splitlines()
out=[]
for line in root:
    s=line.strip()
    if s.startswith("VITE_FIREBASE_"):
        k,_,v=s.partition("=")
        out.append("NEXT_PUBLIC_"+k[len("VITE_"):]+"="+v)
Path(".env.local").write_text("\n".join(out)+"\n")
print("ok", len(out))
PY
```

Puis **redémarre** `npm run dev` (Next ne recharge pas les env à chaud).

Ouvre [http://localhost:3001](http://localhost:3001).

## Parcours

Splash → onboarding 3 slides → quiz (objectif, lieu, mensurations, **IMC**) → **tarifs (1er mois offert)** → inscription / WhatsApp → app.

## Stack

Next.js 16 · Firebase Auth + Firestore · PWA
