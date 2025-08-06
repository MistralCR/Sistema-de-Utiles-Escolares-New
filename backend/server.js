const app = require("./app");
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});
