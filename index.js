import express from "express";
import ytdl from "ytdl-core";
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.get("/download", async (req, res) => {
  let videoId = req.query.videoId || req.query.v;
  if (videoId.includes("?v=")) {
    const videoIdArray = videoId.split("?v=");
    videoId = videoIdArray[1];
  } else if (videoId.includes("&v=")) {
    const videoIdArray = videoId.split("&v=");
    videoId = videoIdArray[1];
  } else if (videoId.includes(".be/")) {
    const videoIdArray = videoId.split(".be/");
    videoId = videoIdArray[1];
  }

  let videoUrl;
  try {
    if (ytdl.validateID(videoId)) {
      videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } else {
      return res.status(404).send("Video not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }

  let videoInfo;
  let videoTitle;

  try {
    videoInfo = await ytdl.getInfo(videoUrl);
    videoTitle = videoInfo.videoDetails.title.replace(/[<>:"/\\|?*]/g, "");
    console.log(
      `Downloading ${videoUrl} (${videoId}) with title ${videoTitle}...`
    );
  } catch (error) {
    console.log(error);
    return res.status(500, "Internal Server Error");
  }

  const format = req.query.format || "mp3";

  try {
    switch (format) {
      // MP3
      case "mp3":
        let audioStream = new PassThrough();

        res.header(
          "Content-Disposition",
          `attachment; filename="YTDL-${Date.now()}.mp3"`
        );
        res.header("Content-Type", "audio/mpeg");

        console.log("Starting ffmpeg...");
        console.log(videoInfo.videoDetails);

        ffmpeg(ytdl(videoUrl, { filter: "audioonly", quality: "highest" }))
          .audioBitrate(128)
          .audioChannels(2)
          .audioCodec("libmp3lame")
          .format("mp3")
          .outputOptions([
            "-metadata",
            `title=${videoTitle}`,
            "-metadata",
            `artist=${videoInfo.videoDetails.author.user}`,
          ])
          .on("error", (err) => {
            console.log(err);
            return res.status(500, "Internal Server Error");
          })
          .on("end", () => {
            console.log("Finished");
          })
          .on("progress", (progress) => {
            console.log(progress.timemark);
          })
          .pipe(audioStream, { end: true });
        audioStream.pipe(res);
        break;

      // MP4
      case "mp4":
        let videoStream = new PassThrough();

        res.header(
          "Content-Disposition",
          `attachment; filename="YTDL-${Date.now()}.mp4"`
        );
        ytdl(videoUrl, { quality: "highest" })
          .on("progress", (chunkLength, downloaded, total) => {
            const percent = downloaded / total;
            console.log(Math.floor(percent * 100) + "%");
          })
          .on("error", (err) => {
            console.log(err);
            return res.status(500, "Internal Server Error");
          })
          .on("end", () => {
            console.log("Finished");
          })
          .pipe(videoStream, { end: true });
        videoStream.pipe(res);
        break;
      default:
        return res.status(404, "Video not found");
    }
  } catch (error) {
    return res.status(404, "Video not found");
  }
});

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Youtube Downloader</title>
    </head>
    <body>
      <h1>Youtube Downloader</h1>
      <div id="form-wrapper">
        <form action="/download" method="GET">
          <input type="text" name="videoId" placeholder="Video ID" required/>
          <select name="format">
            <option value="mp3">MP3</option>
            <option value="mp4">MP4</option>
          </select>
          <button type="submit">Download</button>
        </form>
      </div>
    </body>
    <style>
      html {
        font-family: sans-serif;
        overflow: hidden;
      }
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      h1 {
        margin: 0;
      }
      #form-wrapper {
        width: 100%;
        max-width: 500px;
        margin-top: 1rem;
      }
      form {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: 40px;
      }
      input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        margin-right: 0.5rem;
        height: 20px;
        border: 2px solid #ccc;
        outline: none;
      }
      select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        margin-right: 0.5rem;
        outline: none;
        height: 100%;
        border: 2px solid #ccc;
      }
      button {
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        background-color: #fff;
        cursor: pointer;
        height: 100%;
        border: 2px solid #ccc;
      }
    </style>
  </html>
`);
});

if (process.env.HTTPS === "true") {
  const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  };

  if (!options.key || !options.cert) {
    console.log(
      "Key or certificate not found in current directory. Please add key.pem and cert.pem to the current directory."
    );
    process.exit(1);
  }

  https.createServer(options, app).listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
} else {
  app.listen(port, () => {
    console.log("Listening on port " + port);
  });
}
