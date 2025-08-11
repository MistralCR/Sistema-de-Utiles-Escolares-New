const axios = require("axios");

async function testAPI() {
  try {
    console.log("Testing /api/niveles endpoint...");

    // Use a valid token from a docente user
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OTRiNDQ2NjZmYzQ5NzRmNGM1ZGUwZSIsInJvbGUiOiJkb2NlbnRlIiwiY2VudHJvIjoiQ29sZWdpbyBTYW4gSXNpZHJvIiwiaWF0IjoxNzM3OTM3NDE4LCJleHAiOjE3Mzc5NDEwMTh9.Fy4pL0NL7GnBFLaGHOXfTwPTElpSRcftNdgfB_nxP-A";

    const response = await axios.get("http://localhost:4000/api/niveles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

testAPI();
