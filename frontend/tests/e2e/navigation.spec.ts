import { test, expect } from "@playwright/test";

test.describe("Wireless Activation Console navigation", () => {
  test("home page loads with the console title", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Wireless Activation Console" })
    ).toBeVisible();
  });

  test("can navigate to the device catalog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Devices" }).click();
    await expect(
      page.getByRole("heading", { name: "Device Catalog" })
    ).toBeVisible();
  });

  test("shows a service cart badge in the nav bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("cart-badge")).toBeVisible();
  });
});
