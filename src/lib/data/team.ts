/**
 * The academy's real teaching team — one list, used by the About page and the
 * homepage "Our teachers" section. `translationIndex` points at the matching
 * entry of `aboutPage.team` in the message files (role + description).
 */
export const TEAM_MEMBERS = [
  { id: 1, name: "Professor Muhammad Tahir Hasni", image: "/Our Team/Muhammad_Tahir_Hasni.jpg", whatsapp: "923478599839", translationIndex: 0 },
  { id: 2, name: "Mufti Muhammad Rafeeq Golarwi", image: "/Our Team/Mufti_Muhammad_Rafeeq_Golarwi.jpeg", whatsapp: "923212485198", translationIndex: 1 },
  { id: 3, name: "Mufti Owais Ahmed", image: "/Our Team/Mufti_Owais_Ahmed.png", whatsapp: "923218035236", translationIndex: 2 },
  { id: 4, name: "Sheikh Abdul Jabbar", image: "/Our Team/Sheikh Abdul Jabbar.jpeg", whatsapp: "923152363498", translationIndex: 3 },
  { id: 5, name: "Maulana Ali Haider", image: "/Our Team/Maulana Ali Haider.jpeg", whatsapp: "923476676147", translationIndex: 4 },
  { id: 6, name: "Qari Muhammad Musheer", image: "/Our Team/Qari Muhammad Musheer.jpg", whatsapp: "923269244960", translationIndex: 5 },
  { id: 7, name: "Qari Muhammad Ismail Hasni", image: "/Our Team/Qari Muhammad Ismail Hasni.jpeg", whatsapp: "923453184434", translationIndex: 6 },
  { id: 8, name: "Ustaza Fatima Al-Zahra", image: "/Our Team/Ustaza Fatima Al-Zahra.jpg", whatsapp: "923042043314", translationIndex: 7 },
] as const;
