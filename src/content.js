const cache_seconds = 30;
const cache = {};

const createEl = (parent, type, className) => {
  const el = document.createElement(type);
  el.className = className;
  if (parent) {
    parent.appendChild(el);
  }
  return el;
};

async function sendMessage(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(data, resolve);
  });
}

async function getTicketInfo(id) {
  if (
    cache[id] &&
    cache[id].time &&
    cache[id].time > Date.now() &&
    cache[id].data
  ) {
    return cache[id].data;
  }

  const result = await sendMessage({ query: "getTicketInfo", id });
  if (result && result.errors) {
    throw new Error(result.errorMessages);
  }
  // console.log(result);

  cache[id] = {
    time: Date.now() + cache_seconds * 1000,
    data: result.fields,
  };

  return result.fields;
}

async function run() {
  // https://celerative.atlassian.net/browse/CORE-3232

  try {
    const sess = await sendMessage({ query: "getSession" });
    // console.log(sess);

    async function repeat() {
      setTimeout(async function () {
        const anchors = document.getElementsByClassName("notion-link-token");
        for (const anchor of anchors) {
          const href = anchor.getAttribute("href");
          if (href.indexOf("atlassian.net/browse") > -1) {
            if (anchor.getElementsByClassName("NJL").length == 0) {
              const id = /atlassian.net\/browse\/(.*)/.exec(href)[1];
              const info = await getTicketInfo(id);
              // console.log(info);

              const node = createEl(null, "span", "NJL");
              const node_icon = createEl(node, "img", "NJL-icon");
              const node_text = createEl(node, "span", "NJL-text");
              const node_status = createEl(node, "span", "NJL-status");

              node_icon.setAttribute("src", info.issuetype.iconUrl);
              node_text.setAttribute("data-content", `${id}: ${info.summary}`);
              node_status.setAttribute("data-content", info.status.name);
              node_status.setAttribute(
                "style",
                `background-color: ${info.status.statusCategory.colorName}`
              );

              anchor.prepend(node);
            }
          }
        }
        repeat();
      }, 100);
    }
    repeat();
  } catch (e) {
    console.log(e);
    console.error(`You are not logged in to Jira - Please login.`);
  }
}
run();
