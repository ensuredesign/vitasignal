import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ultra-smooth native mouse wheel scrolling simulating natural human pacing
async function smoothScrollWheel(page: any, deltaY: number, steps: number = 25, delayMs: number = 40) {
  const stepDelta = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDelta);
    await sleep(delayMs);
  }
  await sleep(400);
}

async function recordSmoothDemo() {
  const outputDir = path.resolve("./recordings_smooth");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clear previous recordings in folder
  for (const f of fs.readdirSync(outputDir)) {
    if (f.endsWith(".webm")) {
      try {
        fs.unlinkSync(path.join(outputDir, f));
      } catch (_) {}
    }
  }

  // Use local production server for 0-latency, 60fps rock-solid recording
  const targetUrl = process.env.DEMO_URL || "http://localhost:3001";
  console.log(`Starting ultra-smooth 1080p demo recording against ${targetUrl}...`);

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  try {
    // =========================================================================
    // SCENE 1: Introduction & Bilingual RTL Accessibility (~31.6s)
    // =========================================================================
    console.log("Scene 1: Introduction & Bilingual Accessibility (Target: ~31.6s)...");
    await page.goto(`${targetUrl}/`, { waitUntil: "networkidle" });
    await sleep(4000);

    // Smooth scroll down to highlight value cards
    await smoothScrollWheel(page, 450, 30, 45);
    await sleep(3000);

    // Smooth scroll back up to hero
    await smoothScrollWheel(page, -450, 25, 40);
    await sleep(2500);

    // Toggle to Arabic (showcase RTL layout)
    const arabicBtn = page.locator("button:has-text('العربية')").first();
    if (await arabicBtn.isVisible()) {
      console.log("  Switching to Arabic RTL...");
      await arabicBtn.click();
      await sleep(3500);

      // Smooth scroll in Arabic RTL
      await smoothScrollWheel(page, 400, 30, 45);
      await sleep(3000);
      await smoothScrollWheel(page, -400, 25, 40);
      await sleep(2000);

      // Switch back to English
      const engBtn = page.locator("button:has-text('English')").first();
      if (await engBtn.isVisible()) {
        await engBtn.click();
        await sleep(3500);
      }
    } else {
      await sleep(10000);
    }

    // =========================================================================
    // SCENE 2: Deterministic Safety Routing & Emergency Gate (~29.2s)
    // =========================================================================
    console.log("Scene 2: Deterministic Safety & Emergency Gate SAFE-01 (Target: ~29.2s)...");
    await page.goto(`${targetUrl}/demo`, { waitUntil: "networkidle" });
    await sleep(3000);

    // Click on Scenario D02 (Bilateral Cryptorchidism)
    const d02Card = page.locator("button:has-text('D02'), div:has-text('D02')").first();
    if (await d02Card.isVisible()) {
      console.log("  Selecting D02 Emergency persona...");
      await d02Card.click();
      await sleep(2000);
    }

    // Launch Demo Session
    const startBtn = page.locator("button:has-text('Start Demo Session'), button:has-text('Launch')").first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await sleep(3500);
    } else {
      await page.goto(`${targetUrl}/assessment`, { waitUntil: "networkidle" });
      await sleep(2500);
    }

    // Smooth scroll through intake questions
    await smoothScrollWheel(page, 400, 30, 45);
    await sleep(3000);

    // Click Evaluate Clinical Pathway
    const evalBtn = page.locator("button:has-text('Evaluate Clinical Pathway'), button:has-text('Evaluate')").first();
    if (await evalBtn.isVisible()) {
      console.log("  Evaluating D02...");
      await evalBtn.click();
      await sleep(4000);
    }

    // Scroll up smoothly to showcase Urgent Halt Emergency Banner
    await smoothScrollWheel(page, -400, 25, 40);
    await sleep(8500); // Linger on red-flag guidance and 998/999 hotline

    // =========================================================================
    // SCENE 3: EvidenceLens AI Lab Extraction with Quote Grounding (~36.8s)
    // =========================================================================
    console.log("Scene 3: EvidenceLens AI Lab Extraction (Target: ~36.8s)...");
    await page.goto(`${targetUrl}/demo`, { waitUntil: "networkidle" });
    await sleep(2500);

    // Select D01
    const d01Card = page.locator("button:has-text('D01'), div:has-text('D01')").first();
    if (await d01Card.isVisible()) {
      console.log("  Selecting D01 Routine Subfertility persona...");
      await d01Card.click();
      await sleep(2000);
    }

    const startD01 = page.locator("button:has-text('Start Demo Session'), button:has-text('Launch')").first();
    if (await startD01.isVisible()) {
      await startD01.click();
      await sleep(3000);
    }

    // Navigate to EvidenceLens
    await page.goto(`${targetUrl}/evidence`, { waitUntil: "networkidle" });
    await sleep(3500);

    // Show source lab report text
    await smoothScrollWheel(page, 350, 25, 45);
    await sleep(3500);

    // Click Analyze & Extract Report
    const extractBtn = page.locator("button:has-text('Analyze & Extract Report'), button:has-text('Extract')").first();
    if (await extractBtn.isVisible()) {
      console.log("  Extracting semen analysis report...");
      await extractBtn.click();
      await sleep(5000);
    }

    // Smooth scroll down to highlight verified quotes
    await smoothScrollWheel(page, 550, 35, 45);
    await sleep(7000);

    // Click Confirm Observations
    const confirmBtn = page.locator("button:has-text('Confirm Observations'), button:has-text('Apply to Assessment')").first();
    if (await confirmBtn.isVisible()) {
      console.log("  Confirming observations into assessment...");
      await confirmBtn.click();
      await sleep(4000);
    }
    await sleep(3500);

    // =========================================================================
    // SCENE 4: Patient-Controlled CareLoop Coordinator (~31.9s)
    // =========================================================================
    console.log("Scene 4: CareLoop Coordinator & Privacy Sharing (Target: ~31.9s)...");
    await page.goto(`${targetUrl}/assessment`, { waitUntil: "networkidle" });
    await sleep(3000);

    // Evaluate D01 into Fertility Services
    const reEvalBtn = page.locator("button:has-text('Evaluate Clinical Pathway'), button:has-text('Evaluate')").first();
    if (await reEvalBtn.isVisible()) {
      await reEvalBtn.click();
      await sleep(3500);
    }

    // Navigate to Care Coordinator
    await page.goto(`${targetUrl}/care`, { waitUntil: "networkidle" });
    await sleep(3500);

    // Show allowlist toggles
    await smoothScrollWheel(page, 300, 25, 45);
    await sleep(3000);

    // Generate Share / Referral Packet
    const shareBtn = page.locator("button:has-text('Generate Care Share Packet'), button:has-text('Create Share')").first();
    if (await shareBtn.isVisible()) {
      console.log("  Generating Care Share Packet...");
      await shareBtn.click();
      await sleep(3500);
    }

    // Advance timeline state machine (shared -> acknowledged -> scheduled -> completed)
    const advanceBtn = page.locator("button:has-text('Simulate Next Status'), button:has-text('Acknowledge'), button:has-text('Schedule')").first();
    if (await advanceBtn.isVisible()) {
      console.log("  Simulating coordinator milestones...");
      await advanceBtn.click();
      await sleep(3000);
      if (await advanceBtn.isVisible()) {
        await advanceBtn.click();
        await sleep(3000);
      }
    }
    await smoothScrollWheel(page, 450, 30, 45);
    await sleep(4500);

    // =========================================================================
    // SCENE 5: Clinical Benchmark Proof & Conclusion (~27.1s)
    // =========================================================================
    console.log("Scene 5: Evaluation Dashboard & Engineering Proof (Target: ~27.1s)...");
    await page.goto(`${targetUrl}/evaluation`, { waitUntil: "networkidle" });
    await sleep(4500);

    // Scroll down to showcase 9 personas
    await smoothScrollWheel(page, 450, 30, 45);
    await sleep(5500);
    await smoothScrollWheel(page, 750, 30, 45);
    await sleep(5500);

    // Scroll back to top hero
    await smoothScrollWheel(page, -1200, 40, 40);
    await sleep(5000);

    console.log("Visual recording complete!");
  } catch (err) {
    console.error("Recording error:", err);
  } finally {
    await context.close();
    await browser.close();
  }

  // Find generated webm
  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith(".webm"));
  if (files.length === 0) {
    throw new Error("No webm video found in output directory");
  }

  files.sort((a, b) => {
    return fs.statSync(path.join(outputDir, b)).mtime.getTime() - fs.statSync(path.join(outputDir, a)).mtime.getTime();
  });

  const latestWebm = path.join(outputDir, files[0]);
  const audioWav = path.resolve("./scratch/audio/full_voiceover.wav");
  const finalMp4 = path.resolve("./vitasignal_demo_under_3min.mp4");

  console.log(`Muxing ${latestWebm} with voiceover ${audioWav} into ${finalMp4}...`);
  try {
    // Mux video and voiceover, encode with high quality H.264 & AAC
    execSync(
      `ffmpeg -y -i "${latestWebm}" -i "${audioWav}" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -movflags +faststart "${finalMp4}"`,
      { stdio: "inherit" }
    );
    console.log(`Demo video created successfully: ${finalMp4}`);
    const stat = fs.statSync(finalMp4);
    console.log(`Final MP4 size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (e) {
    console.error("FFmpeg muxing failed:", e);
  }
}

recordSmoothDemo().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
