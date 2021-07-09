// Put all the javascript code here, that you want to execute in background.
browser.omnibox.setDefaultSuggestion({
  description: "Type the name of the element (Tab, History) and the action you want to do (search, open, duplicate)"
});


const definitions = [{
  element: 'Tab',
  actions: ['create', 'duplicate'],
  callbacks: { create: () => browser.tabs.create({}) },
}]

const keys = ['element', 'actions'];
const fuse = new Fuse(definitions, { keys });
function listener(input, suggest) {
  let res = fuse.search(input);
  console.log(input, res);
  let found = res[0].item;
  let suggestions = found.actions.map((a) => ({ content: `${found.element}.${a}`, description: `${found.element} ${a}` }));
  suggest(suggestions);
}
browser.omnibox.onInputChanged.addListener(listener)

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  let [element, action, rest] = url.split('.');
  console.log(element, action);
  definitions.find((d) => d.element == element).callbacks[action]();
});
