import { test, expect } from "@playwright/test";

// { page } extracts the page fixture from Playwright's test context. Playwright manages the browser context and page lifecycle for you.

test("User can add a todo item", async ({ page }) => {
  await page.goto("/");

  const todoInput = page.getByTestId("text-input");

  await todoInput.fill("Learn Playwright");
  await todoInput.press("Enter");

  await expect(page.getByTestId("todo-item-label")).toHaveText([
    "Learn Playwright",
  ]);
});
