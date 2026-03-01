module.exports = {
  layout: "post.njk",
  tags: ["post"],
  lang: "en",
  eleventyComputed: {
    permalink: function(data) {
      if (data.lang === "vi") {
        return "/blog/vi/" + data.page.fileSlug + "/";
      }
      return "/blog/" + data.page.fileSlug + "/";
    }
  }
};
