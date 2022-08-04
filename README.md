# Anilib

This a local anime streaming platform, that uses [AniList API](https://anilist.gitbook.io/anilist-apiv2-docs/) as anime data source

It was created using next with typescript and tailwind

It's on very early stage so expect to found some bugs >)

You can see the figma prototype [here](https://www.figma.com/file/LqfsWrDChSkTKCXEL0EBQA/Anilib)

## Preview

<img src="https://i.imgur.com/Iic5SOz.png" alt="Screenshot 01" style="height: 350px;"/>

<img src="https://i.imgur.com/1pae2rG.png" alt="Screenshot 02" style="height: 350px;"/>

<img src="https://i.imgur.com/yUsyZ25.png" alt="Screenshot 02" style="height: 350px;"/>

<img src="https://i.imgur.com/lzqL4xi.png" alt="Screenshot 03" style="height: 350px;"/>

## How it works

- You add directories to your library
  - Anilib will understand that each folder of this directory it's an anime
  - It will try to get data from the AniList API based on the folder name
  - Then it will look for every `mp4` or `mkv` files inside of the directories
    - Note that the files can be in subdirectories
    - Every found file its considered an episode
    - If it's a `mkv` file it will try to convert to mp4 and extract its subtitles
- When you finish adding your directories and update your library, you will be able to watch your animes in any device connected to your local network

## How to build

### Install dependencies

- [Node JS](https://nodejs.org/en/download/)
- [FFmpeg](https://ffmpeg.org/)

### Clone the repository

```sh
git clone https://github.com/guilhermeg2k/neofy.git
```

### Create and change a .env.local file as the example

```sh
NEXT_PUBLIC_BASE_API_URL=http://localhost:3000/api
```

### In the project folder install dependencies and build

```sh
npm install
npm run build
```

or

```sh
yarn
yarn build
```

### Start the local server

```sh
npm run start
```

or

```sh
yarn start
```

[MIT License](https://github.com/guilhermeg2k/anilib/blob/main/LICENSE)

Made by Guilherme (~\_^)
