// Put all the javascript code here, that you want to execute in background.
browser.omnibox.setDefaultSuggestion({
  description: "Type the name of the element (Tab, History) and the action you want to do (search, open, duplicate)"
});


const definitions = [{
  element: 'Tab',
  actions: ['create', 'duplicate', 'close all', 'close right', 'close left'],
  callbacks: {
    create: () => browser.tabs.create({}),
    duplicate: async () => {
      const curr = await browser.tabs.query({currentWindow: true, active: true});
      browser.tabs.create({ url: curr[0].url });
    },
    'close all': async () => {
      let tabs = await browser.tabs.query({ currentWindow: true });
      browser.tabs.remove(tabs.map(t => t.id));
    },
    'close right': async () => {
      let tabs = await browser.tabs.query({ currentWindow: true });
      let tab = await browser.tabs.query({ currentWindow: true, active: true });
      let filteredTabs = tabs.filter((_t) => _t.index > tab[0].index)
      browser.tabs.remove(filteredTabs.map(t => t.id));
    },
    'close left': async () => {
      let tabs = await browser.tabs.query({ currentWindow: true });
      let tab = await browser.tabs.query({ currentWindow: true, active: true });
      let filteredTabs = tabs.filter((_t) => _t.index < tab[0].index)
      console.log(filteredTabs);
      browser.tabs.remove(filteredTabs.map(t => t.id));
    },
  },
}]

const keys = ['element', 'actions'];
const fuse = new Fuse(definitions, { keys });
function listener(input, suggest) {
  let res = fuse.search(input, { includeScore: true });
  let found = res[0].item;
  let suggestions = found.actions.map((a) => ({ content: `${found.element}.${a}`, description: `${found.element} ${a}` }));
  suggest(suggestions);
}
browser.omnibox.onInputChanged.addListener(listener)

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  let [element, action, rest] = url.split('.');
  definitions.find((d) => d.element == element).callbacks[action]();
});
