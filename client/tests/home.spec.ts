import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pomowave/);
  });

  test("displays main heading and description", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Pomowave");
    await expect(
      page.locator("p:has-text('Create a new room')")
    ).toBeVisible();
  });

  test("has Create Room button", async ({ page }) => {
    await page.goto("/");
    const createRoomButton = page.locator(".create-room-btn");
    await expect(createRoomButton).toBeVisible();
    await expect(createRoomButton).toHaveText("Create Room");
  });

  test("Create Room button navigates to /new", async ({ page }) => {
    await page.goto("/");
    await page.click(".create-room-btn");
    await expect(page).toHaveURL("/new");
  });
});
