import express from "express";
import ytdl from "ytdl-core";

const app = express();

app.get("/download", async (req, res) => {
  let videoId = req.query.videoId || req.query.v;
  if (videoId.includes("?v=")) {
    const videoIdArray = videoId.split("?v=");
    videoId = videoIdArray[1];
  } else if (videoId.includes("&v=")) {
    const videoIdArray = videoId.split("&v=");
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
    videoTitle = videoInfo.videoDetails.title;
  } catch (error) {
    console.log(error);
    return res.status(500, "Internal Server Error");
  }

  const format = req.query.format || "mp3";
  const filename = `${videoTitle}.${format}`;

  try {
    switch (format) {
      case "mp3":
        res.header("Content-Disposition", `attachment; filename="${filename}"`);
        ytdl(videoUrl, {
          format: "mp3",
          filter: "audioonly",
        }).pipe(res);
        break;
      case "mp4":
        res.header("Content-Disposition", `attachment; filename="${filename}"`);
        ytdl(videoUrl, {
          format: "mp4",
          quality: "highest",
        }).pipe(res);
        break;
      default:
        return res.status(404, "Video not found");
        break;
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

app.listen(3000, () => {
  console.log("Listening on http://127.0.0.1:3000");
});
