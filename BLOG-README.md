# Worth My Money? Blog — Setup & Usage Guide

This guide covers everything you need to know about your blog setup: running it locally, writing posts, using the CMS, embedding calculators, and deploying.

---

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Run the blog locally with live reload
npm run blog:dev

# Build for production
npm run build
```

After running `npm run blog:dev`, open:
- **Your app**: http://localhost:8080/
- **Blog**: http://localhost:8080/blog/
- **CMS admin** (only works after Netlify Identity setup — see below)

---

## Project Structure

```
Calculator/
├── index.html              ← Your existing app (untouched)
├── css/styles.css           ← Your existing app styles (untouched)
├── js/app.js                ← Your existing app logic (untouched)
├── js/currencies.js         ← Your existing currencies (untouched)
├── locales/                 ← Your existing translations (untouched)
├── Images/                  ← Your existing images (untouched)
│
├── src/                     ← 11ty source files
│   ├── blog/
│   │   ├── index.njk        ← Blog listing page
│   │   ├── css/blog.css     ← Blog-specific styles
│   │   ├── images/          ← Blog post images
│   │   ├── posts/           ← Blog posts (Markdown files)
│   │   │   ├── posts.json   ← Default settings for all posts
│   │   │   ├── the-latte-factor.md
│   │   │   ├── 50-30-20-rule.md
│   │   │   └── subscription-audit.md
│   │   └── tags/
│   │       └── tags.njk     ← Auto-generated tag pages
│   ├── admin/
│   │   ├── index.html       ← Decap CMS entry point
│   │   └── config.yml       ← Decap CMS configuration
│   └── _includes/
│       └── layouts/
│           ├── base.njk     ← Base HTML layout (header, footer)
│           └── post.njk     ← Single post layout
│
├── eleventy.config.js       ← 11ty configuration
├── netlify.toml             ← Netlify build settings
├── package.json             ← npm scripts and dependencies
└── _site/                   ← Built output (auto-generated, don't edit)
```

---

## Writing a New Blog Post

### Option 1: Create a Markdown file (recommended for starting out)

1. Create a new `.md` file in `src/blog/posts/`:

```
src/blog/posts/my-new-post.md
```

2. Add frontmatter at the top:

```markdown
---
title: "Your Post Title Here"
description: "A short summary shown on the blog listing page."
date: 2026-03-01
tags:
  - budgeting
  - saving
featuredImage: /blog/images/my-image.svg
---

Your post content goes here. Write in **Markdown**.

## This is a heading

- This is a list item
- Another item

> This is a blockquote
```

3. Save and the dev server will auto-reload.

### Option 2: Use the CMS (after Netlify Identity setup)

1. Go to `https://isthisworthmymoney.com/admin/`
2. Log in with your Netlify Identity account
3. Click "New Blog Posts"
4. Fill in the fields and write your content
5. Click "Publish"

The CMS will create a markdown file and commit it to your repo automatically.

---

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title (shown as page title and card heading) |
| `description` | No | Short summary (shown on listing page) |
| `date` | Yes | Publish date in YYYY-MM-DD format |
| `tags` | No | List of tags (used for filtering and tag pages) |
| `featuredImage` | No | Path to hero image (shown on listing and post) |

---

## Adding Images

1. Put your images in `src/blog/images/`
2. Reference them in your post:

```markdown
![Alt text](/blog/images/my-photo.jpg)
```

Or in frontmatter:

```yaml
featuredImage: /blog/images/my-photo.jpg
```

**Tip**: Use `.webp` or `.jpg` for photos, `.svg` for illustrations/diagrams.

---

## Embedding the Calculator

To embed your Worth My Money calculator in any blog post, add this HTML block in your markdown:

```html
<div class="calculator-embed">
  <iframe src="/" title="Worth My Money Calculator" loading="lazy"></iframe>
  <div class="calculator-embed-caption">Try the Worth My Money? calculator</div>
</div>
```

This loads your main app inside the blog post in an iframe.

### Adjusting iframe height

If you need a taller/shorter embed, add a style attribute:

```html
<iframe src="/" title="Calculator" loading="lazy" style="min-height: 700px;"></iframe>
```

### Building a custom calculator for a specific post

If you want a standalone calculator just for one blog post:

1. Create an HTML file in `src/blog/`, e.g., `src/blog/coffee-calculator.html`
2. Add your custom calculator HTML/CSS/JS inside it
3. Add a passthrough copy in `eleventy.config.js`:
   ```js
   eleventyConfig.addPassthroughCopy("src/blog/coffee-calculator.html");
   ```
4. Embed it in your post:
   ```html
   <div class="calculator-embed">
     <iframe src="/blog/coffee-calculator.html" title="Coffee Calculator"></iframe>
   </div>
   ```

---

## Tags

Tags are added in post frontmatter:

```yaml
tags:
  - budgeting
  - saving
  - guides
```

- Tag pages are auto-generated at `/blog/tags/tag-name/`
- Tags appear as filter buttons on the blog listing page
- The tag `post` is used internally — don't remove it from `posts.json`

### Current tags in use:
- `spending habits`
- `budgeting`
- `daily expenses`
- `guides`
- `saving`

Feel free to add new tags anytime — pages are created automatically.

---

## Callout Boxes

Use this HTML in your markdown for highlighted tip boxes:

```html
<div class="blog-callout">
  <div class="blog-callout-title">Quick tip</div>
  <div class="blog-callout-body">Your tip text here.</div>
</div>
```

---

## Setting Up Decap CMS on Netlify

The CMS needs Netlify Identity to work. Here's how to set it up:

### Step 1: Enable Netlify Identity

1. Go to your site on [Netlify](https://app.netlify.com)
2. Navigate to **Site settings → Identity**
3. Click **Enable Identity**

### Step 2: Enable Git Gateway

1. Still in Identity settings, scroll to **Services → Git Gateway**
2. Click **Enable Git Gateway**

### Step 3: Invite yourself

1. Go to the **Identity** tab in your Netlify dashboard
2. Click **Invite users**
3. Enter your email address
4. Check your email and accept the invitation

### Step 4: Test it

1. Go to `https://isthisworthmymoney.com/admin/`
2. Log in with the email you invited
3. You should see the CMS dashboard with your posts

---

## Deploying

Your blog deploys automatically with your app on Netlify.

**What happens on deploy:**
1. Netlify runs `npm run build`
2. 11ty processes `src/` → outputs to `_site/`
3. Your app files are copied as-is to `_site/`
4. Blog posts are generated from Markdown → HTML
5. Everything in `_site/` is published

**Your URLs:**
- App: `https://isthisworthmymoney.com/`
- Blog: `https://isthisworthmymoney.com/blog/`
- CMS: `https://isthisworthmymoney.com/admin/`
- Individual post: `https://isthisworthmymoney.com/blog/post-slug/`
- Tag page: `https://isthisworthmymoney.com/blog/tags/tag-name/`

---

## Common Tasks

### Change blog design
Edit `src/blog/css/blog.css`. All blog styles are in this one file.

### Change blog header/footer
Edit `src/_includes/layouts/base.njk`.

### Change how posts look
Edit `src/_includes/layouts/post.njk`.

### Change how the blog listing looks
Edit `src/blog/index.njk`.

### Add a new page to the blog
Create a new `.njk` or `.md` file in `src/blog/` with a permalink:

```yaml
---
layout: base.njk
title: About
permalink: /blog/about/
---
```

---

## Troubleshooting

**Build fails?**
```bash
# Check for errors
npm run build

# Common fix: delete _site and rebuild
rm -rf _site && npm run build
```

**Styles not loading locally?**
Make sure you're accessing via `http://localhost:8080/blog/` (with the trailing slash).

**CMS not loading?**
The CMS only works on the deployed site (not localhost) because it needs Netlify Identity. Make sure you've completed the Netlify Identity setup steps above.

**Posts not showing?**
- Check that the file is in `src/blog/posts/`
- Check that it has the correct frontmatter (especially `date`)
- Make sure it has a `.md` extension
