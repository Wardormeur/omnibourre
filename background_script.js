// Put all the javascript code here, that you want to execute in background.
browser.omnibox.setDefaultSuggestion({
  description: "Type the name of the element (Tab, History) and the action you want to do (search, open, duplicate)"
});


const definitions = [{
  name: 'Tab',
  callbacks: [
    {
      name: 'create', 
      fn: () => browser.tabs.create({}),
    },
    { 
      name: 'duplicate',
      fn: async () => {
        const curr = await browser.tabs.query({currentWindow: true, active: true});
        browser.tabs.create({ url: curr[0].url });
      }
    },
    { 
      name: 'close all',
      fn: async () => {
        let tabs = await browser.tabs.query({ currentWindow: true });
        browser.tabs.remove(tabs.map(t => t.id));
      },
    },
    { 
      name: 'close all to the right',
      fn: async () => {
        let tabs = await browser.tabs.query({ currentWindow: true });
        let tab = await browser.tabs.query({ currentWindow: true, active: true });
        let filteredTabs = tabs.filter((_t) => _t.index > tab[0].index)
        browser.tabs.remove(filteredTabs.map(t => t.id));
      },
    },
    { 
      name: 'close all to the left',
      fn: async () => {
        let tabs = await browser.tabs.query({ currentWindow: true });
        let tab = await browser.tabs.query({ currentWindow: true, active: true });
        let filteredTabs = tabs.filter((_t) => _t.index < tab[0].index)
        console.log(filteredTabs);
        browser.tabs.remove(filteredTabs.map(t => t.id));
      },
  }],
}];

function flattenDefinitions(definitions) {
  return definitions.flatMap(element => {
    return element.callbacks.map(rule => {
      rule.element = element.name; 
      return rule;
    });
  });
}

const keys = ['name' , 'element'];
const fuse = new Fuse(flattenDefinitions(definitions), { keys });
function listener(input, suggest) {
  let res = fuse.search(input, { includeScore: true });
  let suggestions = res.map((a) => ({ content: `${a.item.element}-${a.item.name}`, description: `${a.item.name}` }));
  suggest(suggestions);
}
browser.omnibox.onInputChanged.addListener(listener)

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  let [element, action, rest] = url.split('-');
  definitions.find((d) => d.name == element).callbacks.find(c => c.name === action).fn();
});
