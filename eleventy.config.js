module.exports = function(eleventyConfig) {

  // Pass through the existing app files as-is (no processing)
  // These are outside src/, so we use object syntax { "source": "destination" }
  eleventyConfig.addPassthroughCopy({ "index.html": "index.html" });
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "locales": "locales" });
  eleventyConfig.addPassthroughCopy({ "Images": "Images" });
  eleventyConfig.addPassthroughCopy({ "embed": "embed" });

  // Pass through blog CSS and images
  eleventyConfig.addPassthroughCopy("src/blog/css");
  eleventyConfig.addPassthroughCopy("src/blog/images");

  // Pass through Decap CMS admin files
  eleventyConfig.addPassthroughCopy("src/admin");

  // Create a "posts" collection from the blog/posts folder
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/posts/*.md").sort(function(a, b) {
      return b.date - a.date; // newest first
    });
  });

  // Create a collection of all unique tags (excluding internal tags)
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    var tagSet = new Set();
    collectionApi.getAll().forEach(function(item) {
      if (item.data.tags) {
        item.data.tags.forEach(function(tag) {
          if (tag !== "post") {
            tagSet.add(tag);
          }
        });
      }
    });
    return Array.from(tagSet).sort();
  });

  // Create paginated tag pages (6 posts per page per tag)
  eleventyConfig.addCollection("paginatedTagPages", function(collectionApi) {
    var PAGE_SIZE = 6;
    var posts = collectionApi.getFilteredByGlob("src/blog/posts/*.md").sort(function(a, b) {
      return b.date - a.date;
    });
    var tags = {};
    posts.forEach(function(post) {
      if (post.data.tags) {
        post.data.tags.forEach(function(tag) {
          if (tag !== "post") {
            if (!tags[tag]) tags[tag] = [];
            tags[tag].push(post);
          }
        });
      }
    });
    var pages = [];
    Object.keys(tags).sort().forEach(function(tag) {
      var tagPosts = tags[tag];
      var totalPages = Math.ceil(tagPosts.length / PAGE_SIZE);
      for (var i = 0; i < totalPages; i++) {
        pages.push({
          tag: tag,
          slug: tag.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
          pageNumber: i,
          totalPages: totalPages,
          totalPosts: tagPosts.length,
          posts: tagPosts.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
        });
      }
    });
    return pages;
  });

  // Shortcode to output current year
  eleventyConfig.addShortcode("year", function() {
    return new Date().getFullYear().toString();
  });

  // Date formatting filter
  eleventyConfig.addFilter("readableDate", function(dateObj) {
    var months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var d = new Date(dateObj);
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  });

  // Filter to get posts by tag
  eleventyConfig.addFilter("filterByTag", function(posts, tag) {
    return posts.filter(function(post) {
      return post.data.tags && post.data.tags.indexOf(tag) !== -1;
    });
  });

  // Excerpt filter — first 160 chars of content
  eleventyConfig.addFilter("excerpt", function(content) {
    if (!content) return "";
    var text = content.replace(/<[^>]+>/g, ""); // strip HTML
    return text.length > 160 ? text.substring(0, 160) + "..." : text;
  });

  // Filter to add IDs to h2/h3 headings (for TOC linking)
  eleventyConfig.addFilter("addHeadingIds", function(content) {
    if (!content) return content;
    return content.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, function(match, level, attrs, text) {
      if (attrs.indexOf("id=") !== -1) return match;
      var plainText = text.replace(/<[^>]+>/g, "");
      var id = plainText.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      return "<h" + level + attrs + ' id="' + id + '">' + text + "</h" + level + ">";
    });
  });

  // Filter to generate TOC HTML from content headings
  eleventyConfig.addFilter("toc", function(content) {
    if (!content) return "";
    var headings = [];
    var regex = /<h([23])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h[23]>/gi;
    var match;
    while ((match = regex.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]+>/g, "")
      });
    }
    if (headings.length < 2) return "";
    var html = '<nav class="toc-nav"><p class="toc-title">Contents</p><ul class="toc-list">';
    headings.forEach(function(h) {
      var sub = h.level === 3 ? ' class="toc-sub"' : "";
      html += "<li" + sub + '><a href="#' + h.id + '">' + h.text + "</a></li>";
    });
    html += "</ul></nav>";
    return html;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"]
  };
};
