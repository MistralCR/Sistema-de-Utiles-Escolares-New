const app = require("./app");
// Prefer env var, fallback to 4100 to avoid local conflicts with 4000
const PORT = Number(process.env.PORT) || 4100;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});
