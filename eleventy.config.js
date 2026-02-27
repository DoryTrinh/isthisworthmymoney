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
