# PeriodicLab — Interactive Periodic Table & Hinglish Mnemonics Simulator

A zero-dependency, high-performance HTML5, CSS3, and JavaScript interactive periodic table simulation tailored for Class 9–12, JEE, and NEET students, featuring the complete IUPAC 118-element dataset, famous Indian chemistry coaching **Hinglish Mnemonics** (e.g., *"Beta Mange Car Scooter Baap Raazi"*), an animated **Bohr Atomic Orbital Visualizer**, dynamic **Periodic Trends Heatmaps**, and a gamified **Memory Trainer Quiz**.

---

## 🌟 Key Features

1. **Complete IUPAC 118 Elements Dataset**:
   - Comprehensive chemical, physical, and electronic properties from Hydrogen ($Z=1$) to Oganesson ($Z=118$).
   - Standard 18-column grid with Lanthanides ($57–71$) and Actinides ($89–103$) rows.
   - States of matter icons (Solid 🧊, Liquid 💧, Gas 💨, Synthetic ⚛️).
   - Electron configurations, shells ($K, L, M, N, O, P, Q$), electronegativity, atomic radius, ionization energy, density, melting point, boiling point, discovery history, and practical applications.

2. **Full Hinglish Mnemonics Catalog (JEE / NEET / CBSE)**:
   - **Group 2 Alkaline Earth Metals**: *"Beta Mange Car Scooter Baap Raazi"* (Be $\to$ Beta, Mg $\to$ Mange, Ca $\to$ Car, Sr $\to$ Scooter, Ba $\to$ Baap, Ra $\to$ Raazi).
   - **Group 1 Alkali Metals**: *"Helina Ki Rab Se Fariyad"* (H, Li, Na, K, Rb, Cs, Fr).
   - **Group 13 Boron Family**: *"Baingan Aloo Gajar In Thela"* (B, Al, Ga, In, Tl, Nh).
   - **Group 14 Carbon Family**: *"Kahe Sita Ji Suno Prabhu"* (C, Si, Ge, Sn, Pb, Fl).
   - **Group 15 Nitrogen Family / Pnictogens**: *"Nana Patekar Aishwarya Sab Bindaas"* (N, P, As, Sb, Bi, Mc).
   - **Group 16 Oxygen Family / Chalcogens**: *"Oye Style Se TePo"* (O, S, Se, Te, Po, Lv).
   - **Group 17 Halogens**: *"Fir Kal Bahar Aayi Aunty"* (F, Cl, Br, I, At, Ts).
   - **Group 18 Noble Gases**: *"Heena Neena Aur Kareena X-ray Rangeen"* (He, Ne, Ar, Kr, Xe, Rn, Og).
   - **3d Transition Series**: *"Science Teacher Vineeta Kriplani ManFeCoNiCuZn"*.
   - **4d Transition Series**: *"Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood"*.
   - **5d Transition Series**: *"La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi"*.
   - **Lanthanides (4f)**: *"Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye"*.
   - **Actinides (5f)**: *"Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao"*.

3. **Interactive 2D Bohr Atom Visualizer**:
   - Canvas-based orbital simulation rendering real-time planetary electron motion across concentric shells ($K, L, M, N, O, P, Q$).
   - Central nucleus displaying proton ($p^+$) and neutron ($n^0$) counts with dynamic energy pulse.
   - Outermost valence shell highlighting and live electron configuration breakdown.

4. **Periodic Trends Continuous Heatmap**:
   - Continuous color gradient across all 118 elements for:
     - Electronegativity (Pauling scale)
     - Atomic Radius (pm)
     - First Ionization Energy (kJ/mol)
     - Melting Point (K)
     - Density (g/cm³)

5. **Audio Synthesizer & Speech Engine**:
   - Zero-dependency procedural Web Audio API sounds for card hover, element selection, category sweeps, and quiz fanfares.
   - Web Speech API integration to speak Hinglish mnemonics aloud in voice.

6. **Memory Trainer Quiz & Theory Modal**:
   - Gamified multiple-choice quiz testing mnemonic-to-element and element-to-mnemonic mappings.
   - Streak counters, score tracker, and instant pedagogical explanations.
   - Henry Moseley's Law and Modern Periodic Law reference guide.

---

## 🚀 Running Locally

Serve the simulation using Python's built-in HTTP server:

```bash
cd PT_Table_simulation
python -m http.server 8095
```

Open your browser at:
```
http://localhost:8095
```
Or open `index.html` directly in any modern web browser.
