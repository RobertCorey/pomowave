import { test, expect, chromium } from "@playwright/test";

test("room system with multiple users", async () => {
  // Create browser contexts for three different users
  const browser = await chromium.launch();

  // Create browser contexts for Alice, Bob, and Charlie
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const charlieContext = await browser.newContext();

  // Create pages for each context
  const alicePage = await aliceContext.newPage();
  const bobPage = await bobContext.newPage();
  const charliePage = await charlieContext.newPage();

  try {
    // 1. Alice creates a room
    await alicePage.goto("/new");
    await alicePage.fill("#nickname", "Alice");
    await alicePage.click('button[type="submit"]');
    await alicePage.waitForURL(/\/room\/[\w-]+/);

    // Get the room URL to share with other users
    const roomUrl = alicePage.url();
    const roomCode = roomUrl.split("/").pop();

    // Verify room creation was successful
    await expect(
      alicePage.locator(`h1:has-text("Room: ${roomCode}")`)
    ).toBeVisible();
    await expect(
      alicePage.locator('.users-list li:has-text("Alice")')
    ).toBeVisible();
    await expect(
      alicePage.locator('button:has-text("Share Link")')
    ).toBeVisible();
    await expect(
      alicePage.locator('button:has-text("Join Room")')
    ).not.toBeVisible();

    // 2. Bob joins the room
    await bobPage.goto(roomUrl);
    await bobPage.fill("#join-nickname", "Bob");
    await bobPage.click('button:has-text("Join Room")');

    // Verify Bob successfully joined
    await expect(
      bobPage.locator('.users-list li:has-text("Bob")')
    ).toBeVisible();
    await expect(
      bobPage.locator('.users-list li:has-text("Alice")')
    ).toBeVisible();
    await expect(
      bobPage.locator('button:has-text("Join Room")')
    ).not.toBeVisible();

    // Verify Alice can see Bob
    await expect(
      alicePage.locator('.users-list li:has-text("Bob")')
    ).toBeVisible();
    await expect(alicePage.locator(".users-list li")).toHaveCount(2);

    // 3. Charlie joins the room
    await charliePage.goto(roomUrl);
    await charliePage.fill("#join-nickname", "Charlie");
    await charliePage.click('button:has-text("Join Room")');

    // Verify Charlie successfully joined
    await expect(
      charliePage.locator('.users-list li:has-text("Charlie")')
    ).toBeVisible();
    await expect(
      charliePage.locator('.users-list li:has-text("Alice")')
    ).toBeVisible();
    await expect(
      charliePage.locator('.users-list li:has-text("Bob")')
    ).toBeVisible();
    await expect(charliePage.locator(".users-list li")).toHaveCount(3);

    // Verify Alice and Bob can see Charlie
    await expect(
      alicePage.locator('.users-list li:has-text("Charlie")')
    ).toBeVisible();
    await expect(alicePage.locator(".users-list li")).toHaveCount(3);

    await expect(
      bobPage.locator('.users-list li:has-text("Charlie")')
    ).toBeVisible();
    await expect(bobPage.locator(".users-list li")).toHaveCount(3);
  } finally {
    // Clean up: close all contexts and browser
    await aliceContext.close();
    await bobContext.close();
    await charlieContext.close();
    await browser.close();
  }
});
