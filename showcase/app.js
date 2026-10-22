'use strict';
(() => {
  const C = window.MenuCatalog;
  const D = window.MenuDomain;
  const A = window.MenuAnalytics;
  const main = document.getElementById('main');
  const simple = ['cuisine', 'dish', 'customize', 'sides', 'treats', 'review'];
  const impossible = ['cuisine', 'category', 'dish', 'portion', 'ingredients', 'substitution', 'bread', 'cheese', 'cooking', 'spice', 'extras', 'sides', 'beverage', 'dessert', 'review'];
  const titles = {
    cuisine: 'Where shall we begin?', category: 'One more way to narrow it down.',
    dish: 'Choose your main event.', customize: 'Make it yours.', portion: 'How much is just right?',
    ingredients: 'Every ingredient. Every quantity.', substitution: 'Rethink the protein.',
    bread: 'Keep the bread?', cheese: 'A cheesy decision.', cooking: 'Leave it to the kitchen?',
    spice: 'Find your level of heat.', extras: 'Perhaps a little extra?', sides: 'Something on the side?',
    treats: 'A sip. A sweet. Or neither.', beverage: 'Pause for a drink.', dessert: 'Room for something sweet?',
    review: 'Your choices, all together.',
  };
  let mode = 'simple';
  let order = D.empty();
  let stageIndex = 0;
  let view = 'home';
  let notices = [];
  let result = null;
  let occurrence = 0;
  const displayed = new Set();
  const steps = () => mode === 'simple' ? simple : impossible;
  const stage = () => steps()[stageIndex];
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(text, action, className) {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function focusMain() {
    main.focus();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function countDisplays(group, ids) {
    if (view !== 'order') return;
    for (const id of ids) {
      const token = `${occurrence}:${group}:${id}`;
      if (!displayed.has(token)) { displayed.add(token); A.record('optionsShown'); }
    }
  }
  function update(key, value) {
    const previous = JSON.stringify(order);
    const resolved = D.change(order, key, value);
    order = resolved.order;
    notices = resolved.conflicts;
    if (previous !== JSON.stringify(order)) {
      A.record('actions');
      A.record('changes');
    }
    A.record('conflicts', notices.length);
    renderOrder(false);
  }
  function choices(parent, label, key, options, multi = false) {
    const group = el('fieldset');
    group.append(el('legend', label));
    const grid = el('div', undefined, mode === 'impossible' ? 'choices dense' : 'choices');
    countDisplays(key, options.map(option => option.id));
    for (const option of options) {
      const selected = multi ? order[key].includes(option.id) : order[key] === option.id;
      const node = button('', () => {
        const value = multi ? (selected ? order[key].filter(id => id !== option.id) : [...order[key], option.id]) : option.id;
        update(key, value);
        const replacement = main.querySelector(`[data-choice="${key}:${option.id}"]`);
        replacement?.focus();
      }, 'choice');
      node.dataset.choice = `${key}:${option.id}`;
      node.setAttribute('aria-pressed', String(selected));
      node.append(el('strong', option.name));
      if (option.description) node.append(el('small', option.description));
      if (option.price !== undefined) node.append(el('small', `${D.money(option.price)} · ${option.calories} kcal (illustrative)`));
      if (option.dietary) node.append(el('small', option.dietary.join(' · ') || 'No dietary labels'));
      grid.append(node);
    }
    group.append(grid);
    parent.append(group);
  }
  function select(parent, label, key, values, detail = '') {
    const wrapper = el('div', undefined, 'field');
    const id = `field-${key}`;
    const lab = el('label', label);
    lab.htmlFor = id;
    if (detail) lab.append(el('small', detail));
    const control = el('select');
    control.id = id;
    for (const value of values) {
      const option = el('option', String(value));
      option.value = String(value);
      option.selected = String(order[key]) === String(value);
      control.append(option);
    }
    countDisplays(key, values);
    control.addEventListener('change', () => {
      update(key, typeof order[key] === 'number' ? Number(control.value) : control.value);
      document.getElementById(id)?.focus();
    });
    wrapper.append(lab, control);
    parent.append(wrapper);
  }
  const optional = list => [{ id: '', name: 'None — skip this', description: 'No charge, no obligation.' }, ...list];
  function customize(parent, which) {
    const dish = D.dishFor(order);
    if (!dish) { parent.append(el('p', 'Choose a dish first.')); return; }
    if (which === 'customize' || which === 'portion') {
      choices(parent, 'Main portion', 'portion', [
        { id: 'small', name: 'Small · ¾ portion' }, { id: 'regular', name: 'Regular · 1 portion' }, { id: 'large', name: 'Large · 1½ portions' },
      ]);
    }
    if (which === 'customize' || which === 'ingredients') {
      parent.append(el('p', 'The base includes one unit of every ingredient. Adjustments use (quantity − 1) × unit value, then scale with the main portion.'));
      for (const item of dish.ingredients) {
        const wrapper = el('div', undefined, 'field');
        const label = el('label', item.name);
        const id = `quantity-${item.id}`;
        label.htmlFor = id;
        label.append(el('small', `Per unit: ${D.money(item.price)} · ${item.calories} kcal`));
        const control = el('select');
        control.id = id;
        for (const quantity of C.quantities) {
          const option = el('option', `${quantity}×${quantity === 1 ? ' (included)' : ''}`);
          option.value = String(quantity);
          option.selected = (order.quantities[item.id] ?? 1) === quantity;
          control.append(option);
        }
        countDisplays(id, C.quantities);
        control.addEventListener('change', () => {
          update('quantities', { ...order.quantities, [item.id]: Number(control.value) });
          document.getElementById(id)?.focus();
        });
        wrapper.append(label, control);
        parent.append(wrapper);
      }
    }
    if (which === 'customize' || which === 'substitution') {
      choices(parent, 'Replace the first protein ingredient at its selected quantity', 'substitution',
        [{ id: '', name: 'Original protein' }, ...D.substitutions(dish)]);
      if (!D.substitutions(dish).length) parent.append(el('p', 'This dish has no primary protein substitution. You can continue.'));
    }
    if (which === 'bread') select(parent, 'Bread preference', 'bread', ['Keep bread', 'No bread'], 'Only listed bread ingredients are removed; wheat noodles and pastry remain.');
    if (which === 'cheese') select(parent, 'Cheese preference', 'cheese', ['Keep cheese', 'No cheese'], 'Removes cheese, not all dairy.');
    if (which === 'cooking') select(parent, 'Cooking preference', 'cooking', ['Kitchen default', 'Grilled', 'Roasted', 'Steamed'], 'Mock preference only; no price or nutrition change.');
    if (which === 'spice') select(parent, 'Spice level', 'spice', ['Mild', 'Medium', 'Hot', 'Very hot'], 'Mock preference only; no price or nutrition change.');
    if (which === 'customize' || which === 'extras') choices(parent, 'Extras — additions, not a second base copy', 'extras', C.extras, true);
  }
  function sides(parent) {
    const wrapper = el('div', undefined, 'field');
    const label = el('label', 'Combo: fixed fries side (same illustrative price as fries)');
    label.htmlFor = 'combo';
    const control = el('input');
    control.type = 'checkbox';
    control.id = 'combo';
    control.checked = order.combo;
    countDisplays('combo', ['yes', 'no']);
    control.addEventListener('change', () => { update('combo', control.checked); document.getElementById('combo')?.focus(); });
    wrapper.append(label, control);
    parent.append(wrapper);
    if (order.combo) parent.append(el('p', 'Fries are included once. Turn combo off to choose an individual side.'));
    else choices(parent, 'Optional side', 'side', optional(C.sides));
  }
  function treats(parent, which) {
    if (which !== 'dessert') {
      choices(parent, 'Optional beverage (Small base price shown)', 'beverage', optional(C.beverages));
      if (order.beverage) {
        select(parent, 'Drink size', 'size', ['Small', 'Medium', 'Large'], 'Each size step adds $0.65; drink totals do not scale with the main.');
        if (mode === 'impossible') select(parent, 'Ice preference', 'ice', ['Regular', 'Less', 'No ice'], 'Mock preference; no nutrition change.');
      }
    }
    if (which !== 'beverage') {
      choices(parent, 'Optional dessert', 'dessert', optional(C.desserts));
      if (order.dessert) {
        select(parent, 'Dessert portion', 'dessertPortion', [0.5, 1, 1.5]);
        if (mode === 'impossible') select(parent, 'Dessert topping', 'topping', ['None', 'Chocolate sauce'], 'Sauce adds $0.75 and 60 kcal, scaled by dessert portion. Contains milk.');
      }
    }
  }
  function summary() {
    const panel = el('aside', undefined, 'panel summary');
    panel.setAttribute('aria-label', 'Running order summary');
    panel.append(el('div', 'YOUR MOCK ORDER', 'eyebrow'), el('h2', D.dishFor(order)?.name || 'Nothing chosen yet'));
    const totals = D.calculate(order);
    const live = el('div');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.append(el('div', D.money(totals.price), 'total'), el('p', `${totals.calories} kcal · illustrative`));
    panel.append(live);
    const dl = el('dl');
    for (const [label, value] of [['Main price change', D.money(totals.priceDelta)], ['Main kcal change', `${totals.calorieDelta}`], ['Portion', order.portion], ['Side', C.sides.find(i => i.id === order.side)?.name || 'None']]) {
      dl.append(el('dt', label), el('dd', value));
    }
    panel.append(dl, el('p', 'Mock prices and nutrition. Not allergy advice. No tax, delivery, real kitchen, or payment.', 'note'));
    return panel;
  }
  function review(parent) {
    const dish = D.dishFor(order);
    if (!dish) return;
    parent.append(el('h2', dish.name), el('p', `${dish.cuisine} · ${dish.category}`));
    const list = el('ul');
    const protein = D.substitutions(dish).find(i => i.id === order.substitution);
    const rows = [
      `Main portion: ${order.portion}`,
      ...dish.ingredients.map(i => `${i.name}: ${order.quantities[i.id] ?? 1}×`),
      `Protein replacement: ${protein?.name || 'None'} (first protein only)`,
      `Extras: ${C.extras.filter(i => order.extras.includes(i.id)).map(i => i.name).join(', ') || 'None'}`,
      `Side: ${C.sides.find(i => i.id === order.side)?.name || 'None'}${order.combo ? ' (combo)' : ''}`,
      `Drink: ${C.beverages.find(i => i.id === order.beverage)?.name || 'None'}${order.beverage ? ` · ${order.size}` : ''}`,
      `Dessert: ${C.desserts.find(i => i.id === order.dessert)?.name || 'None'}${order.dessert ? ` · ${order.dessertPortion}× · ${order.topping}` : ''}`,
    ];
    if (mode === 'impossible') rows.push(`Preferences: ${order.bread}, ${order.cheese}, ${order.cooking}, ${order.spice}; ice: ${order.ice}`);
    rows.forEach(row => list.append(el('li', row)));
    parent.append(list, el('p', `Base-recipe allergens (not updated dietary advice): ${dish.allergens.join(', ') || 'None listed'}. Substitutions and extras may add allergens. ${dish.restrictions}`, 'note'));
  }
  function goto(index) {
    if (index < stageIndex) A.record('backtracks');
    stageIndex = index;
    occurrence++;
    notices = [];
    renderOrder();
  }
  function renderOrder(moveFocus = true) {
    if (!A.running()) return;
    view = 'order';
    main.replaceChildren();
    const progress = el('div', undefined, 'progress-row');
    progress.append(el('span', `${mode === 'simple' ? 'Simple' : 'Impossible'} · Step ${stageIndex + 1} of ${steps().length}`, 'eyebrow'),
      button('Exit experiment', () => confirmDialog('Leave this experiment?', 'This records a deliberate abandonment, not a completed order.', 'Leave experiment', () => {
        result = A.finish('abandoned');
        if (!result) return;
        view = 'debrief'; renderDebrief(); focusMain();
      }), 'quiet'));
    const bar = el('progress');
    bar.max = steps().length;
    bar.value = stageIndex + 1;
    bar.setAttribute('aria-label', 'Ordering progress');
    main.append(progress, bar);
    const nav = el('ol', undefined, 'steps');
    steps().forEach((step, index) => {
      const item = el('li', `${index + 1} ${step}`);
      if (index === stageIndex) item.setAttribute('aria-current', 'step');
      nav.append(item);
    });
    main.append(nav);
    const layout = el('div', undefined, 'layout');
    const panel = el('section', undefined, 'panel');
    panel.append(el('h1', titles[stage()]));
    for (const notice of notices) {
      const node = el('div', notice.message, 'notice');
      node.setAttribute('role', 'status');
      const destination = mode === 'simple' && notice.stage !== 'sides' ? 'customize' : notice.stage;
      node.append(button('Revisit affected choices', () => goto(steps().indexOf(destination)), 'quiet'));
      panel.append(node);
    }
    if (stage() === 'cuisine') choices(panel, 'Choose a cuisine', 'cuisine', C.cuisines.map(name => ({ id: name, name, description: '10 mock dishes to explore' })));
    else if (stage() === 'category') choices(panel, 'Choose a category', 'category', [...new Set(C.dishes.filter(d => d.cuisine === order.cuisine).map(d => d.category))].map(name => ({ id: name, name })));
    else if (stage() === 'dish') choices(panel, 'Choose a dish', 'dishId', C.dishes.filter(d => d.cuisine === order.cuisine && (!order.category || d.category === order.category)));
    else if (stage() === 'sides') sides(panel);
    else if (['treats', 'beverage', 'dessert'].includes(stage())) treats(panel, stage());
    else if (stage() === 'review') review(panel);
    else customize(panel, stage());
    const error = el('div');
    error.id = 'validation';
    const actions = el('div', undefined, 'actions');
    const back = button('Back', () => goto(stageIndex - 1));
    back.disabled = stageIndex === 0;
    actions.append(back, button(stage() === 'review' ? 'Complete mock order' : 'Continue', () => {
      const required = { cuisine: 'cuisine', category: 'category', dish: 'dishId' }[stage()];
      if (required && !order[required]) {
        error.textContent = `Please choose a ${stage()} before continuing.`;
        error.className = 'error';
        error.setAttribute('role', 'alert');
        error.tabIndex = -1;
        error.focus();
        return;
      }
      if (!D.dishFor(order) && stage() === 'review') { goto(steps().indexOf('dish')); return; }
      if (stage() === 'review') {
        const resolved = D.resolve(order);
        order = resolved.order;
        if (resolved.conflicts.length) { notices = resolved.conflicts; A.record('conflicts', notices.length); renderOrder(); return; }
        result = A.finish('completed');
        if (!result) return;
        view = 'debrief';
        renderDebrief();
        focusMain();
      } else goto(stageIndex + 1);
    }, 'primary'));
    panel.append(error, actions);
    layout.append(panel, summary());
    main.append(layout);
    if (moveFocus) focusMain();
  }
  function renderHome() {
    view = 'home';
    main.replaceChildren();
    const hero = el('section', undefined, 'hero');
    hero.append(el('div', 'THE SAME APPETITE. TWO VERY DIFFERENT JOURNEYS.', 'eyebrow'),
      el('h1', 'What if ordering dinner felt like a hundred tiny decisions?'),
      el('p', 'Explore the difference between a clear six-step menu and a deliberately denser fifteen-step menu. Nothing is ordered. Everything stays in your browser.'));
    main.append(hero);
    const cards = el('div', undefined, 'cards');
    for (const [id, name, text] of [
      ['simple', 'Keep it simple.', '6 stages · grouped customization · optional drinks and sweets.'],
      ['impossible', 'Make it impossible.', '15 stages · granular quantities · extra preferences and recoverable dependencies.'],
    ]) {
      const card = button('', () => {
        mode = id; order = D.empty(); stageIndex = 0; result = null; notices = [];
        occurrence++; displayed.clear(); A.begin(mode); renderOrder();
      }, `mode ${id}`);
      card.append(el('span', id === 'simple' ? 'LESS FRICTION' : 'MORE FRICTION', 'eyebrow'), el('strong', name), el('span', text));
      cards.append(card);
    }
    main.append(cards, el('p', 'Honest scope: all 12 cuisines and 120 mock mains, with a smaller selection of 4 drinks, 3 desserts and 2 sides. This separately maintained no-build edition simplifies the React app: cooking, heat and ice are preferences only; no upsell engine or original analytics schema.', 'note'),
      el('p', 'Study caveat: local descriptive counts are not validated diagnoses of fatigue, and do not establish causation. No accounts, third-party analytics, or personal information.'));
    if (A.warning()) main.append(el('p', A.warning(), 'notice'));
  }
  function metrics(parent, row) {
    const grid = el('div', undefined, 'metrics');
    for (const [label, value] of [['Active seconds', (row.activeMs / 1000).toFixed(1)], ['Selection actions', row.actions], ['Options shown', row.optionsShown], ['Backtracks', row.backtracks], ['Auto-resolved conflicts', row.conflicts], ['Selection changes', row.changes]]) {
      const item = el('div', undefined, 'metric');
      item.append(el('strong', String(value)), el('span', label));
      grid.append(item);
    }
    parent.append(grid);
  }
  function renderDebrief() {
    main.replaceChildren();
    main.append(el('div', 'TAKE A BREATH.', 'eyebrow'), el('h1', result?.status === 'completed' ? 'Dinner decided. Nothing ordered.' : 'You chose to leave. That counts, too.'),
      el('p', result?.status === 'completed' ? 'Your mock order is complete. Compare how the journey felt, not just how long it took.' : 'This visit is recorded as deliberately abandoned. There is no penalty.'));
    if (result) metrics(main, result);
    main.append(el('p', 'Active time excludes hidden/unfocused windows and the dashboard. Actions count changed selections once, not navigation or failed validation. Options count each control choice once per stage visit, including newly revealed choices. Interrupted visits are distinct from deliberate exits. These are descriptive showcase-only measurements, not diagnoses or causal evidence.', 'note'));
    if (result?.status === 'completed') {
      const layout = el('div', undefined, 'layout');
      const panel = el('section', undefined, 'panel');
      review(panel);
      layout.append(panel, summary());
      main.append(layout);
    }
    const actions = el('div', undefined, 'actions');
    actions.append(button('Try another journey', () => { renderHome(); focusMain(); }, 'primary'), button('View local dashboard', renderDashboard));
    main.append(actions);
  }
  function renderDashboard() {
    A.pause();
    view = 'dashboard';
    const data = A.snapshot();
    main.replaceChildren();
    main.append(el('div', 'ON THIS BROWSER. ONLY.', 'eyebrow'), el('h1', 'Your local dashboard.'),
      el('p', 'Showcase schema v1 · Separate from the React app’s measurements · Up to 200 recent visits; the oldest is removed when starting visit 201.'));
    if (A.warning()) main.append(el('p', A.warning(), 'notice'));
    const controls = el('div', undefined, 'actions');
    controls.append(button(A.running() ? 'Return to current order' : 'Return to menu', () => {
      if (A.running()) { A.resume(); renderOrder(); }
      else { renderHome(); focusMain(); }
    }, 'primary'), button('Export JSON', () => A.exportData('json')), button('Export CSV', () => A.exportData('csv')),
    button('Clear showcase data', () => confirmDialog('Clear all showcase measurements?', 'This deletes only this edition’s local records. A current order will also end. The React app’s storage is not affected.', 'Clear data', () => {
      A.clear(); order = D.empty(); result = null; renderDashboard();
    })));
    main.append(controls);
    if (!data.sessions.length) main.append(el('p', 'No showcase visits yet. Start either journey to create a local record.', 'note'));
    else {
      const wrap = el('div', undefined, 'table-wrap');
      const table = el('table');
      table.append(el('caption', 'Recent showcase visits'));
      const head = el('thead');
      const tr = el('tr');
      ['Mode', 'Status', 'Started', 'Active seconds', 'Actions', 'Options', 'Back', 'Conflicts'].forEach(name => {
        const th = el('th', name); th.scope = 'col'; tr.append(th);
      });
      head.append(tr); table.append(head);
      const body = el('tbody');
      [...data.sessions].reverse().forEach(row => {
        const line = el('tr');
        [row.mode, row.status, new Date(row.startedAt).toLocaleString(), (row.activeMs / 1000).toFixed(1), row.actions, row.optionsShown, row.backtracks, row.conflicts].forEach(value => line.append(el('td', String(value))));
        body.append(line);
      });
      table.append(body); wrap.append(table); main.append(wrap);
    }
    main.append(el('p', 'Exports include only local session IDs, timestamps, mode, status and counters. No order contents or personal data are stored. CSV cells are escaped against spreadsheet formula execution. Closing/reloading an active order records interruption; there is no order restoration.', 'note'));
    focusMain();
  }
  function confirmDialog(title, text, confirmText, action) {
    A.pause();
    const previousFocus = document.activeElement;
    const dialog = el('dialog');
    const heading = el('h2', title);
    heading.id = 'dialog-title';
    dialog.setAttribute('aria-labelledby', heading.id);
    dialog.append(heading, el('p', text));
    const actions = el('div', undefined, 'actions');
    const cancel = button('Cancel', () => dialog.close());
    actions.append(cancel, button(confirmText, () => { dialog.close(); action(); }, 'primary'));
    dialog.append(actions);
    dialog.addEventListener('close', () => {
      dialog.remove();
      if (view === 'order') A.resume();
      if (previousFocus?.isConnected) previousFocus.focus();
    });
    document.body.append(dialog);
    dialog.showModal();
    cancel.focus();
  }
  document.getElementById('dashboard-link').addEventListener('click', renderDashboard);
  window.addEventListener('showcase-storage-change', () => {
    if (view === 'order' && !A.running()) {
      order = D.empty(); result = null; notices = [];
      renderHome();
      main.append(el('p', 'Showcase measurements were cleared in another tab, or this visit left the retained history. The current order was canceled.', 'notice'));
      focusMain();
    } else if (view === 'dashboard') renderDashboard();
  });
  document.querySelector('.brand').addEventListener('click', event => {
    if (A.running()) { event.preventDefault(); renderDashboard(); }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { view = 'home'; renderHome(); focusMain(); }
  });
  renderHome();
})();
