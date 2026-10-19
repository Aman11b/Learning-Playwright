import { test, expect } from "@playwright/test";

// { page } extracts the page fixture from Playwright's test context. Playwright manages the browser context and page lifecycle for you.

test("User can add a todo item", async ({ page }) => {
  await page.goto("/");

  const todoInput = page.getByRole("textbox");

  await todoInput.fill("Learn Playwright");
  await todoInput.press("Enter");

  await expect(page.getByTestId("todo-item-label")).toHaveText([
    "Learn Playwright",
  ]);
});

test("User can add ann locate specific todo items", async ({ page }) => {
  await page.goto("/");

  const todoInput = page.getByRole("textbox");

  const todos = ["Learn Playwright", "Learn Typescript", "Practive testing"];

  for (const todo of todos) {
    await todoInput.fill(todo);
    await todoInput.press("Enter");
  }

  await expect(page.getByTestId("todo-item-label")).toHaveText(todos);

  const typescriptTodo = page.getByRole("listitem").filter({
    hasText: "Learn Typescript",
  });

  await expect(typescriptTodo).toHaveCount(1);
  await expect(typescriptTodo).toContainText("Learn Typescript");
});

test("User can complete a specific todo ietm", async ({ page }) => {
  await page.goto("/");

  const todoInput = page.getByRole("textbox");

  await todoInput.fill("Learn Playwright");
  await todoInput.press("Enter");

  await todoInput.fill("Learn Typescript");
  await todoInput.press("Enter");

  const typescriptTodo = page.getByTestId("todo-item").filter({
    hasText: "Learn Typescript",
  });

  const checkbox = typescriptTodo.getByTestId("todo-item-toggle");

  await checkbox.check();

  await expect(checkbox).toBeChecked();

  const playwrightTodo = page.getByTestId("todo-item").filter({
    hasText: "Learn Playwright",
  });

  await expect(
    playwrightTodo.getByTestId("todo-item-toggle"),
  ).not.toBeChecked();
});

test("User can locate todos by position", async ({ page }) => {
  await page.goto("/");
  const todoInput = page.getByRole("textbox");

  const todos = ["Learn Playwright", "Learn Typescript", "Practive testing"];

  for (const todo of todos) {
    await todoInput.fill(todo);
    await todoInput.press("Enter");
  }

  const labels = page.getByTestId("todo-item-label");

  await expect(labels).toHaveCount(3);

  await expect(labels.first()).toHaveText("Learn Playwright");
  await expect(labels.nth(1)).toHaveText("Learn Typescript");
  await expect(labels.last()).toHaveText("Practive testing");
});
