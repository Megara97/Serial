module.exports = {
  apps: [
    {
      name: "server-scales",
      script: "./dist/index.js",
      watch: true,
      time: true
      //cron_restart: "0 0 * * *",
    }
  ]
};