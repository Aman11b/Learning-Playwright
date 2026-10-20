# everything, headless
```bash
    npx playwright test       
```                
# see the browser
```bash
npx playwright test --headed     
```

# only tests whose title matches
```bash
npx playwright test -g "Completing"    
```

# a single test by line number

```bash
npx playwright test todo.spec.ts:20   
```

# UI mode: time-travel, watch mode, filters
```bash
npx playwright test --ui  
```
```bash
npx playwright test --ui-host=0.0.0.0 --ui-port=8080
```

# open the HTML report after a run

```bash
npx playwright show-report    
```
```bash
npx playwright show-report --host 0.0.0.0
```



   


    

                


            