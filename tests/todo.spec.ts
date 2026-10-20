import { test, expect, type Page } from "@playwright/test";

// { page } extracts the page fixture from Playwright's test context. Playwright manages the browser context and page lifecycle for you.

const TODO_ITEMS = ["Learn Playwright", "Learn TypeScript", "Practice testing"];

// Helper :action only no assertion

async function addTodos(page:Page,titles:string[]){
  const todoInput=page.getByTestId("header").getByRole("textbox");

  for (const title of titles) {
    await todoInput.fill(title);
    await todoInput.press("Enter");
  }

}

test.describe("Todo app",()=>{
  // Runs before EVERY test in this described
  test.beforeEach(async({page})=>{
    await page.goto("/");
  });

  test.describe("Initial state",()=>{
    test("start with no todos and no footer",async({page})=>{
      await expect(page.getByTestId("todo-item")).toHaveCount(0);
      await expect(page.getByTestId("footer")).toHaveCount(0);
    })
  })

  test.describe("Adding todos",()=>{
    test("User can add a todo item",async ({page})=>{
      await addTodos(page,[TODO_ITEMS[0]]);

      await expect(page.getByTestId("todo-item-label")).toHaveText([
        TODO_ITEMS[0]
      ]);
    });

    test("User can add and locate specific todo items",async ({page})=>{
      await addTodos(page,TODO_ITEMS);
      await expect(page.getByTestId("todo-item-label")).toHaveText(TODO_ITEMS);

      const typescriptTodo=page.getByRole("listitem").filter({
        hasText:TODO_ITEMS[1]
      })
      await expect(typescriptTodo).toHaveCount(1);
      await expect(typescriptTodo).toContainText(TODO_ITEMS[1]);

    })

  });

  test.describe("Location todos",()=>{
    test("User can locate todos by position",async ({page})=>{
      await addTodos(page,TODO_ITEMS);
  
      const labels=page.getByTestId("todo-item-label");
  
      await expect(labels).toHaveCount(3)
      await expect(labels.first()).toHaveText(TODO_ITEMS[0])
      await expect(labels.nth(1)).toHaveText(TODO_ITEMS[1])
      await expect(labels.last()).toHaveText(TODO_ITEMS[2])
    })
  })
  
  test.describe("Completing Todos",()=>{
    test("User ca complete a specific todo item",async ({page})=>{
      await addTodos(page,[TODO_ITEMS[0],TODO_ITEMS[1]]);
  
      const typescriptTodo=page.getByTestId("todo-item").filter({
        hasText:TODO_ITEMS[1]
      })
  
      const playwrightTodo=page.getByTestId("todo-item").filter({
        hasText:TODO_ITEMS[0]
      })
  
      const checkbox=typescriptTodo.getByTestId("todo-item-toggle");
      await checkbox.check()
  
      await expect(checkbox).toBeChecked()
      await expect(
        playwrightTodo.getByTestId("todo-item-toggle")
      ).not.toBeChecked()
    })
  
    test("User can target a checkbox inside a specific todo item",async ({page})=>{
      await addTodos(page,TODO_ITEMS)
  
      const typescriptTodo=page.getByTestId("todo-item").filter({
        has:page.getByText(TODO_ITEMS[1],{exact:true})
      })
  
      await expect(typescriptTodo).toHaveCount(1)
  
      const checkbox=typescriptTodo.getByTestId("todo-item-toggle");
      await checkbox.check()
  
      await expect(checkbox).toBeChecked();
      await expect(typescriptTodo).toHaveClass(/completed/)
    })
  })
})


