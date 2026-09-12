# Routes

Routing is hash-based and implemented in `index.html`.

```js
const routeValid=id=>calculators.some(c=>c.id===id)||id==='convert'||id==='references'||id==='changelog';
function navigate(id){if(!routeValid(id))return;clearTimeout(timer);active=id;location.hash=id;render();window.scrollTo({top:0,behavior:'instant'});}
```

## Route map

- `#<calculator-id>` — one route per calculator in the `calculators` registry
- `#convert` — unit converter
- `#references` — codes and sources
- `#changelog` — product changelog
- no hash / invalid hash — room-cooling calculator (`#btu`)

All routes use the same `shell()` layout and replace the contents of `<main id="main">`.
