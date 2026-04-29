const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// සර්වර් එක වැඩද කියලා බලන්න
app.get("/", (req, res) => res.send("SenuzVid Reviactly Engine v60 🚀"));

// 1. VIDEO DETAILS API (Thumbnail සහ Title සඳහා)
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            if (r.data.data) {
                return res.json({
                    title: r.data.data.title || "TikTok Video",
                    thumbnail: r.data.data.cover
                });
            }
        }
        // FB, YT සහ අනෙකුත් ඒවා සඳහා Default
        res.json({
            title: "Video Found",
            thumbnail: "https://files.catbox.moe/1dlcmm.jpg"
        });
    } catch (e) {
        res.json({ title: "Video Ready", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    }
});

// 2. MAIN DOWNLOAD API (සියලුම Platform සඳහා)
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).send("URL missing");

    const cleanUrl = url.split('?')[0];

    try {
        // --- TikTok Logic ---
        if (cleanUrl.includes("tiktok.com")) {
            const tk = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
            if (tk.data.data) {
                const link = quality === "audio" ? tk.data.data.music : tk.data.data.play;
                return res.redirect(link);
            }
        }

        // --- FB, YT, IG Logic (Using Cobalt & Vkr Hybrid) ---
        try {
            const vkr = await axios.get(`https://api.vkrdown.com/server/wrapper.php?url=${encodeURIComponent(cleanUrl)}`);
            if (vkr.data && vkr.data.data) {
                const d = vkr.data.data;
                const dl = (quality === "audio") ? d.audio : (d.hd || d.url || d.mp4);
                if (dl) return res.redirect(dl);
            }
        } catch (err) { console.log("VKR Method failed, trying Cobalt..."); }

        // Fallback: Cobalt API
        const cobalt = await axios.post('https://api.cobalt.tools/', {
            url: cleanUrl,
            videoQuality: quality || "720",
            downloadMode: quality === "audio" ? "audio" : "video"
        }, { headers: { 'Accept': 'application/json' }});

        if (cobalt.data.url) return res.redirect(cobalt.data.url);

        throw new Error("Download failed");

    } catch (e) {
        res.status(500).send("බාගත කිරීමේ ගැටලුවකි. වෙනත් ලින්ක් එකක් උත්සාහ කරන්න.");
    }
});

// Reviactly විසින් ලබාදෙන PORT එකට සෙට් කිරීම
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Engine Running on port ${PORT}`));
