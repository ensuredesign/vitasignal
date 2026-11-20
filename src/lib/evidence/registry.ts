export interface EvidenceSource {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  summary: string;
  applicableRules: string[];
  reviewStatus: 'approved_for_prototype' | 'pending_clinical_advisory';
}

export const EVIDENCE_REGISTRY: Record<string, EvidenceSource> = {
  C1: {
    id: "C1",
    title: "Guideline for prevention, diagnosis and treatment of infertility",
    publisher: "World Health Organization (WHO)",
    year: "2025",
    url: "https://www.who.int/publications/i/item/9789240115774",
    summary: "Recognizes male factor infertility as a major global preventive and clinical concern, emphasizing early evaluation, lifestyle factors, and collaborative investigation without diagnostic delay or blame.",
    applicableRules: ["FERT-01", "PCP-01", "EDU-01"],
    reviewStatus: "approved_for_prototype",
  },
  C2: {
    id: "C2",
    title: "Diagnosis and Treatment of Infertility in Men: AUA/ASRM Guideline Part I",
    publisher: "American Urological Association (AUA) / American Society for Reproductive Medicine (ASRM)",
    year: "2020 / 2024",
    url: "https://www.asrm.org/practice-guidance/practice-committee-documents/diagnosis-and-treatment-of-infertility-in-men-auaasrm-guideline-part-i-2020/",
    summary: "Recommends reproductive evaluation for men presenting with pregnancy delay or identifiable risk factors including cryptorchidism, gonadotoxic exposure, testicular surgery, or abnormal semen analysis.",
    applicableRules: ["SPEC-01", "FERT-01", "PCP-01", "EDU-01"],
    reviewStatus: "approved_for_prototype",
  },
  C3: {
    id: "C3",
    title: "EAU Guidelines on Sexual and Reproductive Health: Male Infertility",
    publisher: "European Association of Urology (EAU)",
    year: "2024",
    url: "https://uroweb.org/guidelines/sexual-and-reproductive-health/chapter/male-infertility",
    summary: "Comprehensive clinical pathway detailing when urological/andrological assessment is warranted for anatomical, metabolic, endocrine, or genetic risk factors.",
    applicableRules: ["SPEC-01", "FERT-01", "PCP-01", "EDU-01"],
    reviewStatus: "approved_for_prototype",
  },
  C4: {
    id: "C4",
    title: "Testicle Pain & Urgent Symptoms",
    publisher: "National Health Service (NHS UK)",
    year: "2024",
    url: "https://www.nhs.uk/symptoms/testicle-pain/",
    summary: "Immediate emergency triage guidance: sudden severe testicular pain, especially when accompanied by nausea or vomiting, requires immediate emergency evaluation to rule out testicular torsion.",
    applicableRules: ["SAFE-01", "SAFE-02"],
    reviewStatus: "approved_for_prototype",
  },
  C5: {
    id: "C5",
    title: "Testicle Lumps and Swellings",
    publisher: "National Health Service (NHS UK)",
    year: "2024",
    url: "https://www.nhs.uk/symptoms/testicle-lumps-and-swellings/",
    summary: "Advises prompt professional urological evaluation for any new lump or swelling in the testicles or scrotum to distinguish benign causes from conditions requiring urgent clinical investigation.",
    applicableRules: ["SPEC-01"],
    reviewStatus: "approved_for_prototype",
  },
};
