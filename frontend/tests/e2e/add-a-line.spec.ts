import { test, expect } from "@playwright/test";

// Requires the API running on :3000 (proxied by the Vite dev server).
test.describe("Add-a-Line service cart", () => {
  test("cart badge links to the Add-a-Line page", async ({ page }) => {
    await page.goto("/");
    const badge = page.getByTestId("cart-badge");
    await expect(badge).toContainText("0");
    await badge.click();
    await expect(page).toHaveURL(/\/add-a-line$/);
    await expect(page.getByRole("heading", { name: "Add a Line" })).toBeVisible();
  });

  test("adds lines, totals the cart, and checks out", async ({ page }) => {
    await page.goto("/add-a-line");
    const rows = page.getByTestId("add-a-line-device");
    await expect(rows.first()).toBeVisible();

    await rows.nth(0).getByRole("button", { name: "Add" }).click();
    await expect(rows.nth(0).getByRole("button", { name: "Added" })).toBeDisabled();
    await rows.nth(1).getByRole("button", { name: "Add" }).click();
    await expect(rows.nth(1).getByRole("button", { name: "Added" })).toBeDisabled();

    await expect(page.getByTestId("cart-badge")).toContainText("2");
    await expect(page.getByTestId("monthly")).toHaveText("$170.00/mo");

    await page.getByRole("button", { name: "Review & check out" }).click();
    await expect(
      page.getByRole("heading", { name: "Activation Orders" })
    ).toBeVisible();
    await expect(page.getByTestId("cart-badge")).toContainText("0");
  });
});
