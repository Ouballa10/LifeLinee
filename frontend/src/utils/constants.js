export const STORAGE_KEYS = {
  authSession: "lifeline.auth.session",
  appState: "lifeline.app.state",
};

export const ROUTES = {
  splash: "/",
  login: "/login",
  register: "/register",
  home: "/home",
  dashboard: "/dashboard",
  profile: "/profile",
  editProfile: "/profile/edit",
  medicalForm: "/profile/medical",
  qr: "/qr",
  scanner: "/scanner",
  emergency: "/emergency",
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const DEFAULT_PROFILE = {
  fullName: "Abdelmounaim Ouballa",
  email: "abdel10@gmail.com",
  phone: "06 12 34 56 78",
  city: "Oujda",
  bloodType: "O+",
  allergies: "Penicilline",
  conditions: "Diabete type 2",
  medications: "Metformine",
  emergencyContact: "Sofia Ghazali - 0612345678",
  criticalInstructions:
    "Consignes: eviter les retards de traitement et verifier la glycemie rapidement.",
  notes: "Consignes: eviter les retards de traitement et verifier la glycemie rapidement.",
  qrToken: "ll_demo_token",
  emergencyId: "ll_demo_token",
};

export const QUICK_ACTIONS = [
  {
    title: "Generer QR",
    description: "Afficher votre code d'urgence et le partager rapidement.",
    route: ROUTES.qr,
  },
  {
    title: "Scanner QR",
    description: "Simuler la lecture d'un QR medical depuis le mobile.",
    route: ROUTES.scanner,
  },
  {
    title: "Profil medical",
    description: "Mettre a jour allergies, traitements et contact d'urgence.",
    route: ROUTES.medicalForm,
  },
];

export const EMERGENCY_STEPS = [
  "Verifier le groupe sanguin et les allergies.",
  "Contacter le proche et le medecin referent.",
  "Consulter le QR pour la fiche medicale rapide.",
];
