Since you already know HTML and CSS, the easiest way to learn Bootstrap is to think of it as:

> **Bootstrap = A huge collection of pre-written CSS classes.**

Instead of writing CSS like this:

```css
.container{
    width:80%;
    margin:auto;
}

.btn{
    background:blue;
    color:white;
    padding:10px 20px;
}
```

Bootstrap already provides these classes. You simply write:

```html
<div class="container"></div>

<button class="btn btn-primary">Submit</button>
```

No CSS needs to be written.

---

# 1. Bootstrap CSS Link

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
```

This imports the entire Bootstrap CSS library.

Without this line,

```html
class="btn btn-primary"
```

has absolutely no effect.

---

# 2. Bootstrap Icons

```html
<link rel="stylesheet"
href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
```

This imports Bootstrap Icons.

Example

```html
<i class="bi bi-trash"></i>
```

shows

🗑️ Trash Icon

Another example

```html
<i class="bi bi-pencil"></i>
```

✏ Pencil Icon

You aren't using icons in this HTML yet, but the library is ready.

---

# 3. Body

```html
<body class="bg-light">
```

### bg-light

Background Color

Equivalent CSS

```css
background-color:#f8f9fa;
```

Other background classes

```html
bg-primary
bg-success
bg-danger
bg-warning
bg-info
bg-dark
bg-light
bg-secondary
bg-white
```

Example

```html
<div class="bg-primary text-white">
Hello
</div>
```

Blue background.

---

# 4. Container

```html
<div class="container">
```

One of the most important Bootstrap classes.

Equivalent CSS

```css
width:100%;
max-width:1320px;
margin:auto;
padding-left:12px;
padding-right:12px;
```

It centers the page.

Without container

```
------------------------------------
Text starts from left edge
------------------------------------
```

With container

```
      -------------------------
      Content in center
      -------------------------
```

---

# 5. py-5

```html
<div class="container py-5">
```

This is spacing.

Bootstrap uses

```
p = padding

m = margin
```

Then

```
t = top
b = bottom
s = start(left)
e = end(right)
x = left + right
y = top + bottom
```

So

```
py
```

means

Padding Top + Bottom

The number

```
5
```

means

Large spacing.

Approximate values

```
0 = 0

1 = 4px

2 = 8px

3 = 16px

4 = 24px

5 = 48px
```

Example

```html
py-5
```

↓

```css
padding-top:48px;
padding-bottom:48px;
```

---

# 6. text-center

```html
<h2 class="text-center">
```

Equivalent CSS

```css
text-align:center;
```

Other options

```
text-start

text-end
```

---

# 7. mb-4

```html
<h2 class="mb-4">
```

Means

Margin Bottom

```
mb = margin-bottom
```

Value

```
4
```

↓

Around

24px

Equivalent CSS

```css
margin-bottom:24px;
```

---

# 8. Row

```html
<div class="row">
```

Bootstrap Grid starts here.

Think

```
container

↓

row

↓

columns
```

Example

```
Container

---------------------------

Row

---------------------------

Column Column Column
```

Rows use Flexbox automatically.

Equivalent

```css
display:flex;
flex-wrap:wrap;
```

---

# 9. Columns

```html
<div class="col-md-4">
```

and

```html
<div class="col-md-8">
```

Bootstrap divides the page into **12 equal columns**.

```
1 2 3 4 5 6 7 8 9 10 11 12
```

Here

```
4 + 8 = 12
```

So

```
Left = 4 columns

Right = 8 columns
```

Visual

```
□□□□□□□□□□□□□□□□□□□□

■■■■□□□□□□□□□□□□

Left

■■■■■■■■□□□□□□□□

Right
```

---

## md

```
col-md-4
```

means

**When screen width ≥768px**

use

```
4 columns
```

Otherwise

Take full width.

That's why on mobile it becomes

```
Left

Right
```

instead of

```
Left Right
```

---

# 10. Card

```html
class="card"
```

Bootstrap card creates a nice white box.

Equivalent CSS

```css
background:white;
border-radius:8px;
border:1px solid #ddd;
```

---

# 11. shadow-sm

```html
shadow-sm
```

Adds small shadow.

Equivalent

```css
box-shadow:0 .125rem .25rem rgba(0,0,0,.075);
```

Other options

```
shadow

shadow-lg

shadow-none
```

---

# 12. p-3

```html
p-3
```

Padding on all sides.

Equivalent

```css
padding:16px;
```

---

# 13. mb-2

```html
mb-2
```

Margin Bottom

Around

```
8px
```

---

# 14. form-control

```html
<input class="form-control">
```

Makes input beautiful.

Without Bootstrap

```
__________
```

With Bootstrap

```
+--------------------+

 nicely styled input

+--------------------+
```

It adds

* padding
* border
* rounded corners
* focus effect

---

# 15. form-label

```html
<label class="form-label">
```

Makes labels properly spaced.

Equivalent

```css
display:inline-block;
margin-bottom:.5rem;
```

---

# 16. form-select

```html
<select class="form-select">
```

Styles dropdown.

Instead of ugly browser dropdown,

Bootstrap gives a modern look.

---

# 17. btn

```html
class="btn"
```

Makes element behave like Bootstrap button.

Adds

* padding
* border
* cursor
* font
* rounded corners

---

# 18. btn-primary

```html
btn-primary
```

Primary blue button.

Other colors

```
btn-success

btn-danger

btn-warning

btn-info

btn-dark

btn-secondary

btn-light

btn-outline-primary
```

Example

```html
<button class="btn btn-success">
Save
</button>
```

Green button.

---

# 19. w-100

```html
w-100
```

Width

100%

Equivalent CSS

```css
width:100%;
```

---

# 20. table

```html
class="table"
```

Automatically styles tables.

Without Bootstrap

```
Name Age

John 20
```

With Bootstrap

```
--------------------

Name Age

--------------------

John 20

--------------------
```

---

# 21. table-responsive

```html
<div class="table-responsive">
```

Very important.

On mobile,

instead of breaking,

table becomes horizontally scrollable.

Without

```
Columns overflow
```

With

```
<---- scroll ---->
```

---

# 22. mb-0

```html
table class="table mb-0"
```

Means

```
margin-bottom:0;
```

---

# 23. Common Bootstrap Utility Classes

## Text

```html
text-center
text-start
text-end

text-primary
text-success
text-danger
text-warning
text-info
text-dark
text-white
text-muted
```

---

## Background

```html
bg-primary
bg-success
bg-danger
bg-warning
bg-info
bg-dark
bg-light
```

---

## Margin

```html
m-3

mt-3

mb-3

ms-3

me-3

mx-3

my-3
```

---

## Padding

```html
p-3

pt-3

pb-3

ps-3

pe-3

px-3

py-3
```

---

## Width

```html
w-25

w-50

w-75

w-100
```

---

## Display

```html
d-none

d-block

d-flex

d-grid
```

---

## Flexbox

```html
justify-content-center

justify-content-between

justify-content-around

align-items-center

align-items-start

align-items-end
```

---

## Rounded Corners

```html
rounded

rounded-3

rounded-circle

rounded-pill
```

---

## Shadows

```html
shadow-sm

shadow

shadow-lg
```

---

# Page Structure

page uses a very common Bootstrap layout:

```
body
│
├── container
│
├── row
│
│   ├── col-md-4
│   │     ├── card
│   │     └── card
│   │
│   └── col-md-8
│         └── card
│               └── table-responsive
│                     └── table
```

This combination of **container → row → columns → cards → forms/tables** is one of the most frequently used patterns in Bootstrap.

### What to learn next

To become comfortable with Bootstrap, focus on these topics in order:

1. **Spacing utilities** (`m-*`, `p-*`, `mt-*`, `mb-*`, `px-*`, `py-*`)
2. **Grid system** (`container`, `row`, `col-*`, responsive breakpoints like `sm`, `md`, `lg`)
3. **Colors and typography** (`text-*`, `bg-*`, `fw-bold`, `fs-*`)
4. **Buttons and forms** (`btn`, `form-control`, `form-select`)
5. **Flexbox utilities** (`d-flex`, `justify-content-*`, `align-items-*`)
6. **Cards, tables, and alerts**

Once you understand these six areas, you'll be able to build and customize most Bootstrap-based interfaces with confidence.
