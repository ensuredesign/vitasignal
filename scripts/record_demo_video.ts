import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordDemo() {
  const outputDir = path.resolve("./recordings");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const targetUrl = process.env.DEMO_URL || "https://vitasignal.vercel.app";
  console.log(`Starting automated video recording of ${targetUrl}...`);

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // SCENE 1: Landing Page & Bilingual RTL Mechanics (0:00 - 0:25)
    // -------------------------------------------------------------------------
    console.log("Scene 1: Landing Page & Flip7 Design System...");
    await page.goto(`${targetUrl}/`, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(2500);

    // Scroll smoothly to showcase key value cards
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
    await sleep(2000);
    await page.evaluate(() => window.scrollBy({ top: -400, behavior: "smooth" }));
    await sleep(1500);

    // Switch to Arabic (Showcase RTL & localization)
    const arabicBtn = page.locator("button:has-text('العربية')").first();
    if (await arabicBtn.isVisible()) {
      console.log("Toggling to Arabic RTL...");
      await arabicBtn.click();
      await sleep(2500);
      // Switch back to English for remainder of evaluation walkthrough
      const engBtn = page.locator("button:has-text('English')").first();
      if (await engBtn.isVisible()) {
        await engBtn.click();
        await sleep(1500);
      }
    }

    // -------------------------------------------------------------------------
    // SCENE 2: Emergency Gate SAFE-01 Trigger (0:25 - 0:55)
    // -------------------------------------------------------------------------
    console.log("Scene 2: Emergency Gate D02 (Bilateral Cryptorchidism)...");
    await page.goto(`${targetUrl}/demo`, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(2000);

    // Click on Scenario D02 (Emergency Gate)
    const d02Card = page.locator("button:has-text('D02'), div:has-text('D02')").first();
    if (await d02Card.isVisible()) {
      await d02Card.click();
      await sleep(1500);
    }

    // Click Start Demo
    const startBtn = page.locator("button:has-text('Start Demo Session'), button:has-text('Launch')").first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await sleep(2500);
    } else {
      await page.goto(`${targetUrl}/assessment`, { waitUntil: "networkidle" });
      await sleep(2000);
    }

    // Scroll through assessment
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
    await sleep(2000);

    // Click Evaluate Clinical Pathway
    const evalBtn = page.locator("button:has-text('Evaluate Clinical Pathway'), button:has-text('Evaluate')").first();
    if (await evalBtn.isVisible()) {
      console.log("Evaluating D02...");
      await evalBtn.click();
      await sleep(3500);
    }

    // Linger on Urgent Halt Banner (SAFE-01 red flag callout & 998/999 hotline)
    await page.evaluate(() => window.scrollBy({ top: -200, behavior: "smooth" }));
    await sleep(3500);

    // -------------------------------------------------------------------------
    // SCENE 3: EvidenceLens AI Lab Extraction (0:55 - 1:40)
    // -------------------------------------------------------------------------
    console.log("Scene 3: EvidenceLens Multimodal Lab Extraction (D01)...");
    await page.goto(`${targetUrl}/demo`, { waitUntil: "networkidle" });
    await sleep(1500);

    const d01Card = page.locator("button:has-text('D01'), div:has-text('D01')").first();
    if (await d01Card.isVisible()) {
      await d01Card.click();
      await sleep(1500);
    }

    const startD01 = page.locator("button:has-text('Start Demo Session'), button:has-text('Launch')").first();
    if (await startD01.isVisible()) {
      await startD01.click();
      await sleep(2000);
    }

    // Navigate to EvidenceLens
    await page.goto(`${targetUrl}/evidence`, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(2500);

    // Show source lab report text
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await sleep(2000);

    // Click Analyze & Extract Report
    const extractBtn = page.locator("button:has-text('Analyze & Extract Report'), button:has-text('Extract')").first();
    if (await extractBtn.isVisible()) {
      console.log("Running EvidenceLens extraction...");
      await extractBtn.click();
      await sleep(4000);
    }

    // Show extracted observations and verbatim quote verification
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
    await sleep(3000);

    // Confirm candidate observations
    const confirmBtn = page.locator("button:has-text('Confirm Observations'), button:has-text('Apply to Assessment')").first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await sleep(2500);
    }

    // -------------------------------------------------------------------------
    // SCENE 4: CareLoop Referral Coordinator (1:40 - 2:15)
    // -------------------------------------------------------------------------
    console.log("Scene 4: CareLoop Coordinator & Granular Privacy Sharing...");
    await page.goto(`${targetUrl}/assessment`, { waitUntil: "networkidle" });
    await sleep(1500);

    const reEvalBtn = page.locator("button:has-text('Evaluate Clinical Pathway'), button:has-text('Evaluate')").first();
    if (await reEvalBtn.isVisible()) {
      await reEvalBtn.click();
      await sleep(2500);
    }

    await page.goto(`${targetUrl}/care`, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(2500);

    // Show allowlist toggles
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await sleep(2000);

    // Generate Share / Referral Packet
    const shareBtn = page.locator("button:has-text('Generate Care Share Packet'), button:has-text('Create Share')").first();
    if (await shareBtn.isVisible()) {
      console.log("Creating Care Share...");
      await shareBtn.click();
      await sleep(2500);
    }

    // Advance timeline state machine (shared -> acknowledged -> simulated_scheduled -> simulated_completed)
    const advanceBtn = page.locator("button:has-text('Simulate Next Status'), button:has-text('Acknowledge'), button:has-text('Schedule')").first();
    if (await advanceBtn.isVisible()) {
      console.log("Advancing Coordinator state machine...");
      await advanceBtn.click();
      await sleep(2000);
      if (await advanceBtn.isVisible()) {
        await advanceBtn.click();
        await sleep(2000);
      }
    }

    await sleep(2500);

    // -------------------------------------------------------------------------
    // SCENE 5: Evaluation Dashboard & Engineering Proof (2:15 - 2:40)
    // -------------------------------------------------------------------------
    console.log("Scene 5: Evaluation Dashboard (100% Concordance)...");
    await page.goto(`${targetUrl}/evaluation`, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(3000);

    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
    await sleep(3000);
    await page.evaluate(() => window.scrollBy({ top: -350, behavior: "smooth" }));
    await sleep(2000);

    console.log("Recording complete!");
  } catch (err) {
    console.error("Recording encountered an error:", err);
  } finally {
    await context.close();
    await browser.close();
  }

  // Find the generated webm video
  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith(".webm"));
  if (files.length === 0) {
    throw new Error("No webm video found in output directory");
  }

  // Sort by modification time to get latest
  files.sort((a, b) => {
    return fs.statSync(path.join(outputDir, b)).mtime.getTime() - fs.statSync(path.join(outputDir, a)).mtime.getTime();
  });

  const latestWebm = path.join(outputDir, files[0]);
  const finalMp4 = path.resolve("./vitasignal_demo_under_3min.mp4");

  console.log(`Transcoding ${latestWebm} -> ${finalMp4}...`);
  try {
    execSync(
      `ffmpeg -y -i "${latestWebm}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -movflags +faststart "${finalMp4}"`,
      { stdio: "inherit" }
    );
    console.log(`Video created successfully: ${finalMp4}`);
    const stat = fs.statSync(finalMp4);
    console.log(`Final MP4 size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (e) {
    console.error("FFmpeg transcoding failed:", e);
  }
}

recordDemo().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
