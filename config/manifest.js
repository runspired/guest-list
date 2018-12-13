/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  // See https://github.com/san650/ember-web-app#documentation for a list of
  // supported properties

  return {
    name: "guest-list",
    short_name: "guest-list",
    description: "",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
    ],
    ms: {
      tileColor: '#fff'
    },
    icons: [
      {
        src: "/guest-list/images/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/guest-list/images/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/guest-list/images/icon-2000-transparent.png",
        sizes: "2000x2000",
        type: "image/png"
      }
    ]
  };
}
