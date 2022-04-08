const fs = require("fs");
const axios = require("axios");
const jsdom = require("jsdom");

const trueLink = "https://gaixinhchonloc.com/post/";

const aa = [];

async function allProgress() {
  for (let i = 1; i < 150; ++i) {
    await getLink(i);
  }
}

async function getLink(page) {
  const res = await axios.get(`https://gaixinhchonloc.com/page/${page}`);
  const linkArray = getLinkFromHtml(res.data);
  const links = getListLinkFromGirlsCollection(linkArray);
  await Promise.all(links.map((item) => getRealUrlTumblr(item)));
}

function getListLinkFromGirlsCollection(linkArray) {
  const links = [];
  for (var i = 0; i < linkArray.length; i++) {
    linkArray[i].href.includes(trueLink) && links.push(linkArray[i].href);
  }
  return links;
}

function getLinkFromHtml(str) {
  const dom = new jsdom.JSDOM(str);
  const res = dom.window.document.getElementsByTagName("a");
  return res;
}

async function getRealUrlTumblr(url) {
  const response = await axios.get(url);
  const result = response.data.match(
    /data-photo-high="[^#\s]+" data-height-high-res=/
  );
  aa.push(result?.[0].substring(17, 153));
  return result?.[0].substring(17, 153);
}

// allProgress();

const fetchData = async () => {
  await Promise.all(
    aa.map((url, index) => {
      return axios({
        url,
        responseType: "stream",
      }).then((response) =>
        new Promise((resolve, reject) => {
          response.data
            .pipe(fs.createWriteStream(`./images/${index + 1}.png`))
            .on("finish", () => resolve())
            .on("error", (e) => reject(e));
        }).catch((error) => console.log("error :", error))
      );
    })
  );
};

// setTimeout(() => {
//   fetchData();
// }, 10000);
allProgress().then(() => {
    return fetchData()
});
