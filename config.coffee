module.exports = config:
  paths:
    "watched": ["client", "vendor"]
    "public": "public"
  files:
    javascripts:
      joinTo:
        'js/client.js': /^client/
        'js/vendor.js': /^vendor/
 
  server:
    run: yes
    port: 9192
 
  plugins:
    autoReload:
      port: 9193
    uglify:
      mangle: false