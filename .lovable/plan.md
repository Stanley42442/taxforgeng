

## Fix: Set Body Background on the Static HTML Loader

### Problem
The `#initial-loader` div has `background:#f8f6f0` but the `body` element itself starts with a default white background before Tailwind CSS loads. This causes the page to appear white rather than cream during the initial paint.

### Solution
Add `background:#f8f6f0` directly to the `<body>` tag's inline style in `index.html`. This ensures the cream background is painted immediately by the browser, before any CSS files load.

### Change — `index.html`

On the `<body>` tag (currently has no inline style), add:

```html
<body style="background:#f8f6f0;margin:0;">
```

Single line change — the cream background will be visible from the very first paint frame.

