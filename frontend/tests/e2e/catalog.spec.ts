import { test, expect } from "@playwright/test";

test.describe("Device Catalog category filter", () => {
  test("filters device cards by category", async ({ page }) => {
    await page.goto("/catalog");
    const filter = page.getByTestId("category-filter");
    const cards = page.getByTestId("device-card");

    await expect(cards).toHaveCount(7);
    await expect(filter.getByRole("button", { name: "all" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await filter.getByRole("button", { name: "wearable" }).click();
    await expect(cards).toHaveCount(1);
    await expect(
      filter.getByRole("button", { name: "wearable" })
    ).toHaveAttribute("aria-pressed", "true");

    await filter.getByRole("button", { name: "smartphone" }).click();
    await expect(cards).toHaveCount(5);

    await filter.getByRole("button", { name: "all" }).click();
    await expect(cards).toHaveCount(7);
  });
});
