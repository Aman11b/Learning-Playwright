import { test, expect, type Page } from "@playwright/test";
import { count } from "node:console";
import { Await } from "react-router-dom";

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

  test.describe("Visibility",()=>{
    test("Toggle-all and footer apper only after a todo is added",async({page})=>{
      
      
      // before nothing rendered
      await expect(page.getByTestId("toggle-all")).toBeHidden();
      await expect(page.getByTestId("footer")).toBeHidden();

      await addTodos(page,[TODO_ITEMS[0]])

      // after both rendered
      await expect(page.getByTestId("toggle-all")).toBeVisible();
      await expect(page.getByTestId("footer")).toBeVisible();
    });
  });

  test.describe("Enabled and disabled",()=>{
    test("Clear completed is disabled untill a todo is completed",async({page})=>{
      await addTodos(page,TODO_ITEMS);

      const clearButton=page.getByRole("button",{name:"Clear completed"})

      await expect(clearButton).toBeDisabled()

      await page.getByTestId("todo-item-toggle").first().check()

      await expect(clearButton).toBeEnabled()


    })
  })

  test.describe("Focus",()=>{
    test("new todo input is Focus on lead and after adding a todo",async ({page})=>{
      const todoInput=page.getByTestId("header").getByRole("textbox");

      await expect(todoInput).toBeFocused();
      await addTodos(page,[TODO_ITEMS[0]])
      await expect(todoInput).toBeFocused()


      const checkbox=page.getByTestId("todo-item-toggle");
      await checkbox.focus()

      await expect(checkbox).toBeFocused();
      await expect(todoInput).not.toBeFocused();
    })
  })


  test.describe("value and attricute",()=>{
    test("new todo input has a placeholder and clears after submit",async({page})=>{
      const todoInput=page.getByTestId("header").getByRole("textbox")
      await expect(todoInput).toHaveAttribute(
        "placeholder",
        "What needs to be done?"
      )
      await expect(todoInput).toHaveValue("")

      await todoInput.fill(TODO_ITEMS[0])
      await expect(todoInput).toHaveValue(TODO_ITEMS[0])


      await todoInput.press("Enter")
      await expect(todoInput).toHaveValue("")

    })
  })


  test.describe("Test with regex",()=>{
    test("item counter uses singular and plural correctly",async ({page})=>{
      const counter=page.getByTestId("footer").getByText(/left!/)


      await addTodos(page,[TODO_ITEMS[0]])
      await expect(counter).toHaveText("1 item left!")
      await expect(counter).not.toHaveText(/items/)

      await addTodos(page,[TODO_ITEMS[1],TODO_ITEMS[2]])
      await expect(counter).toHaveText(/^\d+ items left!$/)
      await expect(counter).toHaveText("3 items left!")


      await page.getByTestId("todo-item-toggle").first().check()
      await expect(counter).toHaveText(/^2 items/)
    })
  })

  // A normal expect throws on the first failure and stops the test. You fix one problem, rerun, find the next, and repeat.
  // expect.soft records the failure but keeps the test running. At the end, the test is marked failed and every failure is reported together.

  test.describe("Soft assertion",()=>{
    test("footer shows all its peices after adding todos",async ({page})=>{
      await addTodos(page,TODO_ITEMS)

      const footer=page.getByTestId("footer")

      // hard gate
      await expect(footer).toBeVisible()

      await expect.soft(footer.getByText(/left!/)).toHaveText("3 items left!")


      await expect
        .soft(footer.getByRole("link",{name:"All",exact:true}))
        .toHaveClass(/selected/)
      await expect
        .soft(footer.getByRole("link",{name:"Active",exact:true}))
        .not.toHaveClass(/selected/)
      await expect
        .soft(footer.getByRole("button",{name:"Clear completed"}))
        .toBeDisabled();
    })

    // Custom messages: pass a message as the second argument to expect. When the assertion fails, your message appears in the error, so a failure reads “footer should be visible once todos exist” instead of only a locator and a matcher.
    // expect.poll turns a plain value into a retrying assertion. Locator assertions like toHaveText already auto-retry, but a value you compute yourself (await locator.count(), page.evaluate(...), an API response) is read once and never retried. expect.poll(() => value) re-runs your function until the matcher passes or the timeout hits.

    test.describe("Custom message and polling",()=>{
      test("completed count can be polled and failures have clear message",async({page})=>{
        await addTodos(page,TODO_ITEMS)

        await expect(
          page.getByTestId("footer"),"footer should be visible once todo exists",
        ).toBeVisible()

        const toggle=page.getByTestId("todo-item-toggle")
        await toggle.nth(0).check()
        await toggle.nth(1).check()


// Poll a computed value: count how many checkboxes are checked
        await expect
          .poll(
            ()=> 
              toggle.evaluateAll(
              (els)=>els.filter((el)=>(el as HTMLInputElement).checked).length
            ),
            {
              message:"two todos should be marked completed",
              timeout:5_000
            }
          ).toBe(2)
      })
    })

  })

  test.describe("Click",()=>{
    test("click deletes a todo and 'Clear completed' removed finished ones",async({page})=>{
      await addTodos(page,TODO_ITEMS)

      const items=page.getByTestId("todo-item")
      const labels=page.getByTestId("todo-item-label")

      const typescriptTodo=items.filter({hasText:TODO_ITEMS[1]})
      await typescriptTodo.hover()
      await typescriptTodo.getByTestId("todo-item-button").click()


      await expect(labels).toHaveText([TODO_ITEMS[0],TODO_ITEMS[2]])


      await items.first().getByTestId("todo-item-toggle").check()
      await page.getByRole("button",{
        name:"Clear completed"
      }).click()

      await expect(labels).toHaveText([TODO_ITEMS[2]])
    })
  })
  // It’s not the same as calling click() twice, because a real double-click also sets the click count to 2, which is what onDoubleClick handlers listen for.

  test.describe("Double-click",()=>{
    test("double-clicking a label lets the user edit the todo",async({page})=>{
      await addTodos(page,TODO_ITEMS);

      const labels=page.getByTestId("todo-item-label");

      const secondTodo=page.getByTestId("todo-item").nth(1);
      const editInput=secondTodo.getByRole("textbox")

      await expect(editInput).toHaveCount(0)

      await secondTodo.getByTestId("todo-item-label").dblclick()


      await expect(editInput).toBeVisible()
      await expect(editInput).toHaveValue(TODO_ITEMS[1])
      await expect(editInput).toBeFocused()

      await editInput.fill("Learn TypeScript deeply")
      await editInput.press("Enter")


      await expect(editInput).toHaveCount(0);
      await expect(labels).toHaveText([
        TODO_ITEMS[0],
        "Learn TypeScript deeply",
        TODO_ITEMS[2]
      ])
    })
  })

  // locator.press("Key") focuses the element and presses a key.
  // locator.pressSequentially("text") types one character at a time, firing keydown, keypress and keyup for each one. { delay: 50 } adds a pause between keys.
  // Use pressSequentially() only when the app reacts to individual keystrokes, such as autocomplete, live search, or input masks.
  // page.keyboard.press(...) sends keys to whatever currently has focus, without naming an element. Prefer locator.press() when you know the target.

  test.describe("Keyboard",()=>{
    test("Tab cancels an edit, and pressSquentially types key by key",async ({page})=>{
      await addTodos(page,TODO_ITEMS)

      const labels=page.getByTestId("todo-item-label")
      const secondTodo=page.getByTestId("todo-item").nth(1)
      const editInput=secondTodo.getByRole("textbox")

      await secondTodo.getByTestId("todo-item-label").dblclick()
      await editInput.fill("This edot will be discarded");

      await editInput.press("Tab")

      await expect(editInput).toHaveCount(0);
      await expect(labels).toHaveText(TODO_ITEMS)

      const todoInput=page.getByTestId("header").getByRole("textbox")
      await todoInput.pressSequentially("Typed key by key",{delay:50})
      await expect(todoInput).toHaveValue("Typed key by key");


      await todoInput.press("Enter")
      await expect(labels).toHaveText([...TODO_ITEMS,"Typed key by key"])
      
    })
  })


  // clear() empties an input or textarea.
  //  It’s equivalent to fill(""), but it reads better because it says what you mean.
  // It waits for the element to be visible, enabled and editable, then focuses it and empties it. Calling it on something that isn’t editable (a button, a disabled input) fails with a clear error.


  test.describe("Clear",()=>{
    test("clear empties input, and enter on an empty value does nothing",async ({page})=>{
      await addTodos(page,TODO_ITEMS)
      
      const labels=page.getByTestId("todo-item-label")
      const todoInput=page.getByTestId("header").getByRole("textbox")

      await todoInput.fill("A draft I changed my mind about")
      await expect(todoInput).toHaveValue("A draft I changed my mind about")

      await todoInput.clear()
      await expect(todoInput).toBeEmpty()

      await todoInput.press("Enter")
      await expect(labels).toHaveText(TODO_ITEMS)

      const secondTodo=page.getByTestId("todo-item").nth(1)
      const editInput=secondTodo.getByRole("textbox")

      await secondTodo.getByTestId("todo-item-label").dblclick()
      await editInput.clear()
      await expect(editInput).toHaveValue("")

      await editInput.press("Enter")
      await expect(editInput).toBeVisible()

      await editInput.press("Tab");
      await expect(editInput).toHaveCount(0)
      await expect(labels).toHaveText(TODO_ITEMS)

    })
  })

  // uncheck() is the opposite of check(). It clicks only if the box is currently checked, then verifies it ended up unchecked.
  // setChecked(true | false) does either one, depending on a boolean. It’s useful when the desired state comes from a variable or test data.
  // All three are idempotent: if the box is already in the requested state, they do nothing and don’t click. Calling uncheck() on an unchecked box passes silently.
  // They work on radio buttons too, but uncheck() fails on a radio, since a radio can’t be unchecked by clicking it.
  // The app marks completed rows with a completed class, so page.locator("li.completed") is a handy way to count them.

  test.describe("Uncheck and setChecked",()=>{
    test("toggle-all compltes everything anf follors individual todos",async ({page})=>{
      await addTodos(page,TODO_ITEMS)

      const toggleAll=page.getByTestId("toggle-all")
      const firstToggle=page.getByTestId("todo-item-toggle").first()
      const counter=page.getByTestId("footer").getByText(/left!/);
      const completed=page.locator("li.completed")

      await toggleAll.check()
      await expect(completed).toHaveCount(3)
      await expect(counter).toHaveText("0 items left!")

      await firstToggle.uncheck()
      await expect(firstToggle).not.toBeChecked()
      await expect(completed).toHaveCount(2)
      await expect(toggleAll).not.toBeChecked()
      await expect(counter).toHaveText("1 item left!")

      await toggleAll.setChecked(true)
      await expect(completed).toHaveCount(3)
      await expect(toggleAll).toBeChecked()


      await toggleAll.setChecked(false)
      await expect(completed).toHaveCount(0)
      await expect(counter).toHaveText("3 items left!")


      await toggleAll.setChecked(false)
      await expect(completed).toHaveCount(0)

    })

      
  })

})


