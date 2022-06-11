export = {
  apps: [{
    name: "punto-aroma-test",
    script: "index.js",
    instances: 1,
    watch: true,
    ignore_watch: ["logs"],
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      "PORT": 3002
    },
  }]
}
