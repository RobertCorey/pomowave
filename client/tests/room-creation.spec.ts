import { test, expect } from "@playwright/test";

test.describe("Room Creation", () => {
  test("displays new room form", async ({ page }) => {
    await page.goto("/new");
    await expect(page.locator("h1")).toHaveText("Create a New Room");
    await expect(page.locator('label[for="nickname"]')).toBeVisible();
    await expect(page.locator("#nickname")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText(
      "Create Room"
    );
  });

  test("submit button is disabled when nickname is empty", async ({ page }) => {
    await page.goto("/new");
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test("submit button is enabled when nickname is entered", async ({
    page,
  }) => {
    await page.goto("/new");
    await page.fill("#nickname", "TestUser");
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });

  test("creates room and redirects to room page", async ({ page }) => {
    await page.goto("/new");
    await page.fill("#nickname", "TestHost");
    await page.click('button[type="submit"]');

    // Wait for navigation to room page
    await page.waitForURL(/\/room\/[\w-]+/);

    // Verify we're on the room page
    const roomCode = page.url().split("/").pop();
    await expect(page.locator("h1")).toContainText(`Room: ${roomCode}`);
  });

  test("room creator is marked as host", async ({ page }) => {
    await page.goto("/new");
    await page.fill("#nickname", "HostUser");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/room\/[\w-]+/);

    // Verify the user appears in the list as host
    await expect(
      page.locator('.users-list li:has-text("HostUser")')
    ).toBeVisible();
    await expect(
      page.locator('.users-list li:has-text("(Host)")')
    ).toBeVisible();
  });

  test("room creator does not see join form", async ({ page }) => {
    await page.goto("/new");
    await page.fill("#nickname", "Creator");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/room\/[\w-]+/);

    // The join form should not be visible for the room creator
    await expect(
      page.locator('button:has-text("Join Room")')
    ).not.toBeVisible();
    await expect(
      page.locator("h2:has-text('Welcome to the room!')")
    ).toBeVisible();
  });

  test("share link button is visible in room", async ({ page }) => {
    await page.goto("/new");
    await page.fill("#nickname", "Sharer");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/room\/[\w-]+/);

    await expect(page.locator('button:has-text("Share Link")')).toBeVisible();
  });
});
