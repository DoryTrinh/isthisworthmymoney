module.exports = {
  layout: "post.njk",
  tags: ["post"],
  lang: "en",
  eleventyComputed: {
    permalink: function(data) {
      var slug = String(data.customSlug || data.page.fileSlug).trim();
      if (data.lang === "vi") {
        return "/blog/vi/" + slug + "/";
      }
      return "/blog/" + slug + "/";
    }
  }
};
