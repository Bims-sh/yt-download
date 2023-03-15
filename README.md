# yt-download

Simple Youtube Downloader using express.js, ffmpeg and ytdl-core

> :warning: This program is for personal use only.  
> Downloading copyrighted material without permission is against [YouTube's terms of services](https://www.youtube.com/static?template=terms).
> By using this program, you are solely responsible for any copyright violations.
> I am not responsible for people who attempt to use this program in any way that breaks YouTube's terms of services.


## Requirements
- Node.js
- git

## Setup

1. #### Clone the repository

```bash
git clone https://github.com/DasIschBims/yt-download
```

2. #### Go into the directory, then install packages

```bash
npm install
```

3. #### Setup env variables inside .env.example

- Rename the ``.env.example`` file to ``.env``
- Change any of the settings if needed

Defaults are:
```
HTTPS=false
PORT=3000
```

4. #### Run with npm

```bash
npm run start
```

5. #### Go to the website inside your browser

If no changes were made to the .env variables the page can be found under [http://localhost:3000](http://localhost:3000)
