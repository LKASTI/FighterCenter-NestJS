export const SF6_CHARACTERS = [
    'Akuma', 'Blanka', 'Cammy', 'Chun-Li', 'C. Viper', 'Dee Jay', 'Dhalsim',
    'E. Honda', 'Ed', 'Elena', 'Guile', 'Juri', 'Ken', 'Kimberly',
    'Lily', 'Luke', 'M. Bison', 'Mai', 'Manon', 'Marisa', 'Rashid',
    'Ryu', 'Sagat', 'Terry', 'Zangief', 'JP', 'A.K.I.', 'Random'
] as const;

export type SF6Character = typeof SF6_CHARACTERS[number];
