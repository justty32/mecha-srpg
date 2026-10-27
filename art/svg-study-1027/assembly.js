/* 純配方／組裝規則；不讀DOM、不下載，不改遊戲資料。 */
(() => {
  'use strict';
  const hex = /^#[0-9a-f]{6}$/i;
  function recipeFromPreset(library, key) {
    const preset = library.presets[key];
    if (!preset) throw new Error('未知預設');
    return { family: library.family, parts: { ...preset.parts }, colors: {} };
  }
  function assemble(library, recipe) {
    if (recipe.family !== library.family) throw new Error('不相容的比例族');
    const colors = { ...(recipe.colors || {}) };
    for (const [from, to] of Object.entries(colors)) if (!hex.test(from) || !hex.test(to)) throw new Error('色彩只接受六位HEX');
    if (recipe.fallback) {
      const fallback = library.fallbacks?.[recipe.fallback];
      if (!fallback || !/^[a-z0-9-]+\.svg$/.test(fallback.src)) throw new Error('未知完整立繪');
      if (Object.keys(colors).length) throw new Error('完整立繪不支援部件重配色');
      return { kind: 'fallback', family: library.family, src: fallback.src, label: fallback.label };
    }
    if (Object.keys(recipe.parts || {}).length !== library.layers.length) throw new Error('缺少或多餘部件');
    const layers = library.layers.map(layer => {
      const id = recipe.parts[layer];
      const option = library.options[layer].find(item => item.id === id);
      if (!option) throw new Error(`無效部件 ${layer}`);
      if (option.family && option.family !== library.family) throw new Error('部件不相容');
      return { layer, id };
    });
    return { kind: 'parts', family: library.family, viewBox: library.viewBox, anchors: library.anchors, layers, colors };
  }
  function swapParts(library, recipe, changes) {
    const next = { ...recipe, fallback: undefined, parts: { ...recipe.parts, ...changes } };
    assemble(library, next);
    return next;
  }
  function mixTwo(library, recipe) {
    const changes = {};
    for (const layer of library.layers.filter(key => library.options[key].length > 1).slice(0, 2)) {
      const options = library.options[layer];
      const index = options.findIndex(option => option.id === recipe.parts[layer]);
      changes[layer] = options[(index + 1) % options.length].id;
    }
    return swapParts(library, recipe, changes);
  }
  function recolor(value, colors) {
    const entry = Object.entries(colors).find(([from]) => from.toLowerCase() === value.toLowerCase());
    return entry ? entry[1] : value;
  }
  globalThis.Assembly = { recipeFromPreset, assemble, swapParts, mixTwo, recolor };
})();
