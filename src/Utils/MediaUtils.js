import CryptoJS from "crypto-js";

export const findCurrentEpisode = (seasons, currentMediaId) => {
  for (const season of seasons || []) {
    for (const episode of season.episodes || []) {
      if (episode.mediaID === currentMediaId) {
        return episode;
      }
    }
  }
  return null;
};

export const DecryptAESString = (encrypted) => {
  const key = "K@bleOnE1736!@KAblEOnE1736!1NA#A";
  const iv = "K@bleOnE1736!@!#";

  const decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};