# Blood Grouping & Hemagglutination Virtual Laboratory

An interactive immunology and hematology virtual laboratory simulating ABO and Rh(D) forward blood typing. The simulation models antigen-antibody crosslinking dynamics, Landsteiner's law of agglutinogens and agglutinins, and clinical red blood cell transfusion compatibility.

## Scientific Features

- **ABO and Rh(D) Immunogenetics:**
  - Complete 8-phenotype human blood catalog: $A^+$, $A^-$, $B^+$, $B^-$, $AB^+$, $AB^-$, $O^+$, and $O^-$.
  - Realistic antigen expression: Antigen A, Antigen B, and Rh(D) polypeptide.
  - Native reciprocal plasma antibodies (Anti-A, Anti-B) and acquired Anti-D isoantibodies.
- **Biochemical Hemagglutination Engine:**
  - Pentameric IgM antibody bridging of red blood cells to overcome erythrocyte electrostatic zeta potential.
  - True-to-life visual differentiation between positive macroscopic flocculation/clumping and negative homogenous colloidal suspension.
  - 400x cytology microscope zoom overlay displaying individual biconcave red blood cell discs vs. crosslinked cellular aggregates.
- **Glazed Porcelain 3-Well Spot Plate Simulation:**
  - Interactive reagent dispensing: Patient blood dropper, Anti-A reagent (Patent Blue V), Anti-B reagent (Tartrazine Yellow), and Anti-D reagent (Clear).
  - Mixing stick interaction triggering reaction kinetics and procedural audio feedback.
  - Instant red blood cell crossmatch telemetry, universal donor ($O^-$) and universal recipient ($AB^+$) clinical guides.

## Running Locally

```bash
cd blood_grouping_simulation
node server.js
```
Open [http://localhost:8132](http://localhost:8132) in any modern web browser.

