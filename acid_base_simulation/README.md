# 🧪 AcidBaseLab — Interactive Acid-Base Indicator & pH Titration Simulator

A state-of-the-art interactive STEM chemistry laboratory simulation designed for Class 9–12 and AP Chemistry students and educators to explore **Acid-Base Indicators**, **Henderson-Hasselbalch Equilibrium**, **Universal pH Spectra**, **Litmus Paper Reactions**, and precision **Dropwise Analytical Titrations**.

---

## 🔬 Key Laboratory Features & Experimental Modes

### 1. 🧪 Spot Plate & Test Tubes Lab
- **Authentic Wooden Test Tube Rack**: 4 glass test tubes with liquid menisci, volume tick marks, and subtle rising micro-bubbles.
- **6-Well Glazed Porcelain Spot Plate**: Wells A through F for microscale qualitative drops.
- **14 Realistic Reagents & Mystery Analytes**:
  - Mineral acids: $0.1\text{ M HCl}$ ($\text{pH } 1.0$), Stomach Gastric Acid ($\text{pH } 1.5$)
  - Food & kitchen solutions: Lemon Juice ($\text{pH } 2.2$), White Vinegar ($\text{pH } 2.8$), Soda ($\text{pH } 3.2$), Black Coffee ($\text{pH } 5.0$), Milk ($\text{pH } 6.6$)
  - Neutral baseline: Pure Distilled Water ($\text{pH } 7.0$)
  - Alkaline substances: Human Blood buffer ($\text{pH } 7.4$), Baking Soda ($\text{pH } 8.5$), Milk of Magnesia ($\text{pH } 10.5$), Ammonia cleaner ($\text{pH } 11.5$), Bleach ($\text{pH } 12.5$), $0.1\text{ M NaOH}$ ($\text{pH } 13.0$)
  - Detective mystery samples for blind identification!
- **Interactive Reagent Dropper Bottles**: Select any of 9 indicators; click vessels or add drops with realistic gravity-driven in-flight droplet animation and liquid dispersion swirls.
- **Draggable Litmus Paper Strips**:
  - Blue Litmus (turns Red in acid, remains Blue in base)
  - Red Litmus (turns Blue in base, remains Red in acid)
  - Universal pH Paper (matches the continuous full-spectrum pH color scale)
- **Benchtop Digital pH Meter**: Draggable glass electrode probe attached via coiled wire, giving instant $\pm 0.01\text{ pH}$ digital readings.

### 2. ⚗️ Analytical Acid-Base Titration Lab
- **50 mL Precision Glass Burette**: Retort stand mounted with clamp, milliliter graduations, dynamic liquid level column, and working Teflon stopcock (Closed, Dropwise, Fast Stream).
- **Magnetic Stirrer & Erlenmeyer Flask**:
  - Rotating Teflon stir bar with adjustable speed ($0 - 100\%$).
  - Dynamic fluid vortex depression in the liquid surface.
  - Near the equivalence point, drops create transient blooming pink swirls before uniform dispersion!
- **Real-Time Live Titration Curve HUD**:
  - Live plotted curve of instantaneous $\text{pH}$ vs. $V_{\text{titrant}}$ ($\text{mL of } 0.1\text{ M NaOH}$).
  - Highlighted indicator color transition intervals (e.g. Phenolphthalein $8.2 - 10.0$).
  - Equivalence volume marked at $V_{eq} = 25.00\text{ mL}$.
  - Support for both Strong Acid ($\text{HCl}$) and Weak Acid ($\text{CH}_3\text{COOH}$, $pK_a = 4.76$) titrations!

### 3. ⚛️ Microscopic Equilibrium Simulator
- **High-Tech Microscopic Viewport**: Visualizes individual indicator dye molecules in Brownian motion.
- **Henderson-Hasselbalch Dynamic Equilibrium**:
  $$\text{pH} = pK_a + \log\left(\frac{[\text{In}^-]}{[\text{HIn}]}\right)$$
- Observe $[HIn]$ (acid form with docked $H^+$ proton) and $[In^-]$ (conjugate base) undergo real-time bond associations and dissociations with flash effects as $\text{pH}$ shifts.

### 4. ⭐ Gamified Student Lab Quests
- **⭐ Quest 1: "The Kitchen Detective"** — Add Red Cabbage extract to 3 vessels (acid, water, base) to see the natural anthocyanin chromatic spectrum!
- **⭐⭐ Quest 2: "Litmus Paper Sleuth"** — Dip blue litmus in acid (turns red) and red litmus in base (turns blue).
- **⭐⭐⭐ Quest 3: "Dropwise Precision Titration"** — Titrate $25.0\text{ mL HCl}$ with $0.1\text{ M NaOH}$ using Phenolphthalein, hitting the faint-pink endpoint ($24.8 - 25.2\text{ mL}$) without overtitrating!
- **⭐⭐⭐⭐ Quest 4: "Universal pH Match"** — Test Mystery Liquid A with universal indicator or pH paper, then verify with the digital probe.
- **⭐⭐⭐⭐⭐ Quest 5: "Indicator Selection Master"** — Titrate acetic acid (weak acid) and explain why Phenolphthalein matches the basic equivalence point ($\text{pH } \approx 8.7$).

### 5. 📝 Student Laboratory Notebook & CSV Export
- Record experimental observations with timestamps, sample identity, indicator used, and $\text{pH}$.
- One-click CSV export for lab reports.

---

## 🎨 9 Chemistry Indicators Supported

| Indicator | $pK_{In}$ | Effective Transition Range | Acid Form | Base Form | Typical Use |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Universal Indicator** | — | $1.0 - 13.0$ (Full Spectrum) | Red ($\text{pH } 0-2$) | Violet ($\text{pH } 13-14$) | Broad qualitative pH estimation |
| **Phenolphthalein** | $9.3$ | $8.2 - 10.0$ | Colorless | Vivid Magenta/Pink | Strong Base & Weak Acid titrations |
| **Bromothymol Blue** | $7.1$ | $6.0 - 7.6$ | Canary Yellow | Royal Blue | Neutral equivalence ($\text{pH } 7.0$) |
| **Methyl Orange** | $3.4$ | $3.1 - 4.4$ | Crimson Red | Golden Yellow | Strong Acid / Weak Base titrations |
| **Litmus Solution** | $6.5$ | $4.5 - 8.3$ | Red | Blue | General acid/alkali detection |
| **Red Cabbage (Anthocyanin)**| $7.0$| $1.0 - 13.0$ | Ruby Red | Emerald Green / Golden Yellow | Kitchen STEM chemistry |
| **Turmeric (Curcumin)** | $8.0$ | $7.4 - 8.8$ | Bright Yellow | Deep Reddish-Brown | Everyday soaps & alkali detection |
| **Phenol Red** | $7.9$ | $6.8 - 8.2$ | Yellow | Bright Red/Fuchsia | Swimming pool testing, cell culture |
| **Thymol Blue** | $8.8$ | $1.2 - 2.8$ & $8.0 - 9.6$ | Red $\to$ Yellow | Yellow $\to$ Blue | Dual transition indicator |

---

## 🔊 Zero-Dependency Web Audio API Engine
Includes realistic laboratory sound effects synthesized entirely in the browser:
- Liquid droplet plinks
- Pipette suction & squeeze
- Glassware clinks
- Stopcock clicks
- Magnetic stirrer low resonant motor hum
- Victory fanfare chords upon quest completion

---

## 🚀 Running Locally

You can run the simulation using any static HTTP server:

```bash
cd acid_base_simulation
python -m http.server 8089
```

Or open `index.html` or `simulation.html` directly in any modern web browser.
