module.exports = {
  layout: "post.njk",
  tags: ["post"],
  lang: "en",
  eleventyComputed: {
    permalink: function(data) {
      var slug = data.customSlug || data.page.fileSlug;
      if (data.lang === "vi") {
        return "/blog/vi/" + slug + "/";
      }
      return "/blog/" + slug + "/";
    }
  }
};
