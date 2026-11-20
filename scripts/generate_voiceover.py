import os
import contextlib
import wave
import win32com.client

os.makedirs('scratch/audio', exist_ok=True)

# Tightened, high-impact narration scripts (Target: ~2 mins 25 secs)
SCENES = [
    {
        "id": "scene1",
        "title": "Introduction & Bilingual Accessibility",
        "text": (
            "Welcome to VitaSignal AI, an intelligent clinical screening to care platform built for the Future Health Innovation Challenge. "
            "In male reproductive health, couples often face six to eight weeks of delay before reaching specialized care. "
            "VitaSignal closes this loop with deterministic clinical safety, AI lab extraction, and patient-controlled care coordination. "
            "Built with the Flip7 light-theme design system, VitaSignal features fluid bilingual accessibility, "
            "switching seamlessly between English and authentic Right-to-Left Arabic with culturally sensitive clinical guidance."
        )
    },
    {
        "id": "scene2",
        "title": "Deterministic Safety Routing & Emergency Gate",
        "text": (
            "Generative AI hallucinations pose serious risks in digital health. "
            "VitaSignal eliminates this with a one hundred percent deterministic clinical decision-support engine. "
            "LLMs have zero authority over medical triage pathways. "
            "In Scenario D02, a patient presents with bilateral undescended testes. "
            "Upon submission, rule SAFE-01 instantly triggers an emergency halt, providing direct access to regional emergency hotlines "
            "and immediate specialist referral, ensuring critical patient safety."
        )
    },
    {
        "id": "scene3",
        "title": "EvidenceLens AI Lab Extraction with Quote Grounding",
        "text": (
            "For routine evaluations, patients frequently struggle with complex laboratory reports. "
            "VitaSignal introduces EvidenceLens, an AI-assisted diagnostic extraction engine powered by Google Gemini. "
            "In Scenario D01, the user uploads their semen analysis report. "
            "EvidenceLens enforces strict verbatim substring verification. "
            "Every extracted parameter—including sperm concentration, total motility, and morphology—is verified with exact character-level offsets. "
            "Zero ungrounded assertions are allowed. "
            "The patient reviews each verified observation with complete transparency before confirming it into their assessment."
        )
    },
    {
        "id": "scene4",
        "title": "Patient-Controlled CareLoop Coordinator",
        "text": (
            "Once routed into the specialized Fertility Services pathway, VitaSignal activates the CareLoop Coordinator to eliminate patient drop-off. "
            "Patients maintain total autonomy through granular allowlisting, choosing exactly which lab values and answers to share. "
            "An immutable, FHIR-compatible referral packet is generated with a twenty-four hour expiration token. "
            "The simulated coordinator timeline then coordinates the patient handoff across four real-time milestones: "
            "shared, acknowledged, scheduled, and completed, closing the care loop in under forty-eight hours."
        )
    },
    {
        "id": "scene5",
        "title": "Clinical Benchmark Proof & Conclusion",
        "text": (
            "VitaSignal is backed by a self-hosted Supabase PostgreSQL database on Coolify, enforcing Row Level Security and cryptographic audit trails. "
            "Our automated benchmark evaluation against nine clinical personas proves one hundred percent rule concordance, "
            "one hundred percent emergency gate coverage, and one hundred percent evidence quote grounding. "
            "VitaSignal AI bridges the gap between patient screening and clinical care, delivering safer, faster male reproductive health."
        )
    }
]

def generate_audio():
    speaker = win32com.client.Dispatch('SAPI.SpVoice')
    speaker.Voice = speaker.GetVoices().Item(1) # Zira
    speaker.Rate = 1 # Slightly more energetic, clear cadence
    speaker.Volume = 100

    timing_info = []

    for item in SCENES:
        wav_path = os.path.abspath(f"scratch/audio/{item['id']}.wav")
        stream = win32com.client.Dispatch('SAPI.SpFileStream')
        stream.Open(wav_path, 3) # SSFMCreateForWrite
        speaker.AudioOutputStream = stream
        speaker.Speak(item['text'])
        stream.Close()

        with contextlib.closing(wave.open(wav_path, 'r')) as f:
            frames = f.getnframes()
            rate = f.getframerate()
            duration = frames / float(rate)

        timing_info.append({
            "id": item["id"],
            "title": item["title"],
            "duration": duration,
            "path": wav_path
        })
        print(f"Generated {item['id']}: {duration:.2f}s - {item['title']}")

    total_duration = sum(t["duration"] for t in timing_info)
    print(f"\nTotal Voiceover Duration: {total_duration:.2f}s ({total_duration/60:.2f} minutes)")

    # Create concat list for ffmpeg
    concat_list_path = os.path.abspath("scratch/audio/concat_list.txt")
    with open(concat_list_path, "w") as f:
        for t in timing_info:
            clean_path = t["path"].replace("\\", "/")
            f.write(f"file '{clean_path}'\n")

    full_audio_path = os.path.abspath("scratch/audio/full_voiceover.wav")
    os.system(f'ffmpeg -y -f concat -safe 0 -i "{concat_list_path}" -c copy "{full_audio_path}"')
    print(f"Full combined voiceover created at: {full_audio_path}")

    return timing_info

if __name__ == "__main__":
    generate_audio()
