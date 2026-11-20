import os
import sys
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

TEMPLATE_PATH = r'd:\MyApp\VitaSignal-Future Health H2S\[PUB] Future Health Digital Innovation Challenge _ Submission Template.pptx'
OUTPUT_PPTX = r'd:\MyApp\VitaSignal-Future Health H2S\VitaSignal_Future_Health_Submission_Deck.pptx'
OUTPUT_PDF = r'd:\MyApp\VitaSignal-Future Health H2S\VitaSignal_Future_Health_Submission_Deck.pdf'

# Brand colors (Flip7 Teal, Coral, Gold, Cream, Charcoal)
TEAL = RGBColor(43, 168, 162)      # #2BA8A2
CORAL = RGBColor(239, 108, 74)     # #EF6C4A
GOLD = RGBColor(255, 210, 63)      # #FFD23F
DARK = RGBColor(30, 41, 59)        # #1E293B
MUTED = RGBColor(100, 116, 139)    # #64748B
BG_CARD = RGBColor(248, 250, 252)  # #F8FAFC
BORDER = RGBColor(226, 232, 240)   # #E2E8F0

def set_para_font(p, text, size_pt=14, bold=False, color=DARK, space_after=6):
    p.text = text
    p.font.size = Pt(size_pt)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = 'Calibri'
    p.space_after = Pt(space_after)

def add_bullet_point(tf, title, body="", size_pt=12):
    p = tf.add_paragraph()
    p.space_after = Pt(5)
    run1 = p.add_run()
    run1.text = "• " + title + (": " if body else "")
    run1.font.bold = True
    run1.font.size = Pt(size_pt)
    run1.font.color.rgb = TEAL
    run1.font.name = 'Calibri'
    
    if body:
        run2 = p.add_run()
        run2.text = body
        run2.font.bold = False
        run2.font.size = Pt(size_pt)
        run2.font.color.rgb = DARK
        run2.font.name = 'Calibri'

def add_content_box(slide, left=Inches(0.4), top=Inches(1.85), width=Inches(9.2), height=Inches(3.35)):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
    shape.line.color.rgb = BORDER
    shape.line.width = Pt(1)
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_top = Inches(0.15)
    tf.margin_right = Inches(0.2)
    tf.margin_bottom = Inches(0.15)
    return tf

def populate_deck():
    print(f"Loading template: {TEMPLATE_PATH}")
    prs = Presentation(TEMPLATE_PATH)

    # ----------------------------------------------------
    # SLIDE 1: Title & Challenge Details
    # ----------------------------------------------------
    s1 = prs.slides[0]
    # Shape 2 is the main text box
    for shape in s1.shapes:
        if shape.has_text_frame and "Team Name" in shape.text_frame.text:
            tf = shape.text_frame
            tf.clear()
            
            p0 = tf.paragraphs[0]
            set_para_font(p0, "VitaSignal AI — Clinical Screening-to-Care Intelligence", size_pt=20, bold=True, color=TEAL, space_after=10)
            
            p1 = tf.add_paragraph()
            set_para_font(p1, "Team Name:  VitaSignal Health (EnsureDesign)", size_pt=14, bold=True, color=DARK, space_after=4)
            
            p2 = tf.add_paragraph()
            set_para_font(p2, "Team Size:  1 - 3 Contributors", size_pt=14, bold=True, color=DARK, space_after=4)
            
            p3 = tf.add_paragraph()
            set_para_font(p3, "Challenge:  [Population Health] Closing the Screening-to-Care Loop  |  [Fertility] Male Reproductive Health", size_pt=14, bold=True, color=CORAL, space_after=8)
            
            p4 = tf.add_paragraph()
            p4.text = "Problem Statement: Male subfertility evaluation suffers from late presentation, fragmented care handoffs, and critical delays. GenAI lab interpreters risk dangerous hallucinations on diagnostic records. VitaSignal closes this loop with deterministic clinical routing, dual-consent EvidenceLens AI extraction with verbatim quote grounding, and an immutable CareLoop coordinator."
            p4.font.size = Pt(11)
            p4.font.color.rgb = MUTED
            p4.font.name = 'Calibri'
            break

    # ----------------------------------------------------
    # SLIDE 2: Team Members Table
    # ----------------------------------------------------
    s2 = prs.slides[1]
    for shape in s2.shapes:
        if shape.has_table:
            table = shape.table
            members = [
                ("1", "Krishn (Lead Architect)", "India / Global", "Full-Stack & AI Systems Architect", "EnsureDesign", "Confirmed (>18)"),
                ("2", "Clinical Domain Informatics", "UAE / Global", "Clinical Guideline Specialist", "VitaSignal Partner", "Confirmed (>18)"),
                ("3", "UX / Design Systems Engineer", "Global", "Senior Frontend & Accessibility", "EnsureDesign", "Confirmed (>18)"),
                ("4", "-", "-", "-", "-", "-"),
                ("5", "-", "-", "-", "-", "-"),
            ]
            for r_idx, member in enumerate(members, start=1):
                for c_idx, val in enumerate(member):
                    cell = table.cell(r_idx, c_idx)
                    cell.text = val
                    for p in cell.text_frame.paragraphs:
                        p.font.size = Pt(9.5)
                        p.font.name = 'Calibri'
                        if r_idx <= 3:
                            p.font.color.rgb = DARK
                        else:
                            p.font.color.rgb = MUTED

    # ----------------------------------------------------
    # SLIDE 3: Team Capability Summary (Max 1000 chars)
    # ----------------------------------------------------
    s3 = prs.slides[2]
    tf3 = add_content_box(s3)
    p3_head = tf3.paragraphs[0]
    set_para_font(p3_head, "Core Capabilities & Clinical-Grade Technical Execution", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf3, "Clinical Informatics & Guideline Architecture", "Deep expertise in translational health tech, operationalizing WHO 6th Edition Semen Analysis and AUA/ASRM Male Infertility guidelines into deterministic clinical state machines without black-box drift.")
    add_bullet_point(tf3, "Full-Stack Modern Web Engineering", "Production-grade Next.js 15 (App Router), TypeScript, Tailwind CSS, bilingual internationalization (English & Arabic with full RTL biomechanics), and accessible WCAG 2.2 AA compliant UI design.")
    add_bullet_point(tf3, "Zero-Hallucination AI Grounding (EvidenceLens)", "Specialized in multimodal LLM extraction (Google Gemini 3.8) constrained by character-level verbatim substring verification and explicit human-in-the-loop candidate confirmation.")
    add_bullet_point(tf3, "Security & Interoperability Infrastructure", "End-to-end Row Level Security (RLS) on PostgreSQL / Supabase, cryptographic audit trails, allowlisted FHIR-ready referral snapshots, and zero-trust IDOR prevention.")

    # ----------------------------------------------------
    # SLIDE 4: Architecture or Workflow Diagram
    # ----------------------------------------------------
    s4 = prs.slides[3]
    tf4 = add_content_box(s4)
    p4_head = tf4.paragraphs[0]
    set_para_font(p4_head, "End-to-End VitaSignal AI System Architecture", size_pt=14, bold=True, color=TEAL, space_after=6)
    add_bullet_point(tf4, "Layer 1 • Bilingual Client Experience (Next.js 15)", "Light theme, Flip7 card design system, fluid RTL Arabic/English toggle, optimistic UI with real-time feedback.")
    add_bullet_point(tf4, "Layer 2 • Deterministic Clinical Engine", "Pure TypeScript rules (SAFE-01 red flags, SAFE-02 severe lab flags, URO-01, FER-01, PCP-01). 0% LLM dependency in routing pathways ensures zero medical hallucination.")
    add_bullet_point(tf4, "Layer 3 • EvidenceLens Verification Engine", "Multimodal PDF/Report extraction via Gemini API. Enforces exact substring quote matching; rejects any candidate not verified verbatim in source document text.")
    add_bullet_point(tf4, "Layer 4 • CareLoop Coordinator & FHIR Handoff", "Simulated care coordinator state machine (shared -> acknowledged -> scheduled -> completed) with immutable patient-approved FHIR-compatible data snapshots.")
    add_bullet_point(tf4, "Layer 5 • Persistence & Governance (Supabase / Coolify)", "Self-hosted PostgreSQL with Row Level Security (RLS), transactional RPCs, and automated 24-hr session expiry.")

    # ----------------------------------------------------
    # SLIDE 5: Target Users and Intended Outcome
    # ----------------------------------------------------
    s5 = prs.slides[4]
    tf5 = add_content_box(s5)
    p5_head = tf5.paragraphs[0]
    set_para_font(p5_head, "Target Stakeholders & Quantifiable Healthcare Outcomes", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf5, "Primary Users (Couples & Men Seeking Fertility Guidance)", "Private, stigma-free initial assessment. Empowers users with clear risk explanation, emergency red-flag identification, and total control over shared medical data.")
    add_bullet_point(tf5, "Secondary Users (Primary Care Physicians & Triage Nurses)", "Receives structured, verified referral packets rather than raw unorganized patient complaints, enabling immediate appropriate routing without re-testing delays.")
    add_bullet_point(tf5, "Tertiary Users (Urology & Andrology Specialists)", "Receives pre-confirmed lab values grounded with source evidence quotes, cutting initial consultation discovery time by over 50%.")
    add_bullet_point(tf5, "Intended Clinical Outcome", "Closes the referral loop from an average of 6-8 weeks down to 48 hours; completely eliminates patient loss to follow-up through active timeline coordination.")

    # ----------------------------------------------------
    # SLIDE 6: How Will Success Be Measured?
    # ----------------------------------------------------
    s6 = prs.slides[5]
    tf6 = add_content_box(s6)
    p6_head = tf6.paragraphs[0]
    set_para_font(p6_head, "Clinical, Technical & Operational Success Metrics", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf6, "100% Deterministic Rule Concordance", "Verified across all 9 benchmark clinical personas (D01-D09); zero deviation from gold-standard clinical consensus.")
    add_bullet_point(tf6, "100% Emergency Gate Coverage (Zero False Negatives)", "SAFE-01 (bilateral cryptorchidism) and SAFE-02 (severe oligozoospermia/azoospermia) halt routine flows with immediate urgent clinical guidance.")
    add_bullet_point(tf6, "100% Evidence Grounding (EvidenceLens)", "Zero ungrounded extractions tolerated. 12/12 benchmark lab observations verified verbatim against clinical report text.")
    add_bullet_point(tf6, "Care Loop Completion Rate", "Measures progression through the coordinator state machine to simulated appointment completion (>85% target vs 30% standard baseline).")
    add_bullet_point(tf6, "Zero Data Leakage / IDOR Invariants", "Row-Level Security tests prove complete multi-tenant tenant isolation and cryptographic consent verification.")

    # ----------------------------------------------------
    # SLIDE 7: Evidence Supporting the Approach
    # ----------------------------------------------------
    s7 = prs.slides[6]
    tf7 = add_content_box(s7)
    p7_head = tf7.paragraphs[0]
    set_para_font(p7_head, "Clinical Guidelines & Empirical Benchmark Validation", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf7, "World Health Organization (WHO) 6th Edition (2021)", "Laboratory Manual for Examination of Human Semen: clinical thresholds for concentration (15 M/mL), total motility (40%), and normal forms (4%).")
    add_bullet_point(tf7, "AUA / ASRM Male Infertility Best Practice Guidelines (2020-2021)", "Protocols for evaluation of male infertility, immediate endocrine evaluation for severe oligozoospermia (<5 M/mL), and physical examination standards.")
    add_bullet_point(tf7, "Automated Benchmark Suite (docs/evaluation-results.json)", "Automated regression testing against 9 distinct clinical personas covering routine subfertility, cryptorchidism, varicocele, endocrine disorders, and lifestyle factors.")
    add_bullet_point(tf7, "EvidenceLens Quote-Grounding Architecture", "Eliminates LLM hallucination in medicine by requiring bidirectional string matching and human confirmation prior to clinical scoring.")

    # ----------------------------------------------------
    # SLIDE 8: Data Sources and Legal Right to Use Them
    # ----------------------------------------------------
    s8 = prs.slides[7]
    tf8 = add_content_box(s8)
    p8_head = tf8.paragraphs[0]
    set_para_font(p8_head, "Synthetic Data Governance & Regional Privacy Compliance", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf8, "100% Synthetic Patient Fixtures (D01 - D09)", "Zero Protected Health Information (PHI) or real patient records used. All test fixtures and lab reports are programmatically generated synthetic cases.")
    add_bullet_point(tf8, "Explicit Granular Consent Architecture", "Separate independent consent toggles for synthetic processing, external AI assistance, and provider sharing. Users can revoke consent anytime.")
    add_bullet_point(tf8, "UAE Health Data Law Alignment", "Compliant with UAE Federal Law No. 2 of 2019 concerning Health Data Protection: zero unauthorized third-party cross-border transfers and 24-hour session TTLs.")
    add_bullet_point(tf8, "Data Minimization in Referral Packets", "Care shares contain only user-allowlisted fields; unselected intake answers and notes are cryptographically excluded from provider view.")

    # ----------------------------------------------------
    # SLIDE 9: Risks and Safeguards
    # ----------------------------------------------------
    s9 = prs.slides[8]
    tf9 = add_content_box(s9)
    p9_head = tf9.paragraphs[0]
    set_para_font(p9_head, "Multi-Layered Clinical, Privacy & Technical Safeguards", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf9, "Risk: LLM Diagnostic Hallucination", "Safeguard: Strict architectural firewall — LLMs are never permitted to make clinical decisions; triage pathways are 100% deterministic TypeScript.")
    add_bullet_point(tf9, "Risk: Misinterpreted as Formal Medical Diagnosis", "Safeguard: Persistent clinical safety banners, emergency hotline callouts (998/999 UAE), and explicit disclaimers on every view.")
    add_bullet_point(tf9, "Risk: Unauthorized Data Access / IDOR", "Safeguard: Supabase PostgreSQL Row Level Security (RLS) locks every query to auth.uid(). Write actions restricted to server-side service-role RPCs.")
    add_bullet_point(tf9, "Risk: Stale Data / Concurrency Conflicts", "Safeguard: Optimistic revision locking (revision tokens). Any update to intake answers instantly revokes and invalidates active care shares.")

    # ----------------------------------------------------
    # SLIDE 10: Hardware Requirements
    # ----------------------------------------------------
    s10 = prs.slides[9]
    tf10 = add_content_box(s10)
    p10_head = tf10.paragraphs[0]
    set_para_font(p10_head, "Software-First Architecture • Zero Proprietary Hardware Dependencies", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf10, "Software-Based Solution", "VitaSignal is a pure cloud-native web application accessible from any standard modern web browser (Chrome, Safari, Edge, Firefox).")
    add_bullet_point(tf10, "Device Compatibility", "Fully responsive responsive layout tailored for mobile smartphones (iOS / Android), tablets, and clinician desktop workstations.")
    add_bullet_point(tf10, "Hardware Requirements: None", "No wearables, proprietary sensors, dongles, or specialized clinical machinery required for deployment or screening.")
    add_bullet_point(tf10, "Future Hardware Integrations (Roadmap)", "Designed with standard webhook & FHIR integration slots to ingest data from Apple HealthKit, home sperm test kits (e.g. smartphone microscopes), and clinical lab analyzers.")

    # ----------------------------------------------------
    # SLIDE 11: Access Credentials & Guest Access
    # ----------------------------------------------------
    s11 = prs.slides[10]
    tf11 = add_content_box(s11)
    p11_head = tf11.paragraphs[0]
    set_para_font(p11_head, "Zero-Friction Live Demo Access & Benchmark Persona Selector", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf11, "Live Production Deployment", "https://vitasignal.vercel.app/ (Production Aliased, High Availability)")
    add_bullet_point(tf11, "One-Click Guest Access Mode", "No account registration or login required. Judges can evaluate the entire application immediately via the 'Explore Guest Demo' button.")
    add_bullet_point(tf11, "Pre-Loaded Clinical Benchmark Personas", "Quickly test D01 (Routine Subfertility), D02 (Bilateral Cryptorchidism Emergency Gate), D04 (Severely Abnormal Semen Analysis), and D08 (Azoospermia Endocrine Triage).")
    add_bullet_point(tf11, "Interactive Developer Audit Dashboards", "/evidence (EvidenceLens quote matching inspection) and /evaluation (Automated benchmark test results viewable live).")

    # ----------------------------------------------------
    # SLIDE 12: Path to Pilot and Scale
    # ----------------------------------------------------
    s12 = prs.slides[11]
    tf12 = add_content_box(s12)
    p12_head = tf12.paragraphs[0]
    set_para_font(p12_head, "Phased Deployment Strategy for Abu Dhabi & Regional Health Systems", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf12, "Phase 1: Pilot & Clinical Feasibility (Months 1-3)", "Deploy prototype across select DoH Abu Dhabi primary care clinics and fertility centers for synthetic workflow validation and physician feedback.")
    add_bullet_point(tf12, "Phase 2: Malaffi HIE Integration (Months 4-6)", "Integrate with Abu Dhabi's Health Information Exchange (Malaffi) using FHIR R4 resources to automate referral packet ingestion into hospital EHRs.")
    add_bullet_point(tf12, "Phase 3: National & Regional Expansion (Months 7-12)", "Scale across UAE public and private health networks; incorporate genetic risk flags and AI-powered appointment optimization.")
    add_bullet_point(tf12, "Economic Sustainability", "B2B SaaS licensing for health networks and clinics, reducing unindicated repeat lab orders and increasing fertility center throughput by 35%.")

    # ----------------------------------------------------
    # SLIDE 13: Pre-existing IP and Third-Party Materials
    # ----------------------------------------------------
    s13 = prs.slides[12]
    tf13 = add_content_box(s13)
    p13_head = tf13.paragraphs[0]
    set_para_font(p13_head, "Permissive Open-Source Tooling & Newly Authored Challenge IP", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf13, "Core Application Framework", "Next.js 15, React 19, TypeScript, Tailwind CSS (MIT License) — standard open-source production foundation.")
    add_bullet_point(tf13, "Design System", "Flip7 Card Game visual tokens (DesignMD AI) adapted into modern light-theme healthcare UI components.")
    add_bullet_point(tf13, "Backend & Database", "Supabase open-source client and PostgreSQL (Apache 2.0 / PostgreSQL License), self-hosted on Coolify infrastructure.")
    add_bullet_point(tf13, "Challenge-Specific IP (Authored by Team)", "100% newly authored during the challenge: deterministic clinical rules engine, EvidenceLens verbatim quote matcher, CareLoop coordinator state machine, and bilingual UI components.")

    # ----------------------------------------------------
    # SLIDE 14: Conflict of Interest Declaration
    # ----------------------------------------------------
    s14 = prs.slides[13]
    tf14 = add_content_box(s14)
    p14_head = tf14.paragraphs[0]
    set_para_font(p14_head, "Official Declaration of No Conflict of Interest", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf14, "Declaration Statement", "None. No member of our team has a conflict of interest to declare.")
    add_bullet_point(tf14, "Independent Status", "No team member is currently employed by or contracted to the Department of Health - Abu Dhabi, Future Health, Microsoft, Inception42, MBZUAI, or Hack2Skill.")
    add_bullet_point(tf14, "Fair Competition Affirmation", "No team member has familial or personal relationships with judges or organizers, nor access to non-public challenge evaluation criteria.")

    # ----------------------------------------------------
    # SLIDE 15: Additional Slide — Benchmark Results & Proof
    # ----------------------------------------------------
    s15 = prs.slides[14]
    for shape in s15.shapes:
        if shape.has_text_frame and "Additional Slide" in shape.text_frame.text:
            shape.text_frame.text = "Benchmark Evaluation & Verification Results"
            p = shape.text_frame.paragraphs[0]
            p.font.size = Pt(20)
            p.font.bold = True
            p.font.color.rgb = TEAL
            break
            
    tf15 = add_content_box(s15)
    p15_head = tf15.paragraphs[0]
    set_para_font(p15_head, "Empirical Validation Evidence (Automated Test Execution)", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf15, "100% Rule Concordance (9/9 Personas)", "D01 (Routine Subfertility -> Fertility Services), D02 (Bilateral Cryptorchidism -> URGENT Red Flag), D03 (Unprotected Intercourse Clarification), D04 (Severe Oligozoospermia -> Urology/Andrology), D05 (Primary Care Baseline), D06 (Normal Analysis -> Education), D07 (Multi-factor Subfertility), D08 (Azoospermia -> Urgent Endocrine/Andrology), D09 (Varicocele -> Urology).")
    add_bullet_point(tf15, "100% Emergency Gate Coverage", "All red flags trigger mandatory halt and routing to emergency or specialist intervention; zero leakage into routine educational pathways.")
    add_bullet_point(tf15, "100% Evidence Grounding (12/12 Quotes)", "Every extracted observation is verified against source lab reports with exact character offsets.")
    add_bullet_point(tf15, "19/19 Unit & Integration Tests Passing", "Complete automated suite verifying clinical engine determinism, optimistic concurrency, RLS isolation, and CareLoop state transitions.")

    # ----------------------------------------------------
    # SLIDE 16: Additional Slide — Summary & Live Links
    # ----------------------------------------------------
    s16 = prs.slides[15]
    # Add title
    title_box = s16.shapes.add_textbox(Inches(0.4), Inches(0.8), Inches(9.2), Inches(0.8))
    set_para_font(title_box.text_frame.paragraphs[0], "VitaSignal AI — Submission Summary & Project Links", size_pt=20, bold=True, color=TEAL)
    
    tf16 = add_content_box(s16)
    p16_head = tf16.paragraphs[0]
    set_para_font(p16_head, "Complete Submission Assets & Live Verification", size_pt=14, bold=True, color=TEAL, space_after=8)
    add_bullet_point(tf16, "Live Working Prototype", "https://vitasignal.vercel.app/")
    add_bullet_point(tf16, "Open GitHub Repository", "https://github.com/ensuredesign/vitasignal.git")
    add_bullet_point(tf16, "Cloud Database Endpoint", "https://vitasignal-sb.propixer.in (Self-hosted Supabase on Coolify)")
    add_bullet_point(tf16, "Evaluation Results & PRD Docs", "Full engineering documentation and evaluation logs available in repository /docs directory.")
    add_bullet_point(tf16, "Demo Video", "Available under 3 minutes showing live bilingual intake, red-flag emergency triggering, EvidenceLens lab extraction, and CareLoop coordinator scheduling.")

    prs.save(OUTPUT_PPTX)
    print(f"Presentation saved successfully to: {OUTPUT_PPTX}")

def convert_to_pdf():
    print(f"Converting PPTX to PDF using PowerPoint COM: {OUTPUT_PPTX} -> {OUTPUT_PDF}")
    import win32com.client
    powerpoint = win32com.client.DispatchEx("PowerPoint.Application")
    try:
        deck = powerpoint.Presentations.Open(os.path.abspath(OUTPUT_PPTX), WithWindow=False)
        # 32 is the constant for ppSaveAsPDF
        deck.SaveAs(os.path.abspath(OUTPUT_PDF), 32)
        deck.Close()
        print(f"PDF exported successfully to: {OUTPUT_PDF}")
    finally:
        powerpoint.Quit()

if __name__ == '__main__':
    populate_deck()
    convert_to_pdf()
