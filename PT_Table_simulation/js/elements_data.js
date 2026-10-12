/**
 * PeriodicLab — Comprehensive IUPAC 118 Elements & Hinglish Mnemonics Dataset
 * Complete chemical, physical, electronic configuration data, periodic trends,
 * and Indian coaching Hinglish memory mnemonics (JEE / NEET / CBSE Class 9-12).
 */

const ELEMENTS_DATA = [
  // ==========================================
  // PERIOD 1
  // ==========================================
  {
    z: 1, symbol: "H", name: "Hydrogen", atomicMass: 1.008, group: 1, period: 1, block: "s",
    category: "reactive-nonmetal", standardState: "gas",
    electronConfiguration: "1s¹", shells: [1],
    electronegativity: 2.20, atomicRadius: 53, ionizationEnergy: 1312,
    meltingPoint: 14.01, boilingPoint: 20.28, density: 0.00008988,
    discoveryYear: 1766, discoverer: "Henry Cavendish",
    description: "The lightest, most abundant chemical element in the universe, constituting roughly 75% of all baryonic mass.",
    practicalUses: "Rocket fuel, ammonia synthesis (Haber process), fuel cells, and hydrogenated oils.",
    mnemonic: {
      groupTitle: "Group 1: Alkali Metals",
      phrase: "Helina Ki Rab Se Fariyad",
      word: "He",
      hindiWord: "हे (Helina)",
      meaning: "He (Helina) from 'Helina Ki Rab Se Fariyad'"
    }
  },
  {
    z: 2, symbol: "He", name: "Helium", atomicMass: 4.0026, group: 18, period: 1, block: "s",
    category: "noble-gas", standardState: "gas",
    electronConfiguration: "1s²", shells: [2],
    electronegativity: null, atomicRadius: 31, ionizationEnergy: 2372,
    meltingPoint: 0.95, boilingPoint: 4.22, density: 0.0001785,
    discoveryYear: 1868, discoverer: "Pierre Janssen & Joseph Norman Lockyer",
    description: "Colorless, odorless, inert noble gas; second lightest and second most abundant element in the cosmos.",
    practicalUses: "Cryogenic coolant for MRI scanners, party balloons, deep-sea diving gas mixtures, and semiconductor cooling.",
    mnemonic: {
      groupTitle: "Group 18: Noble Gases",
      phrase: "Heena Neena Aur Kareena X-ray Rangeen",
      word: "Heena",
      hindiWord: "हीना (Heena)",
      meaning: "Heena from 'Heena Neena Aur Kareena X-ray Rangeen'"
    }
  },

  // ==========================================
  // PERIOD 2
  // ==========================================
  {
    z: 3, symbol: "Li", name: "Lithium", atomicMass: 6.94, group: 1, period: 2, block: "s",
    category: "alkali-metal", standardState: "solid",
    electronConfiguration: "[He] 2s¹", shells: [2, 1],
    electronegativity: 0.98, atomicRadius: 167, ionizationEnergy: 520,
    meltingPoint: 453.69, boilingPoint: 1603, density: 0.534,
    discoveryYear: 1817, discoverer: "Johan August Arfwedson",
    description: "Soft, silvery-white alkali metal; lightest metal and least dense solid element at room temperature.",
    practicalUses: "Rechargeable Lithium-ion batteries (EVs, smartphones), psychiatric medication, lightweight aerospace alloys.",
    mnemonic: {
      groupTitle: "Group 1: Alkali Metals",
      phrase: "Helina Ki Rab Se Fariyad",
      word: "Li",
      hindiWord: "ली (Li)",
      meaning: "Li (Helina) from 'Helina Ki Rab Se Fariyad'"
    }
  },
  {
    z: 4, symbol: "Be", name: "Beryllium", atomicMass: 9.0122, group: 2, period: 2, block: "s",
    category: "alkaline-earth", standardState: "solid",
    electronConfiguration: "[He] 2s²", shells: [2, 2],
    electronegativity: 1.57, atomicRadius: 112, ionizationEnergy: 899,
    meltingPoint: 1560, boilingPoint: 2742, density: 1.85,
    discoveryYear: 1798, discoverer: "Louis-Nicolas Vauquelin",
    description: "Steel-gray, strong, lightweight alkaline earth metal with remarkable structural stiffness and x-ray transparency.",
    practicalUses: "James Webb Space Telescope mirrors, aerospace structures, beryllium-copper non-sparking springs.",
    mnemonic: {
      groupTitle: "Group 2: Alkaline Earth Metals",
      phrase: "Beta Mange Car Scooter Baap Raazi",
      word: "Beta",
      hindiWord: "बेटा (Beta)",
      meaning: "Beta from 'Beta Mange Car Scooter Baap Raazi'"
    }
  },
  {
    z: 5, symbol: "B", name: "Boron", atomicMass: 10.81, group: 13, period: 2, block: "p",
    category: "metalloid", standardState: "solid",
    electronConfiguration: "[He] 2s² 2p¹", shells: [2, 3],
    electronegativity: 2.04, atomicRadius: 87, ionizationEnergy: 801,
    meltingPoint: 2349, boilingPoint: 4200, density: 2.34,
    discoveryYear: 1808, discoverer: "Joseph Louis Gay-Lussac & Louis Jacques Thénard",
    description: "Hard, dark metalloid; crucial component of heat-resistant borosilicate glass and plant micronutrients.",
    practicalUses: "Pyrex glassware, bulletproof vests, fiberglass insulation, control rods in nuclear reactors.",
    mnemonic: {
      groupTitle: "Group 13: Boron Family",
      phrase: "Baingan Aloo Gajar In Thela",
      word: "Baingan",
      hindiWord: "बैंगन (Baingan)",
      meaning: "Baingan (Eggplant) from 'Baingan Aloo Gajar In Thela'"
    }
  },
  {
    z: 6, symbol: "C", name: "Carbon", atomicMass: 12.011, group: 14, period: 2, block: "p",
    category: "reactive-nonmetal", standardState: "solid",
    electronConfiguration: "[He] 2s² 2p²", shells: [2, 4],
    electronegativity: 2.55, atomicRadius: 67, ionizationEnergy: 1086,
    meltingPoint: 3823, boilingPoint: 4098, density: 2.267,
    discoveryYear: -2500, discoverer: "Ancient Civilizations",
    description: "The chemical cornerstone of all organic life on Earth, forming versatile covalent allotropes like diamond and graphite.",
    practicalUses: "Carbon fiber, steel alloy component, graphite electrodes, graphene electronics, pencil leads.",
    mnemonic: {
      groupTitle: "Group 14: Carbon Family",
      phrase: "Kahe Sita Ji Suno Prabhu",
      word: "Kahe",
      hindiWord: "कहे (Kahe / Chemistry)",
      meaning: "Kahe (Says) from 'Kahe Sita Ji Suno Prabhu'"
    }
  },
  {
    z: 7, symbol: "N", name: "Nitrogen", atomicMass: 14.007, group: 15, period: 2, block: "p",
    category: "reactive-nonmetal", standardState: "gas",
    electronConfiguration: "[He] 2s² 2p³", shells: [2, 5],
    electronegativity: 3.04, atomicRadius: 56, ionizationEnergy: 1402,
    meltingPoint: 63.15, boilingPoint: 77.36, density: 0.0012506,
    discoveryYear: 1772, discoverer: "Daniel Rutherford",
    description: "Colorless, odorless diatomic gas making up approximately 78% of Earth's atmosphere; essential for amino acids and DNA.",
    practicalUses: "Fertilizers (urea, ammonium nitrate), cryo-preservation, food packaging inert atmosphere, explosives.",
    mnemonic: {
      groupTitle: "Group 15: Nitrogen Family",
      phrase: "Nana Patekar Aishwarya Sab Bindaas",
      word: "Nana",
      hindiWord: "नाना (Nana / New Zealand)",
      meaning: "Nana (Nana Patekar) from 'Nana Patekar Aishwarya Sab Bindaas'"
    }
  },
  {
    z: 8, symbol: "O", name: "Oxygen", atomicMass: 15.999, group: 16, period: 2, block: "p",
    category: "reactive-nonmetal", standardState: "gas",
    electronConfiguration: "[He] 2s² 2p⁴", shells: [2, 6],
    electronegativity: 3.44, atomicRadius: 48, ionizationEnergy: 1314,
    meltingPoint: 54.36, boilingPoint: 90.20, density: 0.001429,
    discoveryYear: 1774, discoverer: "Joseph Priestley & Carl Wilhelm Scheele",
    description: "Highly reactive nonmetal and oxidizing agent; sustains aerobic cellular respiration and comprises 21% of Earth's air.",
    practicalUses: "Medical respiratory support, steel smelting blast furnaces, rocket liquid oxidizer, water molecule ($H_2O$).",
    mnemonic: {
      groupTitle: "Group 16: Oxygen Family (Chalcogens)",
      phrase: "Oye Style Se TePo",
      word: "Oye",
      hindiWord: "ओ (Oye / O)",
      meaning: "Oye from 'Oye Style Se TePo'"
    }
  },
  {
    z: 9, symbol: "F", name: "Fluorine", atomicMass: 18.998, group: 17, period: 2, block: "p",
    category: "halogen", standardState: "gas",
    electronConfiguration: "[He] 2s² 2p⁵", shells: [2, 7],
    electronegativity: 3.98, atomicRadius: 42, ionizationEnergy: 1681,
    meltingPoint: 53.53, boilingPoint: 85.03, density: 0.001696,
    discoveryYear: 1886, discoverer: "Henri Moissan",
    description: "Extremely toxic, pale yellow halogen; the most electronegative and chemically reactive of all elements.",
    practicalUses: "Teflon (PTFE) non-stick cookware, fluoridated toothpaste, refrigeration freons, uranium enrichment ($UF_6$).",
    mnemonic: {
      groupTitle: "Group 17: Halogens",
      phrase: "Fir Kal Bahar Aayi Aunty",
      word: "Fir",
      hindiWord: "फिर (Fir)",
      meaning: "Fir (Again) from 'Fir Kal Bahar Aayi Aunty'"
    }
  },
  {
    z: 10, symbol: "Ne", name: "Neon", atomicMass: 20.180, group: 18, period: 2, block: "p",
    category: "noble-gas", standardState: "gas",
    electronConfiguration: "[He] 2s² 2p⁶", shells: [2, 8],
    electronegativity: null, atomicRadius: 38, ionizationEnergy: 2081,
    meltingPoint: 24.56, boilingPoint: 27.07, density: 0.0008999,
    discoveryYear: 1898, discoverer: "William Ramsay & Morris Travers",
    description: "Colorless noble gas that glows with a brilliant reddish-orange discharge light in vacuum high-voltage discharge tubes.",
    practicalUses: "High-voltage neon signage, cryocooling liquids, laser eye surgery (He-Ne lasers), voltage indicators.",
    mnemonic: {
      groupTitle: "Group 18: Noble Gases",
      phrase: "Heena Neena Aur Kareena X-ray Rangeen",
      word: "Neena",
      hindiWord: "नीना (Neena)",
      meaning: "Neena from 'Heena Neena Aur Kareena X-ray Rangeen'"
    }
  },

  // ==========================================
  // PERIOD 3
  // ==========================================
  {
    z: 11, symbol: "Na", name: "Sodium", atomicMass: 22.990, group: 1, period: 3, block: "s",
    category: "alkali-metal", standardState: "solid",
    electronConfiguration: "[Ne] 3s¹", shells: [2, 8, 1],
    electronegativity: 0.93, atomicRadius: 190, ionizationEnergy: 496,
    meltingPoint: 370.87, boilingPoint: 1156, density: 0.968,
    discoveryYear: 1807, discoverer: "Humphry Davy",
    description: "Soft, highly reactive alkali metal; reacts vigorously with water producing hydrogen gas and caustic soda.",
    practicalUses: "Table salt ($NaCl$), baking soda, yellow highway streetlights, biological nerve impulse propagation.",
    mnemonic: {
      groupTitle: "Group 1: Alkali Metals",
      phrase: "Helina Ki Rab Se Fariyad",
      word: "Na",
      hindiWord: "ना (Na)",
      meaning: "Na (Helina) from 'Helina Ki Rab Se Fariyad'"
    }
  },
  {
    z: 12, symbol: "Mg", name: "Magnesium", atomicMass: 24.305, group: 2, period: 3, block: "s",
    category: "alkaline-earth", standardState: "solid",
    electronConfiguration: "[Ne] 3s²", shells: [2, 8, 2],
    electronegativity: 1.31, atomicRadius: 145, ionizationEnergy: 738,
    meltingPoint: 923, boilingPoint: 1363, density: 1.738,
    discoveryYear: 1755, discoverer: "Joseph Black",
    description: "Shiny gray alkaline earth metal; burns with a dazzling blinding white flame and serves as central atom of chlorophyll.",
    practicalUses: "Lightweight automotive alloys, dazzling fireworks sparklers, antacid milk of magnesia, chlorophyll photosynthesis.",
    mnemonic: {
      groupTitle: "Group 2: Alkaline Earth Metals",
      phrase: "Beta Mange Car Scooter Baap Raazi",
      word: "Mange",
      hindiWord: "मांगे (Mange)",
      meaning: "Mange (Demands) from 'Beta Mange Car Scooter Baap Raazi'"
    }
  },
  {
    z: 13, symbol: "Al", name: "Aluminium", atomicMass: 26.982, group: 13, period: 3, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Ne] 3s² 3p¹", shells: [2, 8, 3],
    electronegativity: 1.61, atomicRadius: 118, ionizationEnergy: 578,
    meltingPoint: 933.47, boilingPoint: 2792, density: 2.70,
    discoveryYear: 1825, discoverer: "Hans Christian Ørsted",
    description: "Silvery-white, ductile post-transition metal with low density and outstanding corrosion resistance via passivation.",
    practicalUses: "Aircraft fuselages, beverage cans, high-voltage transmission lines, window frames, kitchen cooking foil.",
    mnemonic: {
      groupTitle: "Group 13: Boron Family",
      phrase: "Baingan Aloo Gajar In Thela",
      word: "Aloo",
      hindiWord: "आलू (Aloo)",
      meaning: "Aloo (Potato) from 'Baingan Aloo Gajar In Thela'"
    }
  },
  {
    z: 14, symbol: "Si", name: "Silicon", atomicMass: 28.085, group: 14, period: 3, block: "p",
    category: "metalloid", standardState: "solid",
    electronConfiguration: "[Ne] 3s² 3p²", shells: [2, 8, 4],
    electronegativity: 1.90, atomicRadius: 111, ionizationEnergy: 786,
    meltingPoint: 1687, boilingPoint: 3538, density: 2.329,
    discoveryYear: 1824, discoverer: "Jöns Jacob Berzelius",
    description: "Hard, brittle semiconductor metalloid; foundational material for the global microelectronics revolution.",
    practicalUses: "Computer microprocessors, solar photovoltaic cells, silicone sealants, quartz sand glass manufacturing.",
    mnemonic: {
      groupTitle: "Group 14: Carbon Family",
      phrase: "Kahe Sita Ji Suno Prabhu",
      word: "Sita",
      hindiWord: "सीता (Sita / Sir)",
      meaning: "Sita from 'Kahe Sita Ji Suno Prabhu'"
    }
  },
  {
    z: 15, symbol: "P", name: "Phosphorus", atomicMass: 30.974, group: 15, period: 3, block: "p",
    category: "reactive-nonmetal", standardState: "solid",
    electronConfiguration: "[Ne] 3s² 3p³", shells: [2, 8, 5],
    electronegativity: 2.19, atomicRadius: 98, ionizationEnergy: 1012,
    meltingPoint: 317.30, boilingPoint: 553.65, density: 1.823,
    discoveryYear: 1669, discoverer: "Hennig Brand",
    description: "Nonmetal essential for life; forms cellular ATP energy currency and the structural sugar-phosphate DNA backbone.",
    practicalUses: "Phosphate agricultural fertilizers, matchbox striker friction strips, fireworks, LED semiconductors.",
    mnemonic: {
      groupTitle: "Group 15: Nitrogen Family",
      phrase: "Nana Patekar Aishwarya Sab Bindaas",
      word: "Patekar",
      hindiWord: "पाटेकर (Patekar / Pakistan)",
      meaning: "Patekar from 'Nana Patekar Aishwarya Sab Bindaas'"
    }
  },
  {
    z: 16, symbol: "S", name: "Sulfur", atomicMass: 32.06, group: 16, period: 3, block: "p",
    category: "reactive-nonmetal", standardState: "solid",
    electronConfiguration: "[Ne] 3s² 3p⁴", shells: [2, 8, 6],
    electronegativity: 2.58, atomicRadius: 88, ionizationEnergy: 1000,
    meltingPoint: 388.36, boilingPoint: 717.8, density: 2.07,
    discoveryYear: -500, discoverer: "Ancient Civilizations",
    description: "Bright yellow crystalline nonmetal; key constituent of sulfuric acid ($H_2SO_4$), vulcanized rubber, and proteins.",
    practicalUses: "Sulfuric acid industrial production, rubber tire vulcanization, gunpowder, fungicides, acne skin creams.",
    mnemonic: {
      groupTitle: "Group 16: Oxygen Family (Chalcogens)",
      phrase: "Oye Style Se TePo",
      word: "Style",
      hindiWord: "स्टाइल (Style)",
      meaning: "Style from 'Oye Style Se TePo'"
    }
  },
  {
    z: 17, symbol: "Cl", name: "Chlorine", atomicMass: 35.45, group: 17, period: 3, block: "p",
    category: "halogen", standardState: "gas",
    electronConfiguration: "[Ne] 3s² 3p⁵", shells: [2, 8, 7],
    electronegativity: 3.16, atomicRadius: 79, ionizationEnergy: 1251,
    meltingPoint: 171.6, boilingPoint: 239.11, density: 0.003214,
    discoveryYear: 1774, discoverer: "Carl Wilhelm Scheele",
    description: "Pungent, greenish-yellow suffocating gas; potent disinfectant used across the globe for water purification.",
    practicalUses: "Municipal drinking water disinfection, swimming pool sanitizer, PVC piping manufacture, household bleach.",
    mnemonic: {
      groupTitle: "Group 17: Halogens",
      phrase: "Fir Kal Bahar Aayi Aunty",
      word: "Kal",
      hindiWord: "कल (Kal)",
      meaning: "Kal (Tomorrow) from 'Fir Kal Bahar Aayi Aunty'"
    }
  },
  {
    z: 18, symbol: "Ar", name: "Argon", atomicMass: 39.948, group: 18, period: 3, block: "p",
    category: "noble-gas", standardState: "gas",
    electronConfiguration: "[Ne] 3s² 3p⁶", shells: [2, 8, 8],
    electronegativity: null, atomicRadius: 71, ionizationEnergy: 1521,
    meltingPoint: 83.81, boilingPoint: 87.30, density: 0.001784,
    discoveryYear: 1894, discoverer: "Lord Rayleigh & William Ramsay",
    description: "The most abundant noble gas in Earth's atmosphere (~0.93%), chemically inert and non-reactive.",
    practicalUses: "Shielding gas for TIG electric arc welding, incandescent light bulb fill gas, double-pane window thermal insulation.",
    mnemonic: {
      groupTitle: "Group 18: Noble Gases",
      phrase: "Heena Neena Aur Kareena X-ray Rangeen",
      word: "Aur",
      hindiWord: "और (Aur)",
      meaning: "Aur (And) from 'Heena Neena Aur Kareena X-ray Rangeen'"
    }
  },

  // ==========================================
  // PERIOD 4
  // ==========================================
  {
    z: 19, symbol: "K", name: "Potassium", atomicMass: 39.098, group: 1, period: 4, block: "s",
    category: "alkali-metal", standardState: "solid",
    electronConfiguration: "[Ar] 4s¹", shells: [2, 8, 8, 1],
    electronegativity: 0.82, atomicRadius: 243, ionizationEnergy: 419,
    meltingPoint: 336.53, boilingPoint: 1032, density: 0.862,
    discoveryYear: 1807, discoverer: "Humphry Davy",
    description: "Soft alkali metal that cuts like butter; explodes into violet flames upon contact with liquid water.",
    practicalUses: "NPK crop fertilizers, human nerve sodium-potassium ion pumps, potassium soaps, fireworks lilac bursts.",
    mnemonic: {
      groupTitle: "Group 1: Alkali Metals",
      phrase: "Helina Ki Rab Se Fariyad",
      word: "Ki",
      hindiWord: "की (Ki)",
      meaning: "Ki from 'Helina Ki Rab Se Fariyad'"
    }
  },
  {
    z: 20, symbol: "Ca", name: "Calcium", atomicMass: 40.078, group: 2, period: 4, block: "s",
    category: "alkaline-earth", standardState: "solid",
    electronConfiguration: "[Ar] 4s²", shells: [2, 8, 8, 2],
    electronegativity: 1.00, atomicRadius: 194, ionizationEnergy: 590,
    meltingPoint: 1115, boilingPoint: 1757, density: 1.54,
    discoveryYear: 1808, discoverer: "Humphry Davy",
    description: "Fifth most abundant element in Earth's crust; structural backbone of human skeletal bones, teeth, and seashells.",
    practicalUses: "Portland cement, limestone plaster, building mortar, bone mineralization, milk nutrition.",
    mnemonic: {
      groupTitle: "Group 2: Alkaline Earth Metals",
      phrase: "Beta Mange Car Scooter Baap Raazi",
      word: "Car",
      hindiWord: "कार (Car)",
      meaning: "Car from 'Beta Mange Car Scooter Baap Raazi'"
    }
  },
  {
    z: 21, symbol: "Sc", name: "Scandium", atomicMass: 44.956, group: 3, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d¹ 4s²", shells: [2, 8, 9, 2],
    electronegativity: 1.36, atomicRadius: 184, ionizationEnergy: 633,
    meltingPoint: 1814, boilingPoint: 3109, density: 2.985,
    discoveryYear: 1879, discoverer: "Lars Fredrik Nilson",
    description: "Silvery transition metal; drastically strengthens aluminum alloys for high-stress aerospace components.",
    practicalUses: "MiG fighter jet components, high-end bicycle frames, stadium metal-halide floodlights, baseball bats.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Science",
      hindiWord: "साइंस (Science)",
      meaning: "Science from 'Science Teacher Vineeta Kriplani'"
    }
  },
  {
    z: 22, symbol: "Ti", name: "Titanium", atomicMass: 47.867, group: 4, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d² 4s²", shells: [2, 8, 10, 2],
    electronegativity: 1.54, atomicRadius: 176, ionizationEnergy: 659,
    meltingPoint: 1941, boilingPoint: 3560, density: 4.506,
    discoveryYear: 1791, discoverer: "William Gregor",
    description: "Lightweight transition metal with legendary strength-to-weight ratio and immune system biocompatibility.",
    practicalUses: "Surgical joint implants, jet turbine engines, white pigment paint ($TiO_2$), spacecraft skins.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Teacher",
      hindiWord: "टीचर (Teacher)",
      meaning: "Teacher from 'Science Teacher Vineeta Kriplani'"
    }
  },
  {
    z: 23, symbol: "V", name: "Vanadium", atomicMass: 50.942, group: 5, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d³ 4s²", shells: [2, 8, 11, 2],
    electronegativity: 1.63, atomicRadius: 171, ionizationEnergy: 651,
    meltingPoint: 2183, boilingPoint: 3680, density: 6.11,
    discoveryYear: 1801, discoverer: "Andrés Manuel del Río",
    description: "Hard ductile transition metal; improves tensile strength and shock resistance of alloy steels.",
    practicalUses: "High-grade mechanical wrenches and tools (vanadium steel), redox flow grid batteries, jet engine parts.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Vineeta",
      hindiWord: "विनीता (Vineeta)",
      meaning: "Vineeta from 'Science Teacher Vineeta Kriplani'"
    }
  },
  {
    z: 24, symbol: "Cr", name: "Chromium", atomicMass: 51.996, group: 6, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d⁵ 4s¹", shells: [2, 8, 13, 1],
    electronegativity: 1.66, atomicRadius: 166, ionizationEnergy: 653,
    meltingPoint: 2180, boilingPoint: 2944, density: 7.19,
    discoveryYear: 1797, discoverer: "Louis-Nicolas Vauquelin",
    description: "Steely-gray, lustrous transition metal; takes a high mirror polish and provides stainless steel rust resistance.",
    practicalUses: "Stainless steel cutlery ($\ge 10.5\\% Cr$), chrome plating on car bumpers, green emerald gemstone color.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Kriplani",
      hindiWord: "कृपलानी (Kriplani)",
      meaning: "Kriplani from 'Science Teacher Vineeta Kriplani'"
    }
  },
  {
    z: 25, symbol: "Mn", name: "Manganese", atomicMass: 54.938, group: 7, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d⁵ 4s²", shells: [2, 8, 13, 2],
    electronegativity: 1.55, atomicRadius: 161, ionizationEnergy: 717,
    meltingPoint: 1519, boilingPoint: 2334, density: 7.21,
    discoveryYear: 1774, discoverer: "Johan Gottlieb Gahn",
    description: "Brittle transition metal essential for modern metallurgy; deoxidizes and desulfurizes molten iron into steel.",
    practicalUses: "Heavy-duty steel railroad tracks, standard alkaline battery cathodes ($MnO_2$), beverage can lids.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Man",
      hindiWord: "मन (Man)",
      meaning: "Man (Mind) from 'Science Teacher Vineeta Kriplani'"
    }
  },
  {
    z: 26, symbol: "Fe", name: "Iron", atomicMass: 55.845, group: 8, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d⁶ 4s²", shells: [2, 8, 14, 2],
    electronegativity: 1.83, atomicRadius: 156, ionizationEnergy: 762,
    meltingPoint: 1811, boilingPoint: 3134, density: 7.874,
    discoveryYear: -3500, discoverer: "Ancient Civilizations",
    description: "The most widely used metal on Earth; forms planetary molten cores and oxygen-carrying hemoglobin in red blood cells.",
    practicalUses: "Structural steel skyscrapers, bridges, automobiles, wrought iron gates, hemoglobin respiration.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Fe",
      hindiWord: "फे (Fe / Feko)",
      meaning: "Fe from 'ManFeCoNiCuZn'"
    }
  },
  {
    z: 27, symbol: "Co", name: "Cobalt", atomicMass: 58.933, group: 9, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d⁷ 4s²", shells: [2, 8, 15, 2],
    electronegativity: 1.88, atomicRadius: 152, ionizationEnergy: 760,
    meltingPoint: 1768, boilingPoint: 3200, density: 8.90,
    discoveryYear: 1735, discoverer: "Georg Brandt",
    description: "Ferromagnetic transition metal prized for intense blue pigments, jet turbine superalloys, and EV battery chemistries.",
    practicalUses: "Lithium-ion battery cathodes, deep cobalt-blue ceramic glazes, Alnico permanent magnets, vitamin B12.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Co",
      hindiWord: "को (Co)",
      meaning: "Co from 'ManFeCoNiCuZn'"
    }
  },
  {
    z: 28, symbol: "Ni", name: "Nickel", atomicMass: 58.693, group: 10, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d⁸ 4s²", shells: [2, 8, 16, 2],
    electronegativity: 1.91, atomicRadius: 149, ionizationEnergy: 737,
    meltingPoint: 1728, boilingPoint: 3186, density: 8.908,
    discoveryYear: 1751, discoverer: "Axel Fredrik Cronstedt",
    description: "Hard silvery-white transition metal; imparts corrosion resistance and ductility to austenitic stainless steels.",
    practicalUses: "Coins, nickel-cadmium rechargeable batteries, stainless steel, guitar strings, electroplating coatings.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Ni",
      hindiWord: "नी (Ni)",
      meaning: "Ni from 'ManFeCoNiCuZn'"
    }
  },
  {
    z: 29, symbol: "Cu", name: "Copper", atomicMass: 63.546, group: 11, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d¹⁰ 4s¹", shells: [2, 8, 18, 1],
    electronegativity: 1.90, atomicRadius: 145, ionizationEnergy: 745,
    meltingPoint: 1357.77, boilingPoint: 2835, density: 8.96,
    discoveryYear: -8000, discoverer: "Middle East Civilizations",
    description: "Reddish-orange transition metal with exceptional electrical and thermal conductivity; ushered humanity into the Bronze Age.",
    practicalUses: "Electrical wiring and power grids, plumbing water pipes, brass/bronze musical instruments, computer heat sinks.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Cu",
      hindiWord: "क्यूं (Cu / Kyun)",
      meaning: "Cu (Kyun) from 'ManFeCoNiCuZn'"
    }
  },
  {
    z: 30, symbol: "Zn", name: "Zinc", atomicMass: 65.38, group: 12, period: 4, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Ar] 3d¹⁰ 4s²", shells: [2, 8, 18, 2],
    electronegativity: 1.65, atomicRadius: 142, ionizationEnergy: 906,
    meltingPoint: 692.68, boilingPoint: 1180, density: 7.14,
    discoveryYear: 1746, discoverer: "Andreas Sigismund Marggraf",
    description: "Bluish-white transition metal; acts as sacrificial anode to galvanize and prevent steel from rusting.",
    practicalUses: "Galvanized sheet roofing, brass alloy (Cu-Zn), sunscreen lotion ($ZnO$), immune health mineral supplements.",
    mnemonic: {
      groupTitle: "3d Transition Series (Period 4)",
      phrase: "Science Teacher Vineeta Kriplani ManFeCoNiCuZn",
      word: "Zn",
      hindiWord: "जानेमन (Zn / Zaneman)",
      meaning: "Zn (Zaneman) from 'ManFeCoNiCuZn'"
    }
  },
  {
    z: 31, symbol: "Ga", name: "Gallium", atomicMass: 69.723, group: 13, period: 4, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p¹", shells: [2, 8, 18, 3],
    electronegativity: 1.81, atomicRadius: 136, ionizationEnergy: 579,
    meltingPoint: 302.91, boilingPoint: 2673, density: 5.91,
    discoveryYear: 1875, discoverer: "Paul-Émile Lecoq de Boisbaudran",
    description: "Post-transition metal that famously melts in the warmth of the human palm ($29.76^\\circ C$).",
    practicalUses: "Gallium arsenide ($GaAs$) high-speed radar chips, blue laser diodes, high-temperature thermometers.",
    mnemonic: {
      groupTitle: "Group 13: Boron Family",
      phrase: "Baingan Aloo Gajar In Thela",
      word: "Gajar",
      hindiWord: "गाजर (Gajar)",
      meaning: "Gajar (Carrot) from 'Baingan Aloo Gajar In Thela'"
    }
  },
  {
    z: 32, symbol: "Ge", name: "Germanium", atomicMass: 72.630, group: 14, period: 4, block: "p",
    category: "metalloid", standardState: "solid",
    electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p²", shells: [2, 8, 18, 4],
    electronegativity: 2.01, atomicRadius: 125, ionizationEnergy: 762,
    meltingPoint: 1211.40, boilingPoint: 3106, density: 5.323,
    discoveryYear: 1886, discoverer: "Clemens Winkler",
    description: "Lustrous gray-white metalloid; predicted by Mendeleev as 'eka-silicon' and used in early transistor circuits.",
    practicalUses: "Fiber-optic communication cables, infrared night-vision optics, solar cell substrates, polymerization catalysts.",
    mnemonic: {
      groupTitle: "Group 14: Carbon Family",
      phrase: "Kahe Sita Ji Suno Prabhu",
      word: "Ji",
      hindiWord: "जी (Geeta / Ji)",
      meaning: "Ji from 'Kahe Sita Ji Suno Prabhu'"
    }
  },
  {
    z: 33, symbol: "As", name: "Arsenic", atomicMass: 74.922, group: 15, period: 4, block: "p",
    category: "metalloid", standardState: "solid",
    electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p³", shells: [2, 8, 18, 5],
    electronegativity: 2.18, atomicRadius: 114, ionizationEnergy: 947,
    meltingPoint: 1090, boilingPoint: 887, density: 5.776,
    discoveryYear: 1250, discoverer: "Albertus Magnus",
    description: "Infamous toxic metalloid historically known as the 'Inheritance Powder'; also a key n-type silicon dopant.",
    practicalUses: "Gallium arsenide semiconductor optoelectronics, lead battery alloys, wood preservatives, laser diodes.",
    mnemonic: {
      groupTitle: "Group 15: Nitrogen Family",
      phrase: "Nana Patekar Aishwarya Sab Bindaas",
      word: "Aishwarya",
      hindiWord: "ऐश्वर्या (Aishwarya / Australia)",
      meaning: "Aishwarya from 'Nana Patekar Aishwarya Sab Bindaas'"
    }
  },
  {
    z: 34, symbol: "Se", name: "Selenium", atomicMass: 78.971, group: 16, period: 4, block: "p",
    category: "reactive-nonmetal", standardState: "solid",
    electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p⁴", shells: [2, 8, 18, 6],
    electronegativity: 2.55, atomicRadius: 103, ionizationEnergy: 941,
    meltingPoint: 494, boilingPoint: 958, density: 4.819,
    discoveryYear: 1817, discoverer: "Jöns Jacob Berzelius",
    description: "Nonmetal with unique photoconductive properties: its electrical electrical conductivity spikes when struck by light.",
    practicalUses: "Photocopier drums, light meters, ruby-red colored decorative glass, anti-dandruff shampoo.",
    mnemonic: {
      groupTitle: "Group 16: Oxygen Family (Chalcogens)",
      phrase: "Oye Style Se TePo",
      word: "Se",
      hindiWord: "से (Se)",
      meaning: "Se from 'Oye Style Se TePo'"
    }
  },
  {
    z: 35, symbol: "Br", name: "Bromine", atomicMass: 79.904, group: 17, period: 4, block: "p",
    category: "halogen", standardState: "liquid",
    electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p⁵", shells: [2, 8, 18, 7],
    electronegativity: 2.96, atomicRadius: 94, ionizationEnergy: 1140,
    meltingPoint: 265.8, boilingPoint: 332.0, density: 3.1028,
    discoveryYear: 1826, discoverer: "Antoine Jérôme Balard",
    description: "Dense, fuming reddish-brown halogen; the only nonmetallic chemical element that is a liquid at standard room temperature.",
    practicalUses: "Flame retardant plastics, classical photographic film emulsions ($AgBr$), agricultural fumigants, sedatives.",
    mnemonic: {
      groupTitle: "Group 17: Halogens",
      phrase: "Fir Kal Bahar Aayi Aunty",
      word: "Bahar",
      hindiWord: "बाहर (Bahar)",
      meaning: "Bahar (Outside) from 'Fir Kal Bahar Aayi Aunty'"
    }
  },
  {
    z: 36, symbol: "Kr", name: "Krypton", atomicMass: 83.798, group: 18, period: 4, block: "p",
    category: "noble-gas", standardState: "gas",
    electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p⁶", shells: [2, 8, 18, 8],
    electronegativity: 3.00, atomicRadius: 88, ionizationEnergy: 1351,
    meltingPoint: 115.79, boilingPoint: 119.93, density: 0.003749,
    discoveryYear: 1898, discoverer: "William Ramsay & Morris Travers",
    description: "Rare noble gas whose spectral line defined the international scientific standard meter between 1960 and 1983.",
    practicalUses: "Airport runway strobe flashers, insulated double-pane windows, excimer laser photolithography.",
    mnemonic: {
      groupTitle: "Group 18: Noble Gases",
      phrase: "Heena Neena Aur Kareena X-ray Rangeen",
      word: "Kareena",
      hindiWord: "करीना (Kareena)",
      meaning: "Kareena from 'Heena Neena Aur Kareena X-ray Rangeen'"
    }
  },

  // ==========================================
  // PERIOD 5
  // ==========================================
  {
    z: 37, symbol: "Rb", name: "Rubidium", atomicMass: 85.468, group: 1, period: 5, block: "s",
    category: "alkali-metal", standardState: "solid",
    electronConfiguration: "[Kr] 5s¹", shells: [2, 8, 18, 8, 1],
    electronegativity: 0.82, atomicRadius: 265, ionizationEnergy: 403,
    meltingPoint: 312.46, boilingPoint: 961, density: 1.532,
    discoveryYear: 1861, discoverer: "Robert Bunsen & Gustav Kirchhoff",
    description: "Highly reactive alkali metal discovered by flame spectroscopy; spontaneous combustion in moist room air.",
    practicalUses: "Precision atomic clocks in telecommunications, photocells, vapor lasers, Bose-Einstein condensate research.",
    mnemonic: {
      groupTitle: "Group 1: Alkali Metals",
      phrase: "Helina Ki Rab Se Fariyad",
      word: "Rab",
      hindiWord: "रब (Rab)",
      meaning: "Rab (God) from 'Helina Ki Rab Se Fariyad'"
    }
  },
  {
    z: 38, symbol: "Sr", name: "Strontium", atomicMass: 87.62, group: 2, period: 5, block: "s",
    category: "alkaline-earth", standardState: "solid",
    electronConfiguration: "[Kr] 5s²", shells: [2, 8, 18, 8, 2],
    electronegativity: 0.95, atomicRadius: 219, ionizationEnergy: 549,
    meltingPoint: 1050, boilingPoint: 1655, density: 2.64,
    discoveryYear: 1790, discoverer: "Adair Crawford",
    description: "Soft yellowish-silver alkaline earth metal; imparts an unmistakable deep, vivid crimson-red color to pyrotechnics.",
    practicalUses: "Brilliant red emergency distress flares and fireworks, glow-in-the-dark paints ($SrAl_2O_4$), atomic clocks.",
    mnemonic: {
      groupTitle: "Group 2: Alkaline Earth Metals",
      phrase: "Beta Mange Car Scooter Baap Raazi",
      word: "Scooter",
      hindiWord: "स्कूटर (Scooter)",
      meaning: "Scooter from 'Beta Mange Car Scooter Baap Raazi'"
    }
  },
  {
    z: 39, symbol: "Y", name: "Yttrium", atomicMass: 88.906, group: 3, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹ 5s²", shells: [2, 8, 18, 9, 2],
    electronegativity: 1.22, atomicRadius: 212, ionizationEnergy: 600,
    meltingPoint: 1799, boilingPoint: 3609, density: 4.472,
    discoveryYear: 1794, discoverer: "Johan Gadolin",
    description: "Transition metal and rare-earth element named after the Swedish village Ytterby; key to high-temperature superconductors.",
    practicalUses: "YBCO high-temperature superconductors, Nd:YAG industrial cutting lasers, red phosphors in CRT and LED screens.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Yaari",
      hindiWord: "यारी (Yaari)",
      meaning: "Yaari (Friendship) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 40, symbol: "Zr", name: "Zirconium", atomicMass: 91.224, group: 4, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d² 5s²", shells: [2, 8, 18, 10, 2],
    electronegativity: 1.33, atomicRadius: 206, ionizationEnergy: 640,
    meltingPoint: 2128, boilingPoint: 4682, density: 6.52,
    discoveryYear: 1789, discoverer: "Martin Heinrich Klaproth",
    description: "Corrosion-proof transition metal with low neutron absorption cross-section; the primary cladding for nuclear fuel rods.",
    practicalUses: "Nuclear reactor core fuel rod cladding, cubic zirconia diamond simulant jewelry, ceramic dental crowns.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Zara",
      hindiWord: "ज़रा (Zara)",
      meaning: "Zara (A Little) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 41, symbol: "Nb", name: "Niobium", atomicMass: 92.906, group: 5, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d⁴ 5s¹", shells: [2, 8, 18, 12, 1],
    electronegativity: 1.6, atomicRadius: 198, ionizationEnergy: 652,
    meltingPoint: 2750, boilingPoint: 5017, density: 8.57,
    discoveryYear: 1801, discoverer: "Charles Hatchett",
    description: "Soft ductile transition metal that turns superconducting at cryogenic temperatures ($9.2 K$).",
    practicalUses: "Superconducting magnets for MRI scanners and particle accelerators (CERN LHC), gas pipeline structural alloys.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Nibhana",
      hindiWord: "निभाना (Nibhana)",
      meaning: "Nibhana (Fulfill) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 42, symbol: "Mo", name: "Molybdenum", atomicMass: 95.95, group: 6, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d⁵ 5s¹", shells: [2, 8, 18, 13, 1],
    electronegativity: 2.16, atomicRadius: 190, ionizationEnergy: 684,
    meltingPoint: 2896, boilingPoint: 4912, density: 10.28,
    discoveryYear: 1778, discoverer: "Carl Wilhelm Scheele",
    description: "Refractory metal with one of the highest melting points among elements; essential enzyme cofactor in nitrogen fixation.",
    practicalUses: "High-strength structural steel alloys, petroleum hydrodesulfurization catalysts, furnace heating coils.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Maut",
      hindiWord: "मौत (Maut)",
      meaning: "Maut (Death) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 43, symbol: "Tc", name: "Technetium", atomicMass: 98, group: 7, period: 5, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Kr] 4d⁵ 5s²", shells: [2, 8, 18, 13, 2],
    electronegativity: 1.9, atomicRadius: 183, ionizationEnergy: 702,
    meltingPoint: 2430, boilingPoint: 4538, density: 11.5,
    discoveryYear: 1937, discoverer: "Emilio Segrè & Carlo Perrier",
    description: "First artificially created chemical element in history; radioisotope Technetium-99m is the workhorse of nuclear medicine.",
    practicalUses: "Over 20 million medical diagnostic SPECT imaging scans annually (bone, cardiac, and organ scans).",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Tak",
      hindiWord: "तक (Tak)",
      meaning: "Tak (Until) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 44, symbol: "Ru", name: "Ruthenium", atomicMass: 101.07, group: 8, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d⁷ 5s¹", shells: [2, 8, 18, 15, 1],
    electronegativity: 2.2, atomicRadius: 178, ionizationEnergy: 710,
    meltingPoint: 2607, boilingPoint: 4423, density: 12.45,
    discoveryYear: 1844, discoverer: "Karl Ernst Claus",
    description: "Rare platinum-group transition metal; provides extreme hardness and wear resistance in electrical contacts.",
    practicalUses: "Computer hard drive magnetic recording read-heads, solar dye cells, electrical contact relays.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Rukaawat",
      hindiWord: "रुकावट (Rukaawat)",
      meaning: "Rukaawat (Obstacle) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 45, symbol: "Rh", name: "Rhodium", atomicMass: 102.91, group: 9, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d⁸ 5s¹", shells: [2, 8, 18, 16, 1],
    electronegativity: 2.28, atomicRadius: 173, ionizationEnergy: 720,
    meltingPoint: 2237, boilingPoint: 3968, density: 12.41,
    discoveryYear: 1803, discoverer: "William Hyde Wollaston",
    description: "One of the rarest, most valuable precious metals on the planet; catalytic destroyer of toxic nitrogen oxide auto emissions.",
    practicalUses: "Automotive 3-way catalytic converters, brilliant reflective plating for white gold jewelry, chemical catalysts.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Raah",
      hindiWord: "राह (Raah)",
      meaning: "Raah (Path) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 46, symbol: "Pd", name: "Palladium", atomicMass: 106.42, group: 10, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰", shells: [2, 8, 18, 18],
    electronegativity: 2.20, atomicRadius: 169, ionizationEnergy: 804,
    meltingPoint: 1828.05, boilingPoint: 3236, density: 12.023,
    discoveryYear: 1802, discoverer: "William Hyde Wollaston",
    description: "Platinum-group metal that can absorb up to 900 times its own volume of hydrogen gas, acting as a molecular hydrogen sponge.",
    practicalUses: "Auto catalytic converters, hydrogen purification membranes, dental crowns, multi-layer ceramic capacitors.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Pade",
      hindiWord: "पड़े (Pade)",
      meaning: "Pade (Falls) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 47, symbol: "Ag", name: "Silver", atomicMass: 107.87, group: 11, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰ 5s¹", shells: [2, 8, 18, 18, 1],
    electronegativity: 1.93, atomicRadius: 165, ionizationEnergy: 731,
    meltingPoint: 1234.93, boilingPoint: 2435, density: 10.49,
    discoveryYear: -3000, discoverer: "Ancient Civilizations",
    description: "Precious transition metal with the highest electrical conductivity, thermal conductivity, and optical reflectivity of all metals.",
    practicalUses: "Solar panel conductive pastes, silver tableware and jewelry, antibacterial wound dressings, precision electronics.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Aage",
      hindiWord: "आगे (Aage)",
      meaning: "Aage (Forward) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 48, symbol: "Cd", name: "Cadmium", atomicMass: 112.41, group: 12, period: 5, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰ 5s²", shells: [2, 8, 18, 18, 2],
    electronegativity: 1.69, atomicRadius: 161, ionizationEnergy: 868,
    meltingPoint: 594.22, boilingPoint: 1040, density: 8.65,
    discoveryYear: 1817, discoverer: "Karl Samuel Leberecht Hermann & Friedrich Stromeyer",
    description: "Soft bluish-white metal; toxic heavy metal with strong neutron-absorbing cross section used in nuclear control rods.",
    practicalUses: "Rechargeable Ni-Cd batteries, cadmium telluride ($CdTe$) solar cells, brilliant yellow/red artist oil pigments.",
    mnemonic: {
      groupTitle: "4d Transition Series (Period 5)",
      phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
      word: "Kood",
      hindiWord: "कूद (Kood)",
      meaning: "Kood (Jump) from 'Yaari Zara Nibhana Maut Tak'"
    }
  },
  {
    z: 49, symbol: "In", name: "Indium", atomicMass: 114.82, group: 13, period: 5, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p¹", shells: [2, 8, 18, 18, 3],
    electronegativity: 1.78, atomicRadius: 156, ionizationEnergy: 558,
    meltingPoint: 429.75, boilingPoint: 2345, density: 7.31,
    discoveryYear: 1863, discoverer: "Ferdinand Reich & Hieronymous Theodor Richter",
    description: "Very soft, malleable post-transition metal; emits a high-pitched 'tin cry' screech when bent by hand.",
    practicalUses: "Indium Tin Oxide ($ITO$) transparent conducting coatings for smartphone touchscreens, flatscreen TVs, solder seals.",
    mnemonic: {
      groupTitle: "Group 13: Boron Family",
      phrase: "Baingan Aloo Gajar In Thela",
      word: "In",
      hindiWord: "इन (In)",
      meaning: "In from 'Baingan Aloo Gajar In Thela'"
    }
  },
  {
    z: 50, symbol: "Sn", name: "Tin", atomicMass: 118.71, group: 14, period: 5, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p²", shells: [2, 8, 18, 18, 4],
    electronegativity: 1.96, atomicRadius: 145, ionizationEnergy: 709,
    meltingPoint: 505.08, boilingPoint: 2875, density: 7.31,
    discoveryYear: -3500, discoverer: "Ancient Civilizations",
    description: "Post-transition metal alloyed with copper to make bronze; undergoes allotropic 'tin pest' crumble at low temperatures.",
    practicalUses: "Corrosion-resistant tin cans for preserved food, electronic circuit board soldering, pewter cups, float glass baths.",
    mnemonic: {
      groupTitle: "Group 14: Carbon Family",
      phrase: "Kahe Sita Ji Suno Prabhu",
      word: "Suno",
      hindiWord: "सुनो (Suno)",
      meaning: "Suno (Listen) from 'Kahe Sita Ji Suno Prabhu'"
    }
  },
  {
    z: 51, symbol: "Sb", name: "Antimony", atomicMass: 121.76, group: 15, period: 5, block: "p",
    category: "metalloid", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p³", shells: [2, 8, 18, 18, 5],
    electronegativity: 2.05, atomicRadius: 133, ionizationEnergy: 834,
    meltingPoint: 903.78, boilingPoint: 1908, density: 6.697,
    discoveryYear: -3000, discoverer: "Ancient Egyptians",
    description: "Lustrous gray metalloid known to the ancients as 'kohl' eyeliner; expands slightly upon solidifying.",
    practicalUses: "Flame retardant synergies in textiles, lead-acid car battery plates, type metal printing, night-vision diodes.",
    mnemonic: {
      groupTitle: "Group 15: Nitrogen Family",
      phrase: "Nana Patekar Aishwarya Sab Bindaas",
      word: "Sab",
      hindiWord: "सब (Sab)",
      meaning: "Sab (All) from 'Nana Patekar Aishwarya Sab Bindaas'"
    }
  },
  {
    z: 52, symbol: "Te", name: "Tellurium", atomicMass: 127.60, group: 16, period: 5, block: "p",
    category: "metalloid", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁴", shells: [2, 8, 18, 18, 6],
    electronegativity: 2.1, atomicRadius: 123, ionizationEnergy: 869,
    meltingPoint: 722.66, boilingPoint: 1261, density: 6.24,
    discoveryYear: 1782, discoverer: "Franz-Joseph Müller von Reichenstein",
    description: "Brittle, mildly toxic metalloid; gives those exposed a persistent garlic-like breath known as 'tellurium breath'.",
    practicalUses: "Cadmium telluride ($CdTe$) high-efficiency solar panels, thermoelectric cooling coolers, rewritable DVDs.",
    mnemonic: {
      groupTitle: "Group 16: Oxygen Family (Chalcogens)",
      phrase: "Oye Style Se TePo",
      word: "Te",
      hindiWord: "टी (Te)",
      meaning: "Te from 'Oye Style Se TePo'"
    }
  },
  {
    z: 53, symbol: "I", name: "Iodine", atomicMass: 126.90, group: 17, period: 5, block: "p",
    category: "halogen", standardState: "solid",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁵", shells: [2, 8, 18, 18, 7],
    electronegativity: 2.66, atomicRadius: 115, ionizationEnergy: 1008,
    meltingPoint: 386.85, boilingPoint: 457.4, density: 4.933,
    discoveryYear: 1811, discoverer: "Bernard Courtois",
    description: "Lustrous purple-black solid halogen; sublimates upon gentle warming directly into magnificent deep-violet vapors.",
    practicalUses: "Iodized table salt preventing goitre, surgical antiseptic povidone-iodine (Betadine), CT scan contrast agents.",
    mnemonic: {
      groupTitle: "Group 17: Halogens",
      phrase: "Fir Kal Bahar Aayi Aunty",
      word: "Aayi",
      hindiWord: "आई (Aayi)",
      meaning: "Aayi (Came) from 'Fir Kal Bahar Aayi Aunty'"
    }
  },
  {
    z: 54, symbol: "Xe", name: "Xenon", atomicMass: 131.29, group: 18, period: 5, block: "p",
    category: "noble-gas", standardState: "gas",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁶", shells: [2, 8, 18, 18, 8],
    electronegativity: 2.6, atomicRadius: 108, ionizationEnergy: 1170,
    meltingPoint: 161.4, boilingPoint: 165.051, density: 0.005894,
    discoveryYear: 1898, discoverer: "William Ramsay & Morris Travers",
    description: "Heavy noble gas that can form true chemical compounds ($XeF_4$, $XeO_3$); the propellant of choice for satellite ion drives.",
    practicalUses: "Deep-space satellite ion thrusters (NASA / ESA), luxury car HID xenon headlights, surgical neuroprotective anesthesia.",
    mnemonic: {
      groupTitle: "Group 18: Noble Gases",
      phrase: "Heena Neena Aur Kareena X-ray Rangeen",
      word: "X-ray",
      hindiWord: "एक्स-रे (X-ray)",
      meaning: "X-ray from 'Heena Neena Aur Kareena X-ray Rangeen'"
    }
  },

  // ==========================================
  // PERIOD 6
  // ==========================================
  {
    z: 55, symbol: "Cs", name: "Caesium", atomicMass: 132.91, group: 1, period: 6, block: "s",
    category: "alkali-metal", standardState: "solid",
    electronConfiguration: "[Xe] 6s¹", shells: [2, 8, 18, 18, 8, 1],
    electronegativity: 0.79, atomicRadius: 298, ionizationEnergy: 376,
    meltingPoint: 301.59, boilingPoint: 944, density: 1.93,
    discoveryYear: 1860, discoverer: "Robert Bunsen & Gustav Kirchhoff",
    description: "Silvery-golden, butter-soft alkali metal; melts just above room temperature and defines the official SI second.",
    practicalUses: "Caesium atomic clocks (defining 1 second = 9,192,631,770 transitions), drilling fluids, photoelectric cells.",
    mnemonic: {
      groupTitle: "Group 1: Alkali Metals",
      phrase: "Helina Ki Rab Se Fariyad",
      word: "Se",
      hindiWord: "से (Se)",
      meaning: "Se from 'Helina Ki Rab Se Fariyad'"
    }
  },
  {
    z: 56, symbol: "Ba", name: "Barium", atomicMass: 137.33, group: 2, period: 6, block: "s",
    category: "alkaline-earth", standardState: "solid",
    electronConfiguration: "[Xe] 6s²", shells: [2, 8, 18, 18, 8, 2],
    electronegativity: 0.89, atomicRadius: 253, ionizationEnergy: 503,
    meltingPoint: 1000, boilingPoint: 2170, density: 3.51,
    discoveryYear: 1772, discoverer: "Carl Wilhelm Scheele",
    description: "Dense, silvery alkaline earth metal; imparts an unmistakable apple-green flash to celebratory fireworks displays.",
    practicalUses: "Medical diagnostic gastrointestinal barium meal X-rays ($BaSO_4$), emerald green fireworks, oil well drilling muds.",
    mnemonic: {
      groupTitle: "Group 2: Alkaline Earth Metals",
      phrase: "Beta Mange Car Scooter Baap Raazi",
      word: "Baap",
      hindiWord: "बाप (Baap)",
      meaning: "Baap (Father) from 'Beta Mange Car Scooter Baap Raazi'"
    }
  },
  {
    z: 57, symbol: "La", name: "Lanthanum", atomicMass: 138.91, group: 3, period: 6, block: "d",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 5d¹ 6s²", shells: [2, 8, 18, 18, 9, 2],
    electronegativity: 1.1, atomicRadius: 226, ionizationEnergy: 538,
    meltingPoint: 1193, boilingPoint: 3737, density: 6.162,
    discoveryYear: 1839, discoverer: "Carl Gustaf Mosander",
    description: "Prototypical lanthanide metal; ductile and soft, tarnishing quickly in air and giving its name to the 15-element series.",
    practicalUses: "Hybrid vehicle NiMH battery electrodes, camera lens optical glass (high refractive index), studio carbon arc lamps.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "La",
      hindiWord: "ला (La)",
      meaning: "La (Bring) from 'La Hafta Warna Re'"
    }
  },
  {
    z: 58, symbol: "Ce", name: "Cerium", atomicMass: 140.12, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹ 5d¹ 6s²", shells: [2, 8, 18, 19, 9, 2],
    electronegativity: 1.12, atomicRadius: 210, ionizationEnergy: 534,
    meltingPoint: 1068, boilingPoint: 3716, density: 6.77,
    discoveryYear: 1803, discoverer: "Martin Heinrich Klaproth & Jöns Jacob Berzelius",
    description: "Most abundant of the rare-earth metals; sparks profusely when struck against steel as mischmetal flints.",
    practicalUses: "Cigarette lighter flints, glass polishing powder ($CeO_2$), catalytic converter diesel soot filters.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Seene",
      hindiWord: "सीने (Seene)",
      meaning: "Seene (Chest) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 59, symbol: "Pr", name: "Praseodymium", atomicMass: 140.91, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f³ 6s²", shells: [2, 8, 18, 21, 8, 2],
    electronegativity: 1.13, atomicRadius: 247, ionizationEnergy: 527,
    meltingPoint: 1208, boilingPoint: 3793, density: 6.77,
    discoveryYear: 1885, discoverer: "Carl Auer von Welsbach",
    description: "Soft, silvery rare-earth metal named for its 'green twin' salts; components of super-strength neodymium magnets.",
    practicalUses: "Didymium glass for glassblower goggles (blocks yellow sodium flare), aircraft engine alloys, yellow ceramic stains.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Par",
      hindiWord: "पर (Par)",
      meaning: "Par (On) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 60, symbol: "Nd", name: "Neodymium", atomicMass: 144.24, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f⁴ 6s²", shells: [2, 8, 18, 22, 8, 2],
    electronegativity: 1.14, atomicRadius: 206, ionizationEnergy: 533,
    meltingPoint: 1297, boilingPoint: 3347, density: 7.01,
    discoveryYear: 1885, discoverer: "Carl Auer von Welsbach",
    description: "Lanthanide famous for producing the world's strongest commercially available permanent magnets ($Nd_2Fe_{14}B$).",
    practicalUses: "Electric vehicle drive motors, wind turbine generators, smartphone haptic vibrating motors, headphone drivers.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Nadiyaan",
      hindiWord: "नदियां (Nadiyaan)",
      meaning: "Nadiyaan (Rivers) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 61, symbol: "Pm", name: "Promethium", atomicMass: 145, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "synthetic",
    electronConfiguration: "[Xe] 4f⁵ 6s²", shells: [2, 8, 18, 23, 8, 2],
    electronegativity: 1.13, atomicRadius: 205, ionizationEnergy: 540,
    meltingPoint: 1315, boilingPoint: 3273, density: 7.26,
    discoveryYear: 1945, discoverer: "Jacob A. Marinsky, Lawrence E. Glendenin & Charles D. Coryell",
    description: "Radioactive lanthanide virtually absent in nature, named after the Titan Prometheus who stole fire for humanity.",
    practicalUses: "Atomic nuclear batteries for cardiac pacemakers and deep-space probes, luminous watch dial paints.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Prem",
      hindiWord: "प्रेम (Prem)",
      meaning: "Prem (Love) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 62, symbol: "Sm", name: "Samarium", atomicMass: 150.36, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f⁶ 6s²", shells: [2, 8, 18, 24, 8, 2],
    electronegativity: 1.17, atomicRadius: 238, ionizationEnergy: 544,
    meltingPoint: 1345, boilingPoint: 2067, density: 7.52,
    discoveryYear: 1879, discoverer: "Paul-Émile Lecoq de Boisbaudran",
    description: "Lanthanide forming high-temperature resistant permanent magnets ($SmCo$) that resist demagnetization up to $800^\\circ C$.",
    practicalUses: "Military radar and precision missile electronics, cancer bone pain radio-therapy (Samarium-153 Quadramet), guitar pickups.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Samayi",
      hindiWord: "समाई (Samayi)",
      meaning: "Samayi (Subsumed) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 63, symbol: "Eu", name: "Europium", atomicMass: 151.96, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f⁷ 6s²", shells: [2, 8, 18, 25, 8, 2],
    electronegativity: 1.2, atomicRadius: 231, ionizationEnergy: 547,
    meltingPoint: 1099, boilingPoint: 1802, density: 5.244,
    discoveryYear: 1901, discoverer: "Eugène-Anatole Demarçay",
    description: "The most chemically reactive lanthanide; emits brilliant red and blue phosphorescence under ultraviolet black light.",
    practicalUses: "Anti-counterfeiting security watermarks on Euro banknotes, red phosphors in television displays, quantum computing bits.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Yun",
      hindiWord: "यूं (Yun)",
      meaning: "Yun (In this way) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 64, symbol: "Gd", name: "Gadolinium", atomicMass: 157.25, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f⁷ 5d¹ 6s²", shells: [2, 8, 18, 25, 9, 2],
    electronegativity: 1.2, atomicRadius: 233, ionizationEnergy: 593,
    meltingPoint: 1585, boilingPoint: 3546, density: 7.90,
    discoveryYear: 1880, discoverer: "Jean Charles Galissard de Marignac",
    description: "Lanthanide with remarkable magnetic properties and 7 unpaired electrons; ferromagnetic just below room temperature ($20^\\circ C$).",
    practicalUses: "Intravenous MRI contrast agents, nuclear reactor emergency shutdown control rods, magnetocaloric refrigeration.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Gad-gad",
      hindiWord: "गदगद (Gad-gad)",
      meaning: "Gad-gad (Delighted) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 65, symbol: "Tb", name: "Terbium", atomicMass: 158.93, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f⁹ 6s²", shells: [2, 8, 18, 27, 8, 2],
    electronegativity: 1.2, atomicRadius: 225, ionizationEnergy: 565,
    meltingPoint: 1629, boilingPoint: 3503, density: 8.23,
    discoveryYear: 1843, discoverer: "Carl Gustaf Mosander",
    description: "Malleable rare earth metal; expands and contracts in magnetic fields (magnetostriction), forming Terfenol-D.",
    practicalUses: "Sonar transducers, smart audio speakers turning tables into sounding boards, green display phosphors.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Tab",
      hindiWord: "तब (Tab)",
      meaning: "Tab (Then) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 66, symbol: "Dy", name: "Dysprosium", atomicMass: 162.50, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁰ 6s²", shells: [2, 8, 18, 28, 8, 2],
    electronegativity: 1.22, atomicRadius: 228, ionizationEnergy: 573,
    meltingPoint: 1680, boilingPoint: 2840, density: 8.54,
    discoveryYear: 1886, discoverer: "Paul-Émile Lecoq de Boisbaudran",
    description: "Named from the Greek 'dysprositos' meaning 'hard to get'; stabilizes neodymium magnets under fierce motor heat.",
    practicalUses: "High-temperature EV traction motor magnets, nuclear control rods, high-intensity discharge lamps.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Dil",
      hindiWord: "दिल (Dil)",
      meaning: "Dil (Heart) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 67, symbol: "Ho", name: "Holmium", atomicMass: 164.93, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹¹ 6s²", shells: [2, 8, 18, 29, 8, 2],
    electronegativity: 1.23, atomicRadius: 226, ionizationEnergy: 581,
    meltingPoint: 1734, boilingPoint: 2993, density: 8.79,
    discoveryYear: 1878, discoverer: "Jacques-Louis Soret & Marc Delafontaine",
    description: "Lanthanide with the highest magnetic permeability of any chemical element; concentrates magnetic flux.",
    practicalUses: "Holmium-YAG medical lasers for kidney stone fragmentation, magnetic pole pieces in MRI machines, yellow glass tint.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Hua",
      hindiWord: "हुआ (Hua)",
      meaning: "Hua (Happened) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 68, symbol: "Er", name: "Erbium", atomicMass: 167.26, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹² 6s²", shells: [2, 8, 18, 30, 8, 2],
    electronegativity: 1.24, atomicRadius: 226, ionizationEnergy: 589,
    meltingPoint: 1802, boilingPoint: 3141, density: 9.066,
    discoveryYear: 1843, discoverer: "Carl Gustaf Mosander",
    description: "Lanthanide providing optical signal amplification ($EDFA$) that enables worldwide undersea fiber-optic internet traffic.",
    practicalUses: "Erbium-doped fiber amplifiers for global internet data, cosmetic skin-resurfacing laser surgery, pink glass.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Aur",
      hindiWord: "और (Aur)",
      meaning: "Aur (And) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 69, symbol: "Tm", name: "Thulium", atomicMass: 168.93, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹³ 6s²", shells: [2, 8, 18, 31, 8, 2],
    electronegativity: 1.25, atomicRadius: 222, ionizationEnergy: 597,
    meltingPoint: 1818, boilingPoint: 2223, density: 9.32,
    discoveryYear: 1879, discoverer: "Per Teodor Cleve",
    description: "The second rarest naturally occurring lanthanide; named after the mythic northern wilderness region of Thule.",
    practicalUses: "Portable field x-ray generators, military surgical lasers, high-efficiency euro currency banknote security phosphors.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Tum",
      hindiWord: "तुम (Tum)",
      meaning: "Tum (You) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 70, symbol: "Yb", name: "Ytterbium", atomicMass: 173.05, group: null, period: 6, block: "f",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 6s²", shells: [2, 8, 18, 32, 8, 2],
    electronegativity: 1.1, atomicRadius: 222, ionizationEnergy: 603,
    meltingPoint: 1097, boilingPoint: 1469, density: 6.90,
    discoveryYear: 1878, discoverer: "Jean Charles Galissard de Marignac",
    description: "Lanthanide with a filled 4f subshell; central to the world's most precise atomic optical lattice clocks.",
    practicalUses: "Ultra-accurate optical atomic clocks (accurate to 1 second in 15 billion years), stainless steel grain refiners.",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Ab",
      hindiWord: "अब (Ab / Yahan)",
      meaning: "Ab (Now) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 71, symbol: "Lu", name: "Lutetium", atomicMass: 174.97, group: 3, period: 6, block: "d",
    category: "lanthanide", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹ 6s²", shells: [2, 8, 18, 32, 9, 2],
    electronegativity: 1.27, atomicRadius: 217, ionizationEnergy: 524,
    meltingPoint: 1925, boilingPoint: 3675, density: 9.841,
    discoveryYear: 1907, discoverer: "Georges Urbain & Carl Auer von Welsbach",
    description: "The hardest, densest, and final element of the lanthanide series; named after the ancient Roman name of Paris (Lutetia).",
    practicalUses: "PET scan detector scintillators ($LSO$), petroleum catalytic cracking, targeted oncology radiotherapy ($^{177}Lu$).",
    mnemonic: {
      groupTitle: "Lanthanides (4f Series)",
      phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
      word: "Laut",
      hindiWord: "लौट (Laut)",
      meaning: "Laut (Return) from 'Seene Par Nadiyaan Prem Ki Samayi'"
    }
  },
  {
    z: 72, symbol: "Hf", name: "Hafnium", atomicMass: 178.49, group: 4, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d² 6s²", shells: [2, 8, 18, 32, 10, 2],
    electronegativity: 1.3, atomicRadius: 208, ionizationEnergy: 659,
    meltingPoint: 2506, boilingPoint: 4876, density: 13.31,
    discoveryYear: 1923, discoverer: "Dirk Coster & George de Hevesy",
    description: "Corrosion-resistant transition metal nearly identical chemically to zirconium; potent nuclear neutron absorber.",
    practicalUses: "Nuclear submarine control rods, microchip high-k dielectric gate insulators ($HfO_2$), plasma cutting electrode tips.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Haf",
      hindiWord: "हफ्ता (Haf / Hafta)",
      meaning: "Haf from 'La Hafta Warna Re'"
    }
  },
  {
    z: 73, symbol: "Ta", name: "Tantalum", atomicMass: 180.95, group: 5, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d³ 6s²", shells: [2, 8, 18, 32, 11, 2],
    electronegativity: 1.5, atomicRadius: 200, ionizationEnergy: 761,
    meltingPoint: 3290, boilingPoint: 5731, density: 16.69,
    discoveryYear: 1802, discoverer: "Anders Gustaf Ekeberg",
    description: "Highly corrosion-resistant refractory metal named after Tantalus; creates miniature high-capacitance electronic capacitors.",
    practicalUses: "Miniature capacitors inside smartphones, surgical bone repair pins and mesh implants, jet engine turbine blades.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Ta",
      hindiWord: "ता (Ta)",
      meaning: "Ta from 'La Hafta Warna Re'"
    }
  },
  {
    z: 74, symbol: "W", name: "Tungsten", atomicMass: 183.84, group: 6, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d⁴ 6s²", shells: [2, 8, 18, 32, 12, 2],
    electronegativity: 2.36, atomicRadius: 193, ionizationEnergy: 770,
    meltingPoint: 3695, boilingPoint: 5828, density: 19.25,
    discoveryYear: 1781, discoverer: "Carl Wilhelm Scheele & Juan José Elhuyar",
    description: "Heavy transition metal with the highest melting point ($3422^\\circ C$) and highest tensile strength of any pure element.",
    practicalUses: "Incandescent light bulb filaments, tungsten carbide ($WC$) heavy drill bits, armor-piercing kinetic penetrators.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Warna",
      hindiWord: "वरना (Warna)",
      meaning: "Warna (Otherwise) from 'La Hafta Warna Re'"
    }
  },
  {
    z: 75, symbol: "Re", name: "Rhenium", atomicMass: 186.21, group: 7, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d⁵ 6s²", shells: [2, 8, 18, 32, 13, 2],
    electronegativity: 1.9, atomicRadius: 188, ionizationEnergy: 760,
    meltingPoint: 3459, boilingPoint: 5869, density: 21.02,
    discoveryYear: 1925, discoverer: "Walter Noddack, Ida Tacke & Otto Berg",
    description: "One of the rarest elements in the Earth's crust; withstands brutal centrifugal stress at white-hot jet combustion temperatures.",
    practicalUses: "Commercial jet turbine single-crystal superalloys (Boeing / Airbus), lead-free high-octane gasoline platinum-rhenium catalysts.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Re",
      hindiWord: "रे (Re)",
      meaning: "Re from 'La Hafta Warna Re'"
    }
  },
  {
    z: 76, symbol: "Os", name: "Osmium", atomicMass: 190.23, group: 8, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d⁶ 6s²", shells: [2, 8, 18, 32, 14, 2],
    electronegativity: 2.2, atomicRadius: 185, ionizationEnergy: 840,
    meltingPoint: 3306, boilingPoint: 5285, density: 22.59,
    discoveryYear: 1803, discoverer: "Smithson Tennant",
    description: "The densest naturally occurring element on Earth ($22.59 g/cm^3$); double the density of lead, with an acrid toxic oxide ($OsO_4$).",
    practicalUses: "Wear-resistant fountain pen nibs, electrical contacts, phonograph stylus needles, forensic fingerprint staining.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Usse",
      hindiWord: "उससे (Usse)",
      meaning: "Usse (From him) from 'La Hafta Warna Re'"
    }
  },
  {
    z: 77, symbol: "Ir", name: "Iridium", atomicMass: 192.22, group: 9, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d⁷ 6s²", shells: [2, 8, 18, 32, 15, 2],
    electronegativity: 2.2, atomicRadius: 180, ionizationEnergy: 880,
    meltingPoint: 2719, boilingPoint: 4701, density: 22.56,
    discoveryYear: 1803, discoverer: "Smithson Tennant",
    description: "The most corrosion-resistant metal known; the worldwide geological K-Pg boundary iridium layer confirmed asteroid dinosaur extinction.",
    practicalUses: "Aviation spark plug tips, crucibles for high-purity single crystal growth, standard international kilogram prototypes.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Idhar",
      hindiWord: "इधर (Idhar)",
      meaning: "Idhar (Here) from 'La Hafta Warna Re'"
    }
  },
  {
    z: 78, symbol: "Pt", name: "Platinum", atomicMass: 195.08, group: 10, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d⁹ 6s¹", shells: [2, 8, 18, 32, 17, 1],
    electronegativity: 2.28, atomicRadius: 177, ionizationEnergy: 870,
    meltingPoint: 2041.4, boilingPoint: 4098, density: 21.45,
    discoveryYear: 1735, discoverer: "Antonio de Ulloa",
    description: "Noble transition metal renowned for resistance to oxidation, high malleability, and indispensable chemical catalysis.",
    practicalUses: "Automotive catalytic converters, cisplatin anticancer chemotherapy, luxury wedding rings, hydrogen fuel cell electrodes.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Pitaai",
      hindiWord: "पिटाई (Pitaai)",
      meaning: "Pitaai (Beating) from 'La Hafta Warna Re'"
    }
  },
  {
    z: 79, symbol: "Au", name: "Gold", atomicMass: 196.97, group: 11, period: 6, block: "d",
    category: "transition-metal", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", shells: [2, 8, 18, 32, 18, 1],
    electronegativity: 2.54, atomicRadius: 174, ionizationEnergy: 890,
    meltingPoint: 1337.33, boilingPoint: 3129, density: 19.30,
    discoveryYear: -6000, discoverer: "Ancient Civilizations",
    description: "The most malleable and ductile metal known; a single gram can be beaten into a 1-square-meter leaf or a 2-kilometer wire.",
    practicalUses: "Global financial reserves and bullion, coronation jewelry, corrosion-free semiconductor bonding wires, astronaut visors.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Aur",
      hindiWord: "और (Aur)",
      meaning: "Aur (And) from 'La Hafta Warna Re'"
    }
  },
  {
    z: 80, symbol: "Hg", name: "Mercury", atomicMass: 200.59, group: 12, period: 6, block: "d",
    category: "transition-metal", standardState: "liquid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", shells: [2, 8, 18, 32, 18, 2],
    electronegativity: 2.00, atomicRadius: 171, ionizationEnergy: 1007,
    meltingPoint: 234.32, boilingPoint: 629.88, density: 13.534,
    discoveryYear: -1500, discoverer: "Ancient Civilizations",
    description: "Known to alchemists as 'quicksilver'; the only metallic chemical element that remains liquid at standard room conditions.",
    practicalUses: "Classical barometers and medical thermometers, fluorescent tube lighting, dental amalgams, gold mining extraction.",
    mnemonic: {
      groupTitle: "5d Transition Series (Period 6)",
      phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
      word: "Hogi",
      hindiWord: "होगी (Hogi)",
      meaning: "Hogi (Will happen) from 'La Hafta Warna Re'"
    }
  },
  {
    z: 81, symbol: "Tl", name: "Thallium", atomicMass: 204.38, group: 13, period: 6, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", shells: [2, 8, 18, 32, 18, 3],
    electronegativity: 1.62, atomicRadius: 156, ionizationEnergy: 589,
    meltingPoint: 577, boilingPoint: 1746, density: 11.85,
    discoveryYear: 1861, discoverer: "William Crookes",
    description: "Soft gray post-transition metal; highly toxic rat poison historically nicknamed 'The Poisoner's Poison' due to lack of taste or odor.",
    practicalUses: "Myocardial cardiac stress scintigraphy (Thallium-201), infrared optical lenses, low-melting specialty glasses.",
    mnemonic: {
      groupTitle: "Group 13: Boron Family",
      phrase: "Baingan Aloo Gajar In Thela",
      word: "Thela",
      hindiWord: "थैला (Thela)",
      meaning: "Thela (Bag) from 'Baingan Aloo Gajar In Thela'"
    }
  },
  {
    z: 82, symbol: "Pb", name: "Lead", atomicMass: 207.2, group: 14, period: 6, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", shells: [2, 8, 18, 32, 18, 4],
    electronegativity: 2.33, atomicRadius: 154, ionizationEnergy: 716,
    meltingPoint: 600.61, boilingPoint: 2022, density: 11.34,
    discoveryYear: -7000, discoverer: "Ancient Civilizations",
    description: "Heavy, malleable, dense toxic post-transition metal; excellent radiation shield for x-rays and gamma rays.",
    practicalUses: "Automobile lead-acid batteries, medical X-ray protective aprons, radiation shielding in nuclear plants, stained glass.",
    mnemonic: {
      groupTitle: "Group 14: Carbon Family",
      phrase: "Kahe Sita Ji Suno Prabhu",
      word: "Prabhu",
      hindiWord: "प्रभु (Prabhu)",
      meaning: "Prabhu (Lord) from 'Kahe Sita Ji Suno Prabhu'"
    }
  },
  {
    z: 83, symbol: "Bi", name: "Bismuth", atomicMass: 208.98, group: 15, period: 6, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", shells: [2, 8, 18, 32, 18, 5],
    electronegativity: 2.02, atomicRadius: 143, ionizationEnergy: 703,
    meltingPoint: 544.7, boilingPoint: 1837, density: 9.78,
    discoveryYear: 1753, discoverer: "Claude François Geoffroy",
    description: "Post-transition metal forming gorgeous iridescent stepped hopper crystals; non-toxic heavy metal with very long radioactive half-life.",
    practicalUses: "Pepto-Bismol stomach relief medication, automatic fire sprinkler fusible plugs, low-toxicity lead-free fishing sinkers.",
    mnemonic: {
      groupTitle: "Group 15: Nitrogen Family",
      phrase: "Nana Patekar Aishwarya Sab Bindaas",
      word: "Bindaas",
      hindiWord: "बिंदास (Bindaas / Bikaau)",
      meaning: "Bindaas (Carefree) from 'Nana Patekar Aishwarya Sab Bindaas'"
    }
  },
  {
    z: 84, symbol: "Po", name: "Polonium", atomicMass: 209, group: 16, period: 6, block: "p",
    category: "post-transition", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", shells: [2, 8, 18, 32, 18, 6],
    electronegativity: 2.0, atomicRadius: 135, ionizationEnergy: 812,
    meltingPoint: 527, boilingPoint: 1235, density: 9.196,
    discoveryYear: 1898, discoverer: "Marie Curie & Pierre Curie",
    description: "Extremely rare, intensely radioactive alpha emitter; named in honor of Marie Curie's native homeland Poland.",
    practicalUses: "Antistatic ionization brushes for photographic lenses, thermoelectric heat sources in early Soviet lunar rovers.",
    mnemonic: {
      groupTitle: "Group 16: Oxygen Family (Chalcogens)",
      phrase: "Oye Style Se TePo",
      word: "Po",
      hindiWord: "पो (Po)",
      meaning: "Po from 'Oye Style Se TePo'"
    }
  },
  {
    z: 85, symbol: "At", name: "Astatine", atomicMass: 210, group: 17, period: 6, block: "p",
    category: "halogen", standardState: "solid",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", shells: [2, 8, 18, 32, 18, 7],
    electronegativity: 2.2, atomicRadius: 127, ionizationEnergy: 890,
    meltingPoint: 575, boilingPoint: 610, density: 7,
    discoveryYear: 1940, discoverer: "Dale R. Corson, Kenneth Ross MacKenzie & Emilio Segrè",
    description: "Rarest naturally occurring element on Earth (less than 1 gram in entire crust at any instant); radioactive halogen.",
    practicalUses: "Targeted alpha-particle radionuclide therapy for destroying localized metastatic cancer tumors.",
    mnemonic: {
      groupTitle: "Group 17: Halogens",
      phrase: "Fir Kal Bahar Aayi Aunty",
      word: "Aunty",
      hindiWord: "आंटी (Aunty)",
      meaning: "Aunty from 'Fir Kal Bahar Aayi Aunty'"
    }
  },
  {
    z: 86, symbol: "Rn", name: "Radon", atomicMass: 222, group: 18, period: 6, block: "p",
    category: "noble-gas", standardState: "gas",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", shells: [2, 8, 18, 32, 18, 8],
    electronegativity: 2.2, atomicRadius: 120, ionizationEnergy: 1037,
    meltingPoint: 202, boilingPoint: 211.3, density: 0.00973,
    discoveryYear: 1900, discoverer: "Friedrich Ernst Dorn",
    description: "Dense radioactive noble gas formed by decay of radium; seeps through bedrock into basement foundations.",
    practicalUses: "Hydrological tracking of groundwater seepage, earthquake fault monitoring, historical cancer brachytherapy seeds.",
    mnemonic: {
      groupTitle: "Group 18: Noble Gases",
      phrase: "Heena Neena Aur Kareena X-ray Rangeen",
      word: "Rangeen",
      hindiWord: "रंगीन (Rangeen)",
      meaning: "Rangeen (Colorful) from 'Heena Neena Aur Kareena X-ray Rangeen'"
    }
  },

  // ==========================================
  // PERIOD 7
  // ==========================================
  {
    z: 87, symbol: "Fr", name: "Francium", atomicMass: 223, group: 1, period: 7, block: "s",
    category: "alkali-metal", standardState: "solid",
    electronConfiguration: "[Rn] 7s¹", shells: [2, 8, 18, 32, 18, 8, 1],
    electronegativity: 0.7, atomicRadius: 348, ionizationEnergy: 380,
    meltingPoint: 300, boilingPoint: 950, density: 2.48,
    discoveryYear: 1939, discoverer: "Marguerite Perey",
    description: "Extremely unstable radioactive alkali metal discovered at the Curie Institute; longest-lived isotope has half-life of 22 minutes.",
    practicalUses: "Laser cooling and magneto-optical trapping for fundamental atomic parity violation physics tests.",
    mnemonic: {
      groupTitle: "Group 1: Alkali Metals",
      phrase: "Helina Ki Rab Se Fariyad",
      word: "Fariyad",
      hindiWord: "फ़रियाद (Fariyad)",
      meaning: "Fariyad (Prayer) from 'Helina Ki Rab Se Fariyad'"
    }
  },
  {
    z: 88, symbol: "Ra", name: "Radium", atomicMass: 226, group: 2, period: 7, block: "s",
    category: "alkaline-earth", standardState: "solid",
    electronConfiguration: "[Rn] 7s²", shells: [2, 8, 18, 32, 18, 8, 2],
    electronegativity: 0.9, atomicRadius: 283, ionizationEnergy: 509,
    meltingPoint: 973, boilingPoint: 2010, density: 5.5,
    discoveryYear: 1898, discoverer: "Marie Curie & Pierre Curie",
    description: "Intensely radioactive alkaline earth metal that glows faint blue in darkness; famous for the historic 'Radium Girls'.",
    practicalUses: "Historic luminous glow-in-the-dark aircraft dials, targeted alpha therapy for prostate bone metastases ($^{223}Ra$).",
    mnemonic: {
      groupTitle: "Group 2: Alkaline Earth Metals",
      phrase: "Beta Mange Car Scooter Baap Raazi",
      word: "Raazi",
      hindiWord: "राज़ी (Raazi / Rona)",
      meaning: "Raazi (Agrees) from 'Beta Mange Car Scooter Baap Raazi'"
    }
  },
  {
    z: 89, symbol: "Ac", name: "Actinium", atomicMass: 227, group: 3, period: 7, block: "d",
    category: "actinide", standardState: "solid",
    electronConfiguration: "[Rn] 6d¹ 7s²", shells: [2, 8, 18, 32, 18, 9, 2],
    electronegativity: 1.1, atomicRadius: 260, ionizationEnergy: 499,
    meltingPoint: 1323, boilingPoint: 3473, density: 10.07,
    discoveryYear: 1899, discoverer: "André-Louis Debierne",
    description: "Silvery radioactive metal that glows with an eerie blue light due to intense self-irradiation ionizing surrounding air.",
    practicalUses: "Targeted Alpha Therapy ($TAT$) in oncology ($^{225}Ac$), neutron generator sources for geological testing.",
    mnemonic: {
      groupTitle: "6d Transition / Actinides",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Accha",
      hindiWord: "अच्छा (Accha)",
      meaning: "Accha (Good) from 'Accha R.D. Sharma'"
    }
  },
  {
    z: 90, symbol: "Th", name: "Thorium", atomicMass: 232.04, group: null, period: 7, block: "f",
    category: "actinide", standardState: "solid",
    electronConfiguration: "[Rn] 6d² 7s²", shells: [2, 8, 18, 32, 18, 10, 2],
    electronegativity: 1.3, atomicRadius: 237, ionizationEnergy: 587,
    meltingPoint: 2023, boilingPoint: 5061, density: 11.724,
    discoveryYear: 1829, discoverer: "Jöns Jacob Berzelius",
    description: "Abundant weakly radioactive actinide named after Thor, the Norse god of thunder; prime candidate for nuclear fuel cycles.",
    practicalUses: "Thorium molten salt nuclear reactors (LFTR), gas camping lantern mantles, high-temperature TIG welding electrodes.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Thode",
      hindiWord: "थोड़े (Thode)",
      meaning: "Thode (A few) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 91, symbol: "Pa", name: "Protactinium", atomicMass: 231.04, group: null, period: 7, block: "f",
    category: "actinide", standardState: "solid",
    electronConfiguration: "[Rn] 5f² 6d¹ 7s²", shells: [2, 8, 18, 32, 20, 9, 2],
    electronegativity: 1.5, atomicRadius: 243, ionizationEnergy: 568,
    meltingPoint: 1841, boilingPoint: 4300, density: 15.37,
    discoveryYear: 1913, discoverer: "Kasimir Fajans & Oswald Helmuth Göhring",
    description: "Dense, silvery-gray radioactive actinide element; intermediate stepping stone in the thorium-uranium-233 breeder fuel cycle.",
    practicalUses: "Ocean sediment dating and marine paleoceanographic analysis; fundamental heavy actinide research.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Pehelwan",
      hindiWord: "पहलवान (Pehelwan)",
      meaning: "Pehelwan (Wrestler) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 92, symbol: "U", name: "Uranium", atomicMass: 238.03, group: null, period: 7, block: "f",
    category: "actinide", standardState: "solid",
    electronConfiguration: "[Rn] 5f³ 6d¹ 7s²", shells: [2, 8, 18, 32, 21, 9, 2],
    electronegativity: 1.38, atomicRadius: 240, ionizationEnergy: 598,
    meltingPoint: 1405.3, boilingPoint: 4404, density: 19.1,
    discoveryYear: 1789, discoverer: "Martin Heinrich Klaproth",
    description: "Heavy naturally occurring actinide; isotope Uranium-235 undergoes neutron fission, powering commercial nuclear power plants.",
    practicalUses: "Commercial nuclear electricity generation, depleted uranium armor penetrators, historical Vaseline uranium glass.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Unse",
      hindiWord: "उनसे (Unse)",
      meaning: "Unse (From them) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 93, symbol: "Np", name: "Neptunium", atomicMass: 237, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f⁴ 6d¹ 7s²", shells: [2, 8, 18, 32, 22, 9, 2],
    electronegativity: 1.36, atomicRadius: 221, ionizationEnergy: 605,
    meltingPoint: 917, boilingPoint: 4273, density: 20.45,
    discoveryYear: 1940, discoverer: "Edwin McMillan & Philip H. Abelson",
    description: "First transuranic synthetic element; created by bombarding uranium with slow neutrons in the Berkeley cyclotron.",
    practicalUses: "Precursor material irradiated in nuclear reactors to synthesize Plutonium-238 space batteries.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Niptenge",
      hindiWord: "निपटेंगे (Niptenge)",
      meaning: "Niptenge (Will tackle) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 94, symbol: "Pu", name: "Plutonium", atomicMass: 244, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f⁶ 7s²", shells: [2, 8, 18, 32, 24, 8, 2],
    electronegativity: 1.28, atomicRadius: 243, ionizationEnergy: 585,
    meltingPoint: 912.5, boilingPoint: 3501, density: 19.816,
    discoveryYear: 1940, discoverer: "Glenn T. Seaborg, Edwin McMillan, Joseph W. Kennedy & Arthur Wahl",
    description: "Fissile actinide element; isotope Pu-238 powers the Voyager probes and Mars rovers via radioisotope thermoelectric generators.",
    practicalUses: "NASA deep-space radioisotope thermoelectric generators (RTGs on Curiosity & Perseverance), nuclear deterrence.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Puraane",
      hindiWord: "पुराने (Puraane)",
      meaning: "Puraane (Old) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 95, symbol: "Am", name: "Americium", atomicMass: 243, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f⁷ 7s²", shells: [2, 8, 18, 32, 25, 8, 2],
    electronegativity: 1.3, atomicRadius: 244, ionizationEnergy: 578,
    meltingPoint: 1449, boilingPoint: 2880, density: 12,
    discoveryYear: 1944, discoverer: "Glenn T. Seaborg, Ralph A. James, Leon O. Morgan & Albert Ghiorso",
    description: "Synthetic actinide; microscopic quantities of Americium-241 ionize smoke particles inside residential smoke detectors.",
    practicalUses: "Household ionization smoke detectors (saving thousands of lives worldwide each year), industrial thickness gauges.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Aam",
      hindiWord: "आम (Aam)",
      meaning: "Aam (Mango) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 96, symbol: "Cm", name: "Curium", atomicMass: 247, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f⁷ 6d¹ 7s²", shells: [2, 8, 18, 32, 25, 9, 2],
    electronegativity: 1.3, atomicRadius: 245, ionizationEnergy: 581,
    meltingPoint: 1613, boilingPoint: 3383, density: 13.51,
    discoveryYear: 1944, discoverer: "Glenn T. Seaborg, Ralph A. James & Albert Ghiorso",
    description: "Intensely radioactive actinide named in honor of Marie and Pierre Curie; strong alpha emitter generating intense thermal heat.",
    practicalUses: "Alpha Particle X-ray Spectrometer ($APXS$) payloads on NASA Mars rovers for geological rock analysis.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Kam",
      hindiWord: "कम (Kam)",
      meaning: "Kam (Less) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 97, symbol: "Bk", name: "Berkelium", atomicMass: 247, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f⁹ 7s²", shells: [2, 8, 18, 32, 27, 8, 2],
    electronegativity: 1.3, atomicRadius: 244, ionizationEnergy: 601,
    meltingPoint: 1259, boilingPoint: 2900, density: 14.78,
    discoveryYear: 1949, discoverer: "Stanley G. Thompson, Albert Ghiorso & Glenn T. Seaborg",
    description: "Synthetic actinide named after the city of Berkeley; synthesized by bombarding americium-241 with alpha particles.",
    practicalUses: "Target material bombarded with calcium-48 to synthesize element 117 (Tennessine) in particle colliders.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Bikenge",
      hindiWord: "बिकेंगे (Bikenge)",
      meaning: "Bikenge (Will sell) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 98, symbol: "Cf", name: "Californium", atomicMass: 251, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁰ 7s²", shells: [2, 8, 18, 32, 28, 8, 2],
    electronegativity: 1.3, atomicRadius: 245, ionizationEnergy: 608,
    meltingPoint: 1173, boilingPoint: 1743, density: 15.1,
    discoveryYear: 1950, discoverer: "Stanley G. Thompson, Kenneth Street Jr., Albert Ghiorso & Glenn T. Seaborg",
    description: "Potent neutron-emitting transuranic element; a single microgram emits 170 million spontaneous neutrons every minute.",
    practicalUses: "Airport luggage neutron inspection scanners, oil well geological logging, starting up newly built nuclear reactors.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Cafe",
      hindiWord: "कैफ़े (Cafe)",
      meaning: "Cafe from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 99, symbol: "Es", name: "Einsteinium", atomicMass: 252, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹¹ 7s²", shells: [2, 8, 18, 32, 29, 8, 2],
    electronegativity: 1.3, atomicRadius: 245, ionizationEnergy: 619,
    meltingPoint: 1133, boilingPoint: 1269, density: 8.84,
    discoveryYear: 1952, discoverer: "Albert Ghiorso & colleagues at UC Berkeley",
    description: "Named in honor of Albert Einstein; discovered in radioactive debris from the first thermonuclear hydrogen bomb test (Ivy Mike).",
    practicalUses: "Synthesis of heavier elements like Mendelevium; fundamental atomic actinide spectroscopy.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Aise",
      hindiWord: "ऐसे (Aise)",
      meaning: "Aise (Like this) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 100, symbol: "Fm", name: "Fermium", atomicMass: 257, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹² 7s²", shells: [2, 8, 18, 32, 30, 8, 2],
    electronegativity: 1.3, atomicRadius: 245, ionizationEnergy: 627,
    meltingPoint: 1800, boilingPoint: null, density: 9.7,
    discoveryYear: 1952, discoverer: "Albert Ghiorso & colleagues",
    description: "The heaviest element that can be synthesized by neutron capture; named after nuclear pioneer Enrico Fermi.",
    practicalUses: "Heavy element nuclear physics investigations and quantum chemistry validation.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Farmao",
      hindiWord: "फ़रमाओ (Farmao)",
      meaning: "Farmao (Command) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 101, symbol: "Md", name: "Mendelevium", atomicMass: 258, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹³ 7s²", shells: [2, 8, 18, 32, 31, 8, 2],
    electronegativity: 1.3, atomicRadius: 246, ionizationEnergy: 635,
    meltingPoint: 1100, boilingPoint: null, density: 10.3,
    discoveryYear: 1955, discoverer: "Albert Ghiorso, Bernard G. Harvey, Gregory R. Choppin, Stanley G. Thompson & Glenn T. Seaborg",
    description: "Named in honor of Dmitri Mendeleev, father of the Periodic Table; first element synthesized literally atom-by-atom.",
    practicalUses: "Exploration of heavy actinide electronic configurations and chemical oxidation states.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Madam",
      hindiWord: "मैडम (Madam)",
      meaning: "Madam from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 102, symbol: "No", name: "Nobelium", atomicMass: 259, group: null, period: 7, block: "f",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 7s²", shells: [2, 8, 18, 32, 32, 8, 2],
    electronegativity: 1.3, atomicRadius: 246, ionizationEnergy: 642,
    meltingPoint: 1100, boilingPoint: null, density: 9.9,
    discoveryYear: 1966, discoverer: "Joint Institute for Nuclear Research (JINR, Dubna)",
    description: "Synthetic actinide named after Alfred Nobel, inventor of dynamite and benefactor of the Nobel Prizes.",
    practicalUses: "Heavy element atomic shell studies; has an unusually stable divalent (+2) oxidation state.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Nasta",
      hindiWord: "नाश्ता (Nasta)",
      meaning: "Nasta (Breakfast) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 103, symbol: "Lr", name: "Lawrencium", atomicMass: 266, group: 3, period: 7, block: "d",
    category: "actinide", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 7s² 7p¹", shells: [2, 8, 18, 32, 32, 8, 3],
    electronegativity: 1.3, atomicRadius: 246, ionizationEnergy: 470,
    meltingPoint: 1900, boilingPoint: null, density: 14.4,
    discoveryYear: 1961, discoverer: "Albert Ghiorso, Almon Larsh, Robert M. Latimer & Cecil M. Sikkeland",
    description: "Final element in the actinide series; named after Ernest O. Lawrence, inventor of the cyclotron accelerator.",
    practicalUses: "Relativistic quantum chemistry validation; possesses an anomalous 7p valence electron.",
    mnemonic: {
      groupTitle: "Actinides (5f Series)",
      phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
      word: "Lao",
      hindiWord: "लाओ (Lao)",
      meaning: "Lao (Bring) from 'Thode Pehelwan Unse Niptenge'"
    }
  },
  {
    z: 104, symbol: "Rf", name: "Rutherfordium", atomicMass: 267, group: 4, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d² 7s²", shells: [2, 8, 18, 32, 32, 10, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: 580,
    meltingPoint: 2400, boilingPoint: 5800, density: 23.2,
    discoveryYear: 1969, discoverer: "Joint Institute for Nuclear Research & UC Berkeley",
    description: "First superheavy transactinide element; named in honor of nuclear physics pioneer Ernest Rutherford.",
    practicalUses: "Nuclear particle physics and relativistic electronic configuration research.",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "R.",
      hindiWord: "आर (R.D.)",
      meaning: "R from 'R.D. Sharma'"
    }
  },
  {
    z: 105, symbol: "Db", name: "Dubnium", atomicMass: 268, group: 5, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d³ 7s²", shells: [2, 8, 18, 32, 32, 11, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: null, density: 29.3,
    discoveryYear: 1970, discoverer: "Joint Institute for Nuclear Research & UC Berkeley",
    description: "Superheavy element named after the Russian nuclear research center city of Dubna.",
    practicalUses: "Heavy element chemical homology studies with Group 5 elements (Tantalum and Niobium).",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "D.",
      hindiWord: "डी (D.)",
      meaning: "D from 'R.D. Sharma'"
    }
  },
  {
    z: 106, symbol: "Sg", name: "Seaborgium", atomicMass: 269, group: 6, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d⁴ 7s²", shells: [2, 8, 18, 32, 32, 12, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: null, density: 35.0,
    discoveryYear: 1974, discoverer: "Lawrence Berkeley Laboratory",
    description: "Named after Nobel laureate Glenn T. Seaborg; first element named after a living person at the time of naming.",
    practicalUses: "Gas-phase chemical synthesis of hexacarbonyl complexes ($Sg(CO)_6$).",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Sharma",
      hindiWord: "शर्मा (Sharma)",
      meaning: "Sharma from 'R.D. Sharma'"
    }
  },
  {
    z: 107, symbol: "Bh", name: "Bohrium", atomicMass: 270, group: 7, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d⁵ 7s²", shells: [2, 8, 18, 32, 32, 13, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: null, density: 37.1,
    discoveryYear: 1981, discoverer: "GSI Helmholtz Centre for Heavy Ion Research (Darmstadt)",
    description: "Synthetic transition metal named in tribute to quantum model pioneer Niels Bohr.",
    practicalUses: "Gas-phase chromatography validation of Group 7 chemical periodicity.",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Book",
      hindiWord: "बुक (Book)",
      meaning: "Book from 'Accha R.D. Sharma Book'"
    }
  },
  {
    z: 108, symbol: "Hs", name: "Hassium", atomicMass: 269, group: 8, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d⁶ 7s²", shells: [2, 8, 18, 32, 32, 14, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: null, density: 40.7,
    discoveryYear: 1984, discoverer: "GSI Helmholtz Centre for Heavy Ion Research",
    description: "Synthetic element named after the German state of Hesse (Hassia in Latin); forms volatile tetroxide ($HsO_4$).",
    practicalUses: "Demonstration that relativistic electrons do not prevent predictable octavalent periodic behavior.",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Hote",
      hindiWord: "होते (Hote)",
      meaning: "Hote (Exists) from 'Accha R.D. Sharma Book Mein Hote'"
    }
  },
  {
    z: 109, symbol: "Mt", name: "Meitnerium", atomicMass: 278, group: 9, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d⁷ 7s²", shells: [2, 8, 18, 32, 32, 15, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: null, density: 37.4,
    discoveryYear: 1982, discoverer: "GSI Helmholtz Centre for Heavy Ion Research",
    description: "Named after Austrian physicist Lise Meitner, co-discoverer of nuclear fission; superheavy artificial metal.",
    practicalUses: "Frontier research into the limits of atomic stability and shell structure.",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Mt",
      hindiWord: "मैथ्स (Maths / Mt)",
      meaning: "Mt from 'Mt Ds Rg Cn'"
    }
  },
  {
    z: 110, symbol: "Ds", name: "Darmstadtium", atomicMass: 281, group: 10, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d⁸ 7s²", shells: [2, 8, 18, 32, 32, 16, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: null, density: 34.8,
    discoveryYear: 1994, discoverer: "GSI Helmholtz Centre for Heavy Ion Research",
    description: "Synthesized by fusing lead-208 and nickel-62; named after the German city of Darmstadt.",
    practicalUses: "Exploration of superheavy fusion cross-sections and radioactive decay chains.",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Ds",
      hindiWord: "दोस्त (Dost / Ds)",
      meaning: "Ds from 'Mt Ds Rg Cn'"
    }
  },
  {
    z: 111, symbol: "Rg", name: "Roentgenium", atomicMass: 282, group: 11, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d⁹ 7s²", shells: [2, 8, 18, 32, 32, 17, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: null, density: 28.7,
    discoveryYear: 1994, discoverer: "GSI Helmholtz Centre for Heavy Ion Research",
    description: "Group 11 superheavy congener of gold; named in honor of Wilhelm Conrad Röntgen, discoverer of X-rays.",
    practicalUses: "Relativistic electronic theory tests on group 11 coin metal trends.",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Rangila",
      hindiWord: "रंगीला (Rangila / Rg)",
      meaning: "Rg from 'Mt Ds Rg Cn'"
    }
  },
  {
    z: 112, symbol: "Cn", name: "Copernicium", atomicMass: 285, group: 12, period: 7, block: "d",
    category: "transition-metal", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s²", shells: [2, 8, 18, 32, 32, 18, 2],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: null, boilingPoint: 357, density: 23.7,
    discoveryYear: 1996, discoverer: "GSI Helmholtz Centre for Heavy Ion Research",
    description: "Named in tribute to Nicolaus Copernicus; predicted due to relativity to behave as a volatile noble-metal gas.",
    practicalUses: "Thermochemical adsorption tests investigating volatile relativistic metallic behavior.",
    mnemonic: {
      groupTitle: "6d Transition Series",
      phrase: "Accha R.D. Sharma Book Mein Hote Mt Ds Rg Cn",
      word: "Capsule",
      hindiWord: "कैप्सूल (Capsule / Cn)",
      meaning: "Cn from 'Mt Ds Rg Cn'"
    }
  },
  {
    z: 113, symbol: "Nh", name: "Nihonium", atomicMass: 286, group: 13, period: 7, block: "p",
    category: "post-transition", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", shells: [2, 8, 18, 32, 32, 18, 3],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: 700, boilingPoint: 1400, density: 16,
    discoveryYear: 2004, discoverer: "RIKEN (Japan)",
    description: "First chemical element discovered in Asia; named after Nihon (the Japanese name for Japan).",
    practicalUses: "Extending human understanding of p-block periodicity in superheavy elements.",
    mnemonic: {
      groupTitle: "Group 13: Boron Family",
      phrase: "Baingan Aloo Gajar In Thela (Nahi)",
      word: "Nahi",
      hindiWord: "नहीं (Nahi)",
      meaning: "Nahi (No) from 'Baingan Aloo Gajar In Thela (Nahi)'"
    }
  },
  {
    z: 114, symbol: "Fl", name: "Flerovium", atomicMass: 289, group: 14, period: 7, block: "p",
    category: "post-transition", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", shells: [2, 8, 18, 32, 32, 18, 4],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: 340, boilingPoint: 420, density: 14,
    discoveryYear: 1998, discoverer: "Joint Institute for Nuclear Research & Lawrence Livermore National Laboratory",
    description: "Superheavy element situated near the long-sought theoretical 'Island of Stability'; named after the Flerov Laboratory.",
    practicalUses: "Testing relativistic closed-shell spin-orbit stabilization effects.",
    mnemonic: {
      groupTitle: "Group 14: Carbon Family",
      phrase: "Kahe Sita Ji Suno Prabhu (Phool)",
      word: "Phool",
      hindiWord: "फूल (Phool)",
      meaning: "Phool (Flower) from 'Kahe Sita Ji Suno Prabhu'"
    }
  },
  {
    z: 115, symbol: "Mc", name: "Moscovium", atomicMass: 290, group: 15, period: 7, block: "p",
    category: "post-transition", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", shells: [2, 8, 18, 32, 32, 18, 5],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: 670, boilingPoint: 1400, density: 13.5,
    discoveryYear: 2003, discoverer: "Joint Institute for Nuclear Research & LLNL",
    description: "Extremely radioactive synthetic element named in honor of the ancient Russian Moscow Oblast region.",
    practicalUses: "Decay parent providing pathway to Nihonium-284 in beamline experiments.",
    mnemonic: {
      groupTitle: "Group 15: Nitrogen Family",
      phrase: "Nana Patekar Aishwarya Sab Bindaas (Masti)",
      word: "Masti",
      hindiWord: "मस्ती (Masti)",
      meaning: "Masti (Fun) from 'Nana Patekar Aishwarya Sab Bindaas'"
    }
  },
  {
    z: 116, symbol: "Lv", name: "Livermorium", atomicMass: 293, group: 16, period: 7, block: "p",
    category: "post-transition", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", shells: [2, 8, 18, 32, 32, 18, 6],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: 700, boilingPoint: 1100, density: 12.9,
    discoveryYear: 2000, discoverer: "Lawrence Livermore National Laboratory & JINR",
    description: "Synthetic heavy chalcogen congener named in tribute to Lawrence Livermore National Laboratory in California.",
    practicalUses: "Alpha decay chains shedding light on superheavy nucleus stability.",
    mnemonic: {
      groupTitle: "Group 16: Oxygen Family (Chalcogens)",
      phrase: "Oye Style Se TePo (Live)",
      word: "Live",
      hindiWord: "लाइव (Live)",
      meaning: "Live from 'Oye Style Se TePo'"
    }
  },
  {
    z: 117, symbol: "Ts", name: "Tennessine", atomicMass: 294, group: 17, period: 7, block: "p",
    category: "halogen", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", shells: [2, 8, 18, 32, 32, 18, 7],
    electronegativity: null, atomicRadius: null, ionizationEnergy: null,
    meltingPoint: 723, boilingPoint: 883, density: 7.2,
    discoveryYear: 2010, discoverer: "JINR, Oak Ridge National Laboratory & Vanderbilt University",
    description: "Second-heaviest known element; synthesized using a rare target of berkelium-249 produced in Tennessee.",
    practicalUses: "Investigating whether superheavy halogens transition into metallic or semiconductor states.",
    mnemonic: {
      groupTitle: "Group 17: Halogens",
      phrase: "Fir Kal Bahar Aayi Aunty (Tension)",
      word: "Tension",
      hindiWord: "टेंशन (Tension)",
      meaning: "Tension from 'Fir Kal Bahar Aayi Aunty'"
    }
  },
  {
    z: 118, symbol: "Og", name: "Oganesson", atomicMass: 294, group: 18, period: 7, block: "p",
    category: "noble-gas", standardState: "synthetic",
    electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", shells: [2, 8, 18, 32, 32, 18, 8],
    electronegativity: null, atomicRadius: 152, ionizationEnergy: 860,
    meltingPoint: 325, boilingPoint: 350, density: 5.0,
    discoveryYear: 2002, discoverer: "Joint Institute for Nuclear Research & LLNL",
    description: "The highest atomic number element verified to date; named after Russian nuclear physicist Yuri Oganessian.",
    practicalUses: "Theoretical studies showing electron 'smearing' into a uniform gas due to intense relativistic effects.",
    mnemonic: {
      groupTitle: "Group 18: Noble Gases",
      phrase: "Heena Neena Aur Kareena X-ray Rangeen (Oye Hero)",
      word: "Oye",
      hindiWord: "ओए (Oye Hero)",
      meaning: "Oye from 'Heena Neena Aur Kareena X-ray Rangeen'"
    }
  }
];

// ==========================================
// HINGLISH MNEMONICS CATALOG REFERENCE
// ==========================================
const MNEMONICS_CATALOG = [
  {
    id: "g1",
    title: "Group 1 (Alkali Metals)",
    phrase: "Helina Ki Rab Se Fariyad",
    hindiPhrase: "हेलीना की रब से फ़रियाद",
    meaning: "Helina's prayer to God",
    elements: [1, 3, 11, 19, 37, 55, 87],
    breakdown: [
      { z: 1, symbol: "H", word: "He (Helina)", hindi: "हे" },
      { z: 3, symbol: "Li", word: "Li (Helina)", hindi: "ली" },
      { z: 11, symbol: "Na", word: "Na (Helina)", hindi: "ना" },
      { z: 19, symbol: "K", word: "Ki", hindi: "की" },
      { z: 37, symbol: "Rb", word: "Rab", hindi: "रब" },
      { z: 55, symbol: "Cs", word: "Se", hindi: "से" },
      { z: 87, symbol: "Fr", word: "Fariyad", hindi: "फ़रियाद" }
    ]
  },
  {
    id: "g2",
    title: "Group 2 (Alkaline Earth Metals)",
    phrase: "Beta Mange Car Scooter Baap Raazi",
    hindiPhrase: "बेटा मांगे कार स्कूटर बाप राज़ी",
    meaning: "Son demands a car & scooter, Father agrees!",
    elements: [4, 12, 20, 38, 56, 88],
    breakdown: [
      { z: 4, symbol: "Be", word: "Beta", hindi: "बेटा" },
      { z: 12, symbol: "Mg", word: "Mange", hindi: "मांगे" },
      { z: 20, symbol: "Ca", word: "Car", hindi: "कार" },
      { z: 38, symbol: "Sr", word: "Scooter", hindi: "स्कूटर" },
      { z: 56, symbol: "Ba", word: "Baap", hindi: "बाप" },
      { z: 88, symbol: "Ra", word: "Raazi", hindi: "राज़ी" }
    ]
  },
  {
    id: "g13",
    title: "Group 13 (Boron Family)",
    phrase: "Baingan Aloo Gajar In Thela (Nahi)",
    hindiPhrase: "बैंगन आलू गाजर इन थैला (नहीं)",
    meaning: "Eggplant, Potato & Carrot inside the bag",
    elements: [5, 13, 31, 49, 81, 113],
    breakdown: [
      { z: 5, symbol: "B", word: "Baingan", hindi: "बैंगन" },
      { z: 13, symbol: "Al", word: "Aloo", hindi: "आलू" },
      { z: 31, symbol: "Ga", word: "Gajar", hindi: "गाजर" },
      { z: 49, symbol: "In", word: "In", hindi: "इन" },
      { z: 81, symbol: "Tl", word: "Thela", hindi: "थैला" },
      { z: 113, symbol: "Nh", word: "Nahi", hindi: "नहीं" }
    ]
  },
  {
    id: "g14",
    title: "Group 14 (Carbon Family)",
    phrase: "Kahe Sita Ji Suno Prabhu (Phool)",
    hindiPhrase: "कहे सीता जी सुनो प्रभु (फूल)",
    meaning: "Sita says: Listen O Lord!",
    elements: [6, 14, 32, 50, 82, 114],
    breakdown: [
      { z: 6, symbol: "C", word: "Kahe", hindi: "कहे" },
      { z: 14, symbol: "Si", word: "Sita", hindi: "सीता" },
      { z: 32, symbol: "Ge", word: "Ji", hindi: "जी" },
      { z: 50, symbol: "Sn", word: "Suno", hindi: "सुनो" },
      { z: 82, symbol: "Pb", word: "Prabhu", hindi: "प्रभु" },
      { z: 114, symbol: "Fl", word: "Phool", hindi: "फूल" }
    ]
  },
  {
    id: "g15",
    title: "Group 15 (Nitrogen Family)",
    phrase: "Nana Patekar Aishwarya Sab Bindaas (Masti)",
    hindiPhrase: "नाना पाटेकर ऐश्वर्या सब बिंदास (मस्ती)",
    meaning: "Nana Patekar & Aishwarya are all carefree!",
    elements: [7, 15, 33, 51, 83, 115],
    breakdown: [
      { z: 7, symbol: "N", word: "Nana", hindi: "नाना" },
      { z: 15, symbol: "P", word: "Patekar", hindi: "पाटेकर" },
      { z: 33, symbol: "As", word: "Aishwarya", hindi: "ऐश्वर्या" },
      { z: 51, symbol: "Sb", word: "Sab", hindi: "सब" },
      { z: 83, symbol: "Bi", word: "Bindaas", hindi: "बिंदास" },
      { z: 115, symbol: "Mc", word: "Masti", hindi: "मस्ती" }
    ]
  },
  {
    id: "g16",
    title: "Group 16 (Chalcogens / Oxygen Family)",
    phrase: "Oye Style Se TePo (Live)",
    hindiPhrase: "ओए स्टाइल से टीपो (लाइव)",
    meaning: "Copy (cheat in test) with style, live!",
    elements: [8, 16, 34, 52, 84, 116],
    breakdown: [
      { z: 8, symbol: "O", word: "Oye", hindi: "ओए" },
      { z: 16, symbol: "S", word: "Style", hindi: "स्टाइल" },
      { z: 34, symbol: "Se", word: "Se", hindi: "से" },
      { z: 52, symbol: "Te", word: "Te", hindi: "टी" },
      { z: 84, symbol: "Po", word: "Po", hindi: "पो" },
      { z: 116, symbol: "Lv", word: "Live", hindi: "लाइव" }
    ]
  },
  {
    id: "g17",
    title: "Group 17 (Halogens)",
    phrase: "Fir Kal Bahar Aayi Aunty (Tension)",
    hindiPhrase: "फिर कल बाहर आई आंटी (टेंशन)",
    meaning: "Aunty came outside again tomorrow!",
    elements: [9, 17, 35, 53, 85, 117],
    breakdown: [
      { z: 9, symbol: "F", word: "Fir", hindi: "फिर" },
      { z: 17, symbol: "Cl", word: "Kal", hindi: "कल" },
      { z: 35, symbol: "Br", word: "Bahar", hindi: "बाहर" },
      { z: 53, symbol: "I", word: "Aayi", hindi: "आई" },
      { z: 85, symbol: "At", word: "Aunty", hindi: "आंटी" },
      { z: 117, symbol: "Ts", word: "Tension", hindi: "टेंशन" }
    ]
  },
  {
    id: "g18",
    title: "Group 18 (Noble Gases)",
    phrase: "Heena Neena Aur Kareena X-ray Rangeen (Oye)",
    hindiPhrase: "हीना नीना और करीना एक्स-रे रंगीन (ओए)",
    meaning: "Heena, Neena and Kareena's colorful X-rays",
    elements: [2, 10, 18, 36, 54, 86, 118],
    breakdown: [
      { z: 2, symbol: "He", word: "Heena", hindi: "हीना" },
      { z: 10, symbol: "Ne", word: "Neena", hindi: "नीना" },
      { z: 18, symbol: "Ar", word: "Aur", hindi: "और" },
      { z: 36, symbol: "Kr", word: "Kareena", hindi: "करीना" },
      { z: 54, symbol: "Xe", word: "X-ray", hindi: "एक्स-रे" },
      { z: 86, symbol: "Rn", word: "Rangeen", hindi: "रंगीन" },
      { z: 118, symbol: "Og", word: "Oye", hindi: "ओए" }
    ]
  },
  {
    id: "d3",
    title: "3d Transition Series (Period 4)",
    phrase: "Science Teacher Vineeta Kriplani Man FENICU Zn",
    hindiPhrase: "साइंस टीचर विनीता कृपलानी मन फेको नी क्यूं जानेमन",
    meaning: "Science teacher Vineeta Kriplani, don't throw your heart away sweetheart!",
    elements: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    breakdown: [
      { z: 21, symbol: "Sc", word: "Science", hindi: "साइंस" },
      { z: 22, symbol: "Ti", word: "Teacher", hindi: "टीचर" },
      { z: 23, symbol: "V", word: "Vineeta", hindi: "विनीता" },
      { z: 24, symbol: "Cr", word: "Kriplani", hindi: "कृपलानी" },
      { z: 25, symbol: "Mn", word: "Man", hindi: "मन" },
      { z: 26, symbol: "Fe", word: "Fe (Feko)", hindi: "फे" },
      { z: 27, symbol: "Co", word: "Co", hindi: "को" },
      { z: 28, symbol: "Ni", word: "Ni", hindi: "नी" },
      { z: 29, symbol: "Cu", word: "Cu (Kyun)", hindi: "क्यूं" },
      { z: 30, symbol: "Zn", word: "Zn (Zaneman)", hindi: "जानेमन" }
    ]
  },
  {
    id: "d4",
    title: "4d Transition Series (Period 5)",
    phrase: "Yaari Zara Nibhana Maut Tak, Rukaawat Raah Mein Pade Aage Kood",
    hindiPhrase: "यारी ज़रा निभाना मौत तक, रुकावट राह में पड़े आगे कूद",
    meaning: "Keep friendship until death; if obstacles lie in your path, jump ahead!",
    elements: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    breakdown: [
      { z: 39, symbol: "Y", word: "Yaari", hindi: "यारी" },
      { z: 40, symbol: "Zr", word: "Zara", hindi: "ज़रा" },
      { z: 41, symbol: "Nb", word: "Nibhana", hindi: "निभाना" },
      { z: 42, symbol: "Mo", word: "Maut", hindi: "मौत" },
      { z: 43, symbol: "Tc", word: "Tak", hindi: "तक" },
      { z: 44, symbol: "Ru", word: "Rukaawat", hindi: "रुकावट" },
      { z: 45, symbol: "Rh", word: "Raah", hindi: "राह" },
      { z: 46, symbol: "Pd", word: "Pade", hindi: "पड़े" },
      { z: 47, symbol: "Ag", word: "Aage", hindi: "आगे" },
      { z: 48, symbol: "Cd", word: "Kood", hindi: "कूद" }
    ]
  },
  {
    id: "d5",
    title: "5d Transition Series (Period 6)",
    phrase: "La Hafta Warna Re, Usse Idhar Pitaai Aur Hogi",
    hindiPhrase: "ला हफ्ता वरना रे, उससे इधर पिटाई और होगी",
    meaning: "Pay extortion weekly, otherwise you'll get another beating right here!",
    elements: [57, 72, 73, 74, 75, 76, 77, 78, 79, 80],
    breakdown: [
      { z: 57, symbol: "La", word: "La", hindi: "ला" },
      { z: 72, symbol: "Hf", word: "Haf (Hafta)", hindi: "हफ्ता" },
      { z: 73, symbol: "Ta", word: "Ta", hindi: "ता" },
      { z: 74, symbol: "W", word: "Warna", hindi: "वरना" },
      { z: 75, symbol: "Re", word: "Re", hindi: "रे" },
      { z: 76, symbol: "Os", word: "Usse", hindi: "उससे" },
      { z: 77, symbol: "Ir", word: "Idhar", hindi: "इधर" },
      { z: 78, symbol: "Pt", word: "Pitaai", hindi: "पिटाई" },
      { z: 79, symbol: "Au", word: "Aur", hindi: "और" },
      { z: 80, symbol: "Hg", word: "Hogi", hindi: "होगी" }
    ]
  },
  {
    id: "f4",
    title: "Lanthanides (4f Series)",
    phrase: "Seene Par Nadiyaan Prem Ki Samayi, Yun Gad-gad Tab Dil Hua, Aur Tum Ab Laut Aaye",
    hindiPhrase: "सीने पर नदियां प्रेम की समाई, यूं गदगद तब दिल हुआ, और तुम अब लौट आए",
    meaning: "Rivers of love filled the chest, heart was delighted, and you returned at last!",
    elements: [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
    breakdown: [
      { z: 58, symbol: "Ce", word: "Seene", hindi: "सीने" },
      { z: 59, symbol: "Pr", word: "Par", hindi: "पर" },
      { z: 60, symbol: "Nd", word: "Nadiyaan", hindi: "नदियां" },
      { z: 61, symbol: "Pm", word: "Prem", hindi: "प्रेम" },
      { z: 62, symbol: "Sm", word: "Samayi", hindi: "समाई" },
      { z: 63, symbol: "Eu", word: "Yun", hindi: "यूं" },
      { z: 64, symbol: "Gd", word: "Gad-gad", hindi: "गदगद" },
      { z: 65, symbol: "Tb", word: "Tab", hindi: "तब" },
      { z: 66, symbol: "Dy", word: "Dil", hindi: "दिल" },
      { z: 67, symbol: "Ho", word: "Hua", hindi: "हुआ" },
      { z: 68, symbol: "Er", word: "Aur", hindi: "और" },
      { z: 69, symbol: "Tm", word: "Tum", hindi: "तुम" },
      { z: 70, symbol: "Yb", word: "Ab", hindi: "अब" },
      { z: 71, symbol: "Lu", word: "Laut", hindi: "लौट" }
    ]
  },
  {
    id: "f5",
    title: "Actinides (5f Series)",
    phrase: "Thode Pehelwan Unse Niptenge, Puraane Aam Kam Bikenge, Cafe Mein Aise Farmao, Madam Nasta Lao",
    hindiPhrase: "थोड़े पहलवान उनसे निपटेंगे, पुराने आम कम बिकेंगे, कैफ़े में ऐसे फ़रमाओ, मैडम नाश्ता लाओ",
    meaning: "A few wrestlers will handle them, old mangoes sell less, order in cafe: Madam bring breakfast!",
    elements: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103],
    breakdown: [
      { z: 90, symbol: "Th", word: "Thode", hindi: "थोड़े" },
      { z: 91, symbol: "Pa", word: "Pehelwan", hindi: "पहलवान" },
      { z: 92, symbol: "U", word: "Unse", hindi: "उनसे" },
      { z: 93, symbol: "Np", word: "Niptenge", hindi: "निपटेंगे" },
      { z: 94, symbol: "Pu", word: "Puraane", hindi: "पुराने" },
      { z: 95, symbol: "Am", word: "Aam", hindi: "आम" },
      { z: 96, symbol: "Cm", word: "Kam", hindi: "कम" },
      { z: 97, symbol: "Bk", word: "Bikenge", hindi: "बिकेंगे" },
      { z: 98, symbol: "Cf", word: "Cafe", hindi: "कैफ़े" },
      { z: 99, symbol: "Es", word: "Aise", hindi: "ऐसे" },
      { z: 100, symbol: "Fm", word: "Farmao", hindi: "फ़रमाओ" },
      { z: 101, symbol: "Md", word: "Madam", hindi: "मैडम" },
      { z: 102, symbol: "No", word: "Nasta", hindi: "नाश्ता" },
      { z: 103, symbol: "Lr", word: "Lao", hindi: "लाओ" }
    ]
  }
];

// Memory Trainer Quiz Questions Pool
const QUIZ_QUESTIONS = [
  {
    question: "In the famous Group 2 mnemonic 'Beta Mange Car Scooter Baap Raazi', which element represents 'Mange'?",
    options: ["Manganese (Mn)", "Magnesium (Mg)", "Mercury (Hg)", "Molybdenum (Mo)"],
    answerIndex: 1,
    explanation: "'Mange' stands for Magnesium (Mg, Z=12), the alkaline earth metal in Period 3!"
  },
  {
    question: "In the mnemonic 'Helina Ki Rab Se Fariyad', which element corresponds to 'Rab'?",
    options: ["Radium (Ra)", "Rubidium (Rb)", "Ruthenium (Ru)", "Rhenium (Re)"],
    answerIndex: 1,
    explanation: "'Rab' corresponds to Rubidium (Rb, Z=37), the alkali metal in Period 5."
  },
  {
    question: "Which chemical family uses the mnemonic 'Baingan Aloo Gajar In Thela'?",
    options: ["Group 1 (Alkali Metals)", "Group 2 (Alkaline Earth)", "Group 13 (Boron Family)", "Group 14 (Carbon Family)"],
    answerIndex: 2,
    explanation: "Group 13 (Boron Family: B, Al, Ga, In, Tl) is memorized using 'Baingan Aloo Gajar In Thela'."
  },
  {
    question: "In 'Beta Mange Car Scooter Baap Raazi', what element does 'Car' stand for?",
    options: ["Carbon (C)", "Calcium (Ca)", "Cadmium (Cd)", "Cerium (Ce)"],
    answerIndex: 1,
    explanation: "'Car' stands for Calcium (Ca, Z=20), the alkaline earth metal vital for bones and teeth!"
  },
  {
    question: "In Group 17 (Halogens) 'Fir Kal Bahar Aayi Aunty', which element represents 'Bahar'?",
    options: ["Barium (Ba)", "Bismuth (Bi)", "Boron (B)", "Bromine (Br)"],
    answerIndex: 3,
    explanation: "'Bahar' corresponds to Bromine (Br, Z=35), the only nonmetallic liquid at room temperature."
  },
  {
    question: "In 'Heena Neena Aur Kareena X-ray Rangeen', which element corresponds to 'Kareena'?",
    options: ["Potassium (K)", "Krypton (Kr)", "Carbon (C)", "Calcium (Ca)"],
    answerIndex: 1,
    explanation: "'Kareena' stands for Krypton (Kr, Z=36), the Period 4 noble gas."
  },
  {
    question: "In the 3d transition series mnemonic 'Science Teacher Vineeta...', which element is 'Vineeta'?",
    options: ["Vanadium (V)", "Iron (Fe)", "Tungsten (W)", "Yttrium (Y)"],
    answerIndex: 0,
    explanation: "'Vineeta' represents Vanadium (V, Z=23), element 23 used in high-strength tools."
  },
  {
    question: "In 'Kahe Sita Ji Suno Prabhu', what element corresponds to 'Suno'?",
    options: ["Silicon (Si)", "Tin (Sn)", "Sulfur (S)", "Scandium (Sc)"],
    answerIndex: 1,
    explanation: "'Suno' corresponds to Tin (Sn, from Latin Stannum, Z=50)."
  },
  {
    question: "In 'Nana Patekar Aishwarya Sab Bindaas', what element is 'Patekar'?",
    options: ["Potassium (K)", "Lead (Pb)", "Phosphorus (P)", "Platinum (Pt)"],
    answerIndex: 2,
    explanation: "'Patekar' stands for Phosphorus (P, Z=15), crucial for DNA and ATP energy."
  },
  {
    question: "In Group 16 'Oye Style Se TePo', which element is 'Style'?",
    options: ["Silicon (Si)", "Sulfur (S)", "Selenium (Se)", "Strontium (Sr)"],
    answerIndex: 1,
    explanation: "'Style' stands for Sulfur (S, Z=16), yellow nonmetal used in vulcanizing rubber."
  }
];

// Helper to find element by Z or Symbol
function getElement(zOrSymbol) {
  if (typeof zOrSymbol === "number") {
    return ELEMENTS_DATA.find(el => el.z === zOrSymbol) || null;
  }
  const clean = String(zOrSymbol).trim().toLowerCase();
  return ELEMENTS_DATA.find(el => el.symbol.toLowerCase() === clean || el.name.toLowerCase() === clean) || null;
}
