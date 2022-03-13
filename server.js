const fs = require("fs");
const { Client, LegacySessionAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const rmeme = require("rmeme");
const randomanime = require("random-anime");
const mime = require("mime-types");
const meme1Cak = require("1cak");
const katopack = require("kato-pack");

// Path where the session data will be stored
const SESSION_FILE_PATH = "./session-subaru.json";

// Load the session data if it has been previously saved
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
  authStrategy: new LegacySessionAuth({
    puppeteer: { args: ["--no-sandbox"] },
    ffmpeg: "./ffmpeg",
    session: sessionData,
  }),
});

// Save session values to the file upon successful auth
client.on("authenticated", (session) => {
  sessionData = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    if (err) {
      console.error(err);
    }
  });
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", async (msg) => {
  if (msg.body == "!help") {
    msg.reply(
      "> Kirim gambar untuk sticker(support video/gif) \n> *!memegb* untuk random meme global(english)\n> *!memeid* untuk random meme indo \n \nApabila bot tidak merespon, kemungkinan server down atau dimatikan \nJam online 06.00 - 18.00 "
    );
  }

  if (msg.body == "!memegb") {
    const ImageUrl = await rmeme.meme();
    // console.log(ImageUrl);
    const memeImage = await MessageMedia.fromUrl(ImageUrl);
    client.sendMessage(msg.from, msg.reply(await memeImage));
  }

  // if (msg.body == "!memeid") {
  //   const memeIdJSOn = await meme1Cak.GetPostID();
  //   const memeId = JSON.parse(memeIdJSOn);
  //   const memeIdImg = memeId.img;
  //   console.log(memeIdImg);
  //   const memeIdImage = await MessageMedia.fromUrl(memeIdImg);
  //   client.sendMessage(msg.from, msg.reply(await memeIdImage));
  // }

  if (msg.body === "!memeid") {
    const query = "meme"; // const query = 'quote'
    const imgURL = await katopack.Pack(query);
    const memeImg = await MessageMedia.fromUrl(imgURL);
    client.sendMessage(msg.from, msg.reply(await memeImg));
  }

  if (msg.body == "!anime") {
    const AnimeUrl = await randomanime.anime();
    console.log(AnimeUrl);
    const animeImg = await MessageMedia.fromUrl(AnimeUrl);
    client.sendMessage(msg.from, msg.reply(await animeImg));
  }

  if (msg.hasMedia) {
    msg.downloadMedia().then((media) => {
      if (media) {
        const mediaPath = "./downloaded-media/";

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }

        const extension = mime.extension(media.mimetype);

        const filename = new Date().getTime();

        const fullFilename = mediaPath + filename + "." + extension;
        // Save to file
        try {
          fs.writeFileSync(fullFilename, media.data, { encoding: "base64" });
          console.log("File downloaded successfully!", fullFilename);
          console.log(fullFilename);
          MessageMedia.fromFilePath((filePath = fullFilename));
          client.sendMessage(
            msg.from,
            new MessageMedia(media.mimetype, media.data, filename),
            {
              sendMediaAsSticker: true,
              stickerAuthor: "Created By Subaru",
              stickerName: "Stickers",
            }
          );
          fs.unlinkSync(fullFilename);
          console.log(`File Deleted successfully!`);
        } catch (err) {
          console.log("Failed to save the file:", err);
          console.log(`File Deleted successfully!`);
        }
      }
    });
  }

  // if (msg.body.toLowerCase() == "!waifu") {
  //   const mediaPath = "./waifu/";
  //   const extension = mime.extension(mimetype);

  //   let filename = Math.floor(Math.random() * 50 + 1);

  //   const fullFilename = mediaPath + filename + "." + extension;
  //   MessageMedia.fromFilePath((filePath = fullFilename));
  //   client.sendMessage(
  //     msg.from,
  //     new MessageMedia("image/jpg", _base64.data, filename)
  //   );
  // }
});

client.on("ready", () => {
  console.log("Client ready!");
});

client.initialize();
