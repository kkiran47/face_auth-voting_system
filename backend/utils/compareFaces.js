const axios = require("axios");

const FACE_API_KEY = process.env.FACE_API_KEY;
const FACE_API_SECRET = process.env.FACE_API_SECRET;

const compareFacesByUrl = async (url1, url2) => {
  try {
    const res = await axios.post("https://api-us.faceplusplus.com/facepp/v3/compare", null, {
      params: {
        api_key: FACE_API_KEY,
        api_secret: FACE_API_SECRET,
        image_url1: url1,
        image_url2: url2,
      },
    });

    const { confidence } = res.data;
    console.log("Face++ confidence:", confidence);
    return confidence > 75; // Customize the threshold
  } catch (err) {
    console.error("Face++ error:", err?.response?.data || err.message);
    return false;
  }
};

module.exports = compareFacesByUrl;
