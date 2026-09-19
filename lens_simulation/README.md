# 🔍 OpticsLab — Interactive Lens Simulation & Ray Tracing

An interactive, web-based physics simulation designed for Class 8–12 STEM students and educators to explore and master **image formation through lenses (convex and concave)**, **Cartesian Sign Conventions**, the **Thin Lens Formula**, and **Linear Magnification**.

---

## ✨ Key Features

- **🔬 Physical 2D Canvas Ray Tracing Engine**:
  - High-DPI canvas with realistic glass lens rendering (biconvex & biconcave profiles with refractive highlights).
  - Tactile optical bench with graduated metric ruler (cm) and coordinate grid.
  - Drag-and-drop interactive object: adjust object position ($u$) and object height ($h_o$) directly on the bench.
  - Drag-and-drop focal points ($F_1, F_2$) to dynamically reshape the lens.
  - Realistic candle with animated flickering flame or classic upright arrow graphic.

- **⚡ 3 Principal Light Rays**:
  - **Ray 1 (Cyan)**: Parallel to the principal axis $\to$ refracts through focal point $F_2$ (convex) or diverges from near focus $F_1$ (concave).
  - **Ray 2 (Blue)**: Passes straight through the optical center $O$ without deviation.
  - **Ray 3 (Green)**: Passes through near focus $F_1 \to$ emerges parallel to axis (convex) or directed toward far focus $F_2$ (concave).
  - **Virtual Ray Extensions (Dashed Purple)**: Glowing backward extrapolations locating virtual images.
  - **Individual Ray Toggles**: Turn rays on and off one-by-one to guide students through optical rules.
  - **Full Light Cone Mode**: Displays the entire bundle of light illuminating the lens aperture.
  - **Photon Pulse Animation**: Subtle moving light particles illustrating the direction of light propagation ($L \to R$).

- **📊 Live Educational HUD & Character Badges**:
  - Dynamic image nature badges:
    - **Nature**: `Real Image` vs `Virtual Image` vs `At Infinity (∞)`
    - **Orientation**: `Inverted` vs `Upright`
    - **Size**: `Magnified` ($|m| > 1$) vs `Diminished` ($|m| < 1$) vs `Same Size` ($|m| = 1$)
    - **Location**: Specific optical zone (e.g. *Between F₂ and 2F₂*, *At 2F₂*, *Beyond 2F₂*, *Behind Object / Magnifying Glass*).

- **📐 Live Mathematical Calculations (Cartesian Sign Convention)**:
  - Step-by-step substitution into the Thin Lens Formula: $\frac{1}{v} - \frac{1}{u} = \frac{1}{f}$.
  - Real-time linear magnification computation: $m = \frac{v}{u} = \frac{h_i}{h_o}$.
  - Lens diopter power calculation: $P = \frac{100}{f\text{ (cm)}} \text{ D}$.
  - Color-coded signs ($+$/$-$) with explanations following the New Cartesian Sign Convention.

- **🎯 Interactive Inquiry Challenges**:
  - Guided STEM tasks with instant verification, hints, and celebration:
    - *Challenge 1: Symmetric 1:1 Inverted Image ($|m| = 1.0$)*
    - *Challenge 2: The Reading Magnifier (Virtual & $\ge 2\times$)*
    - *Challenge 3: Movie Projector (Real & $\ge 2.5\times$)*
    - *Challenge 4: The Parallel Searchlight (Image at $\infty$)*
    - *Challenge 5: The Concave Diverging Lens Mystery*

- **⚡ One-Click Curriculum Presets**:
  - Convex: *Beyond 2F₁*, *At 2F₁*, *Between F₁ & 2F₁*, *At F₁ (Infinity)*, *Inside F₁ (Magnifier)*.
  - Concave: *Distant Object*, *Close Object*.

---

## 📚 Educational Core Formulas

### 1. Thin Lens Equation
$$\frac{1}{v} - \frac{1}{u} = \frac{1}{f} \implies v = \frac{u \cdot f}{u + f}$$

Where:
- $u$ = Object distance (always negative for real objects placed to the left)
- $v$ = Image distance ($v > 0$ for Real image on right; $v < 0$ for Virtual image on left)
- $f$ = Focal length ($f > 0$ for Convex; $f < 0$ for Concave)

### 2. Linear Magnification
$$m = \frac{v}{u} = \frac{h_i}{h_o} \implies h_i = m \cdot h_o$$

- If $m < 0$: Image is **Inverted** (Real).
- If $m > 0$: Image is **Upright** (Virtual).
- If $|m| > 1$: Image is **Magnified**.
- If $|m| < 1$: Image is **Diminished**.
- If $|m| = 1$: Image is **Same Size**.

### 3. Optical Power
$$P = \frac{1}{f\text{ (in meters)}} = \frac{100}{f\text{ (in cm)}} \text{ Diopters (D)}$$

---

## 🚀 Running Locally

Simply launch any static HTTP server or open `index.html` in your web browser:

```bash
# Navigate to the lens simulation folder
cd lens

# Windows (open directly in default browser)
start index.html

# Or with a local web server (e.g. npx serve or python)
npx -y serve .
# or
python -m http.server 3000
```

---

## 🛠️ Technology Stack

- **HTML5 & Vanilla JavaScript (ES6+ Modules)**: Zero external dependencies, ultra-fast client-side execution.
- **HTML5 2D Canvas**: High-DPI ray tracing renderer with glass caustics, glows, and coordinate transforms.
- **Vanilla CSS3 Design System**: Responsive grid layout with Google Fonts (`Plus Jakarta Sans` & `JetBrains Mono`).

---

## 📄 License

MIT License — Free for students, educators, and schools worldwide!
