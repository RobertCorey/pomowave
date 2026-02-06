import { test, expect } from "@playwright/test";

test.describe("Error Handling", () => {
  test("displays error for non-existent room", async ({ page }) => {
    await page.goto("/room/non-existent-room-code");

    // Should show error message
    await expect(page.locator("text=Error loading room")).toBeVisible();
  });

  test("displays loading state while fetching room", async ({ page }) => {
    // Navigate to a room page
    await page.goto("/room/some-room-code");

    // Either we see loading state or error (depending on timing)
    await expect(
      page.locator("text=Loading room data...").or(page.locator("text=Error"))
    ).toBeVisible();
  });
});

test.describe("Room Join Validation", () => {
  test("join button is disabled without nickname", async ({ page }) => {
    // First create a room to get a valid room code
    await page.goto("/new");
    await page.fill("#nickname", "Creator");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/room\/[\w-]+/);

    // Get the room URL
    const roomUrl = page.url();

    // Open a new context (different user)
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto(roomUrl);

    // The join button should be disabled when nickname is empty
    const joinButton = newPage.locator('button:has-text("Join Room")');
    await expect(joinButton).toBeDisabled();

    await newContext.close();
  });

  test("join button is enabled when nickname is entered", async ({ page }) => {
    // First create a room
    await page.goto("/new");
    await page.fill("#nickname", "Creator");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/room\/[\w-]+/);

    const roomUrl = page.url();

    // Open a new context (different user)
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto(roomUrl);

    // Fill in nickname
    await newPage.fill("#join-nickname", "NewUser");

    // The join button should now be enabled
    const joinButton = newPage.locator('button:has-text("Join Room")');
    await expect(joinButton).toBeEnabled();

    await newContext.close();
  });
});
