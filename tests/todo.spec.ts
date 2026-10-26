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

  // getByPlaceholder("text") finds an input by its placeholder attribute.
  // getByLabel("text") finds a form control by its associated <label> text (or aria-label). It’s the best locator for forms, because it matches how a user identifies a field: by the name next to it.
  // Playwright’s recommended priority is: 
  // getByRole > getByLabel > getByPlaceholder > getByText > getByTestId. Test ids are the fallback for when nothing user-facing is stable.
  // Both match as a case-insensitive substring by default. Add { exact: true } for a case-sensitive full match.


  test.describe("Label and placeholder locators",()=>{
    test("the new todo input can be found three different location",async({page})=>{
      const byPlaceholder=page.getByPlaceholder("What needs to be done?")
      const byLabel=page.getByLabel("New Todo Input")
      const byTestId=page.getByTestId("header").getByRole("textbox")


      await expect(byPlaceholder).toBeVisible()
      await expect(byLabel).toBeVisible()

      await byPlaceholder.fill(TODO_ITEMS[0])
      await expect(byLabel).toHaveValue(TODO_ITEMS[0])
      await expect(byTestId).toHaveValue(TODO_ITEMS[0])

      await byLabel.press("Enter")
      await expect(page.getByTestId("todo-item-label")).toHaveText([
        TODO_ITEMS[0]
      ])
    })
  })

  // getByRole finds elements by their ARIA role, which most HTML tags have implicitly:
  // The second argument filters by state and properties:
  // name matches the accessible name (text, label or aria-label) as a case-insensitive substring. Add exact: true for a full match.
  // checked: true | false filters checkboxes and radios.
  // level: 1-6 filters headings.
  // disabled, expanded, pressed and selected work the same way for the matching widgets.
  // includeHidden: true includes elements that are hidden from the accessibility tree. By default, hidden elements are excluded from role queries.
  test.describe("getByRole options",()=>{
    test("role locator can filter by level,name and checked state",async ({page})=>{
      await addTodos(page,TODO_ITEMS)

      await expect(page.getByRole("heading",{level:1})).toHaveText("todos")


      const list = page.getByTestId("todo-list")
      const checkboxes=list.getByRole("checkbox",{
        checked:true
      })
      const unchecked=list.getByRole("checkbox",{checked:false})

      await expect(checkboxes).toHaveCount(0)
      await expect(unchecked).toHaveCount(3)

      await list.getByRole("checkbox").first().check()

      await expect(checkboxes).toHaveCount(1)
      await expect(unchecked).toHaveCount(2)

      const footer=page.getByTestId("footer")

      await expect(footer.getByRole("link")).toHaveText([
        "All","Active","Completed"
      ])

      await expect(footer.getByRole("link",{
        name:"Active",exact:true
      })).toHaveAttribute("href","#/active")
    })
  })

  test.describe("filter hasNot and hasNotTest",()=>{
    test("filter can excludes rows by descendant or by text",async ({page})=>{
      await addTodos(page,TODO_ITEMS)

      const items=page.getByTestId("todo-item")
      const checkbox=page.getByRole("checkbox",{checked:true})


      await items.first().getByTestId("todo-item-toggle").check()

      const doneItems=items.filter({has:checkbox})
      await expect(doneItems).toHaveCount(1)
      await expect(doneItems.getByTestId("todo-item-label")).toHaveText([
        TODO_ITEMS[0]
      ])

      const activeItem=items.filter({hasNot:checkbox})
      await expect(activeItem).toHaveCount(2)
      await expect(activeItem.getByTestId("todo-item-label")).toHaveText([
        TODO_ITEMS[1],
        TODO_ITEMS[2]
      ])

      // hasNotText: rows whose text does NOT contain "TypeScript"
      const notTypescript = items.filter({ hasNotText: "TypeScript" });
      await expect(notTypescript.getByTestId("todo-item-label")).toHaveText([
        TODO_ITEMS[0],
        TODO_ITEMS[2],
      ]);

      // Chain: active AND not TypeScript -> only the last todo remains
      const activeNotTypescript = activeItem.filter({
        hasNotText: "TypeScript",
      });
      await expect(activeNotTypescript).toHaveCount(1);
      await expect(activeNotTypescript).toContainText(TODO_ITEMS[2]);
    })
  })

  // a.and(b) matches elements that satisfy both locators. Both conditions are checked on the same element, unlike chaining (a.getByX()), which searches inside a.
  // a.or(b) matches elements that satisfy either locator. It’s useful when the UI can show one of two things (for example a banner or a dialog).
  test.describe("and / or",()=>{
    test("and() combines on one element, or() matches either",async({page})=>{
      const footerOrToggleAll=page.getByTestId("footer").or(page.getByTestId("toggle-all"))


      await expect(footerOrToggleAll).toHaveCount(0)
      await addTodos(page,TODO_ITEMS);
      await expect(footerOrToggleAll).toHaveCount(2)


      const completedItems=page.getByTestId("todo-item").and(page.locator(".completed"))

      await expect(completedItems).toHaveCount(0)
      await page.getByTestId("todo-item-toggle").first().check()
      await expect(completedItems).toHaveCount(1)

    })
  })

  // locator.count() returns the number of current matches, and locator.all() returns an array with one locator per match. Neither waits. They snapshot whatever is on the page right now, so assert something first (like toHaveCount) to make sure the list has settled.
  // allInnerTexts() returns the text of every match as a string[], which is handy for comparing a whole list.
  // Strict mode: if a locator matches more than one element and you call a single-element action (click, fill, innerText) or assertion (toBeVisible, toHaveText("string")), Playwright throws a strict mode violation instead of guessing. This protects you from clicking the wrong element. The fix is to make the locator more specific with first(), nth(), filter() or a better scope.


  test.describe("all, count and strict mode",()=>{
    test("loop over matches, and multiple matches trip strict mode",async ({page})=>{
      await addTodos(page,TODO_ITEMS)

      const labels=page.getByTestId("todo-item-label")
      const toggles=page.getByTestId("todo-item-toggle")

      await expect(labels).toHaveCount(3)
      expect(await labels.count()).toBe(3)
      expect(await labels.allInnerTexts()).toEqual(TODO_ITEMS)


      for (const toggle of await toggles.all()){
        await toggle.check()
      }

      await expect(page.locator("li.completed")).toHaveCount(3)

      await expect(labels.click()).rejects.toThrow(/strict mode violation/)

      await labels.first().click()
    })
  })

  // This app uses a HashRouter, so each filter link only changes the URL hash (#/active, #/completed). The page doesn’t reload. React Router sees the hash change and re-renders.
  // await expect(page).toHaveURL(...) asserts the current URL. It takes a string or a regex, and it auto-retries, so it’s safe right after a click.
  // page.url() is different. It returns the URL right now, with no waiting. If you read it right after a click, the URL may not have changed yet, which makes the test flaky. Prefer toHaveURL.
  // Regexes are handy for URLs: /#\/active$/ means “ends with #/active”. The $ anchor stops it from also matching something like #/active-old.


  test.describe("Filter and URL",()=>{
    test("footer links filter the list and update the URL",async ({page})=>{
      await addTodos(page,TODO_ITEMS)
      await page.getByTestId("todo-item-toggle").first().check()


      const labels=page.getByTestId("todo-item-label")
      const footer=page.getByTestId("footer")
      const link=(name:string)=>footer.getByRole("link",{
        name,exact:true
      })

      await link("Active").click()
      await expect(page).toHaveURL(/#\/active$/)
      await expect(labels).toHaveText([TODO_ITEMS[1],TODO_ITEMS[2]])
      await expect(link("Active")).toHaveClass(/selected/)

      await link("Completed").click()
      await expect(page).toHaveURL(/#\/completed$/)
      await expect(labels).toHaveText([TODO_ITEMS[0]])
      await expect(link("Completed")).toHaveClass(/selected/)

      await link("All").click()
      await expect(page).toHaveURL(/#\/$/)
      await expect(labels).toHaveText(TODO_ITEMS)
      await expect(link("All")).toHaveClass(/selected/)
    })
  })

  // page.goBack() and page.goForward() do what the browser buttons do. If there’s no entry to go to, they return null instead of throwing, so don’t rely on the return value. Assert the URL and the list afterwards.
  test.describe("History",()=>{
    test("back and forword move between filters",async ({page})=>{
      await addTodos(page,TODO_ITEMS)
      await page.getByTestId("todo-item-toggle").first().check()

      const labels=page.getByTestId("todo-item-label")
      const link=(name:string)=>page.getByTestId("footer").getByRole("link",{name,exact:true})

      await link("Active").click()
      await link("Completed").click()
      await expect(page).toHaveURL(/#\/completed$/)

      await page.goBack()
      await expect(page).toHaveURL(/#\/active$/)
      await expect(labels).toHaveText([TODO_ITEMS[1],TODO_ITEMS[2]])

      await page.goBack()
      await expect(labels).toHaveText(TODO_ITEMS)
      await expect(link("All")).toHaveClass(/selected/)

      await page.goForward()
      await expect(page).toHaveURL(/#\/active$/)
      await expect(labels).toHaveCount(2)
    })
  })

  // page.goto("/#/completed") opens a filter URL directly, which is how a user lands there from a bookmark or shared link. Our beforeEach already loaded /, and a hash-only change doesn’t reload the page, but it still triggers the router.
  // page.reload() is the browser’s refresh button. The URL stays, but all JavaScript state is lost.

  test.describe("Direct URL and reload",()=>{
    test("a hash URL applies the filter, and reload wipes the todos",async ({page})=>{
      const labels=page.getByTestId("todo-item-label")
      const footer=page.getByTestId("footer")

      await page.goto("/#/completed")
      await addTodos(page,[TODO_ITEMS[0]])

      await expect(footer).toBeVisible()
      await expect(footer.getByText(/left!/)).toHaveText("1 item left!")
      await expect(labels).toHaveCount(0)
      await expect(
        footer.getByRole("link",{name:"Completed",exact:true}),
      ).toHaveClass(/selected/)

      await page.reload()
      await expect(page).toHaveURL(/#\/completed$/)
      await expect(footer).toBeHidden()
    })
  })


})


