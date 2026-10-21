import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChartNoAxesCombined, ChefHat, Clock3, Globe2, Leaf, MoveUpRight, ShoppingBag, Sparkles, X } from 'lucide-react'
import { cuisines, dishes, beverages, sides, createOrder } from './data/catalog'
import type { Mode, Order } from './domain/model'
import { beverageSuggestion, resolveOrder } from './domain/rules'
import type { Conflict } from './domain/rules'
import { isBread, isCheese } from './domain/options'
import { attachLifecycle, changeStep, finishSession, present, startSession, track } from './analytics/store'
import { Dashboard } from './components/Dashboard'
import { Debrief } from './components/Debrief'
import { SelectField } from './components/Fields'
import { Customization, BeverageFields, DessertFields } from './components/OrderFields'
import { OrderSummary } from './components/OrderSummary'
import './App.css'

const cuisineArt = ['🍔', '🌮', '🍝', '🍣', '🥟', '🍲', '🍛', '🍜', '🫒', '🫓', '🥐', '🧆']
interface Stage { id: string; title: string; description: string }
const stageDetails: Record<string, [string, string]> = {
  cuisine: ['A world of good taste.', 'Where would you like your meal to take you?'],
  category: ['Narrow it down. Or not.', 'One cuisine, several ways to start comparing.'],
  dish: ['Find your next favorite.', 'Thoughtfully made. Endlessly customizable.'],
  customize: ['Make it yours.', 'Keep the chef’s recommendation, or change a few things.'],
  ingredients: ['Every little detail.', 'Compare quantities, substitutions, calories, and prices. There is no perfect answer.'],
  sides: ['Something on the side?', 'A combo can replace an individual side. We’ll tell you exactly what changes.'],
  beverage: ['A little refreshment.', 'Choose a drink, or simply continue without one.'],
  'beverage-details': ['Your drink. Your decisions.', 'Even the ice is a decision now. All customizations are optional.'],
  upsell: ['But have you considered…', 'A deliberately conflicting recommendation. Taking it is entirely optional.'],
  'dessert-intent': ['Room for something sweet?', 'You can say no. In this mode, we’ll ask you to reconsider once.'],
  reconsider: ['Are you quite sure?', 'This is the one reconsideration step. “No” still means no.'],
  dessert: ['The sweet finish.', 'A treat is optional. Leaving this empty is a perfectly good choice.'],
  'dessert-details': ['A finishing touch. Or six.', 'Portion, topping, sauce, quantity, and one more offer to compare.'],
  review: ['Your meal, at a glance.', 'These are illustrative estimates. No payment, no real order, no hidden charges.'],
  conflicts: ['One last look back.', 'Review dependency changes before moving on. Compatible choices have been preserved.'],
  confirm: ['Ready. Really ready?', 'The last mandatory step. No more surprises after this.'],
}

function stagesFor(mode: Mode, wantsDessert: boolean | null): Stage[] {
  const ids = mode === 'simple'
    ? ['cuisine', 'dish', 'customize', 'beverage', 'dessert', 'review']
    : ['cuisine', 'category', 'dish', 'customize', 'ingredients', 'sides', 'beverage', 'beverage-details', 'upsell', 'dessert-intent',
      ...(wantsDessert === false ? ['reconsider'] : []),
      ...(wantsDessert === true ? ['dessert', 'dessert-details'] : []),
      'review', 'conflicts', 'confirm']
  return ids.map(id => ({ id, title: stageDetails[id][0], description: stageDetails[id][1] }))
}

function App() {
  const [page, setPage] = useState<'home' | 'order' | 'debrief' | 'dashboard'>('home')
  const [mode, setMode] = useState<Mode>('simple')
  const [sessionId, setSessionId] = useState('')
  const [stageId, setStageId] = useState('cuisine')
  const [cuisine, setCuisine] = useState('')
  const [category, setCategory] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [wantsDessert, setWantsDessert] = useState<boolean | null>(null)
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [reviewed, setReviewed] = useState<string[]>([])
  const [returnToConflicts, setReturnToConflicts] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [dessertCategory, setDessertCategory] = useState('')
  const [suggestionResponded, setSuggestionResponded] = useState<string[]>([])
  const heading = useRef<HTMLHeadingElement>(null)
  const shown = useRef(new Set<string>())
  const steps = stagesFor(mode, wantsDessert)
  const stageIndex = steps.findIndex(step => step.id === stageId)
  const stage = steps[stageIndex] ?? steps[0]
  const dish = dishes.find(item => item.id === order?.dishId)
  const categories = [...new Set(dishes.filter(item => item.cuisine === cuisine).map(item => item.category))]
  const visibleDishes = dishes.filter(item => item.cuisine === cuisine && (!category || mode === 'simple' || item.category === category))
  const suggestion = order && mode === 'impossible' && stageId === 'upsell' ? beverageSuggestion(order) : null
  const suggestionKey = suggestion ? `${order?.beverageId}:${order?.beverageSize}:${suggestion.targetSize}` : ''
  const activeSuggestion = suggestion && !suggestionResponded.includes(suggestionKey) ? suggestion : null

  useEffect(() => {
    if (page !== 'order' || !sessionId) return
    return attachLifecycle(sessionId)
  }, [page, sessionId])

  useEffect(() => {
    if (page !== 'order') return
    heading.current?.focus()
    changeStep(sessionId, stageId)
    if (stageId === 'review') track(sessionId, 'checkout_started', stageId)
  }, [stageId, page, sessionId])

  useEffect(() => {
    if (page !== 'order') return
    const key = `${stageId}:${stageId === 'dish' ? `${cuisine}:${category}` : ''}:${['customize', 'ingredients'].includes(stageId) ? dish?.id : ''}`
    if (shown.current.has(key)) return
    shown.current.add(key)
    const counts: Record<string, number> = {
      cuisine: cuisines.length, category: categories.length, dish: visibleDishes.length,
      customize: dish ? dish.portions.length + (mode === 'impossible' ? 4
        + (dish.ingredients.some(item => isBread(item.id)) ? 4 : 0)
        + (dish.ingredients.some(item => isCheese(item.id)) ? 2 : 0) : 0) : 0,
      ingredients: dish ? dish.ingredients.reduce((sum, item) => sum + item.quantities.length, 0) + dish.substitutions.length + 1 + dish.extras.length * 2 : 0,
      sides: sides.filter(item => item.id !== 'combo').length + 3, beverage: beverages.length + 1, 'dessert-intent': 2, reconsider: 2,
      dessert: 0, 'dessert-details': 0, review: 1, conflicts: conflicts.length + 1, confirm: 1,
    }
    present(sessionId, stageId, counts[stageId] ?? 0)
  }, [stageId, page, sessionId, cuisine, category, categories.length, visibleDishes.length, dish, mode, conflicts.length])

  useEffect(() => {
    if (!activeSuggestion || !suggestionKey || shown.current.has(`suggestion:${suggestionKey}`)) return
    shown.current.add(`suggestion:${suggestionKey}`)
    track(sessionId, 'recommendation_shown', 'upsell', { recommendation: suggestionKey })
    present(sessionId, 'upsell', 2)
  }, [activeSuggestion, suggestionKey, sessionId])

  function begin(selectedMode: Mode) {
    const session = startSession(selectedMode)
    setSessionId(session.id)
    setMode(selectedMode)
    setStageId('cuisine')
    setCuisine('')
    setCategory('')
    setOrder(null)
    setWantsDessert(null)
    setConflicts([])
    setReviewed([])
    setReturnToConflicts(false)
    setNotice('')
    setError('')
    setDessertCategory('')
    setSuggestionResponded([])
    shown.current.clear()
    setPage('order')
  }

  function decision(field: string, oldValue: string | number | boolean, value: string | number | boolean) {
    if (oldValue === value) return
    track(sessionId, 'decision_made', stageId, { field, value })
    if (oldValue !== '') track(sessionId, 'decision_reversed', stageId, { field, from: oldValue, to: value })
  }

  function update(patch: Partial<Order>, field: string) {
    if (!order) return
    const before = JSON.stringify(order)
    const next = { ...order, ...patch }
    if (before === JSON.stringify(next)) return
    const previousValue = JSON.stringify(order[field as keyof Order] ?? '')
    decision(field, previousValue === '""' ? '' : previousValue, JSON.stringify(patch[field as keyof Order] ?? patch))
    if (['quantities', 'extraIds', 'substitutionId', 'bread', 'cheese'].includes(field)) {
      track(sessionId, 'ingredient_modified', stageId, { field })
    }
    const result = resolveOrder(next)
    setOrder(result.order)
    if (result.conflicts.length) {
      setNotice(result.conflicts.map(conflict => conflict.message).join(' '))
      setConflicts(current => {
        const ids = new Set(result.conflicts.map(conflict => conflict.id))
        return [...current.filter(conflict => !ids.has(conflict.id)), ...result.conflicts]
      })
      setReviewed(current => current.filter(id => !result.conflicts.some(conflict => conflict.id === id)))
      result.conflicts.forEach(conflict => track(sessionId, 'configuration_conflict', stageId, { rule: conflict.id }))
    } else setNotice('')
  }

  function navigate(id: string) {
    setStageId(id)
    setError('')
    setNotice('')
  }

  function revisit(id: string) {
    track(sessionId, 'previous_step_revisited', stageId, { target: id })
    navigate(id)
  }

  function next() {
    let message = ''
    if (stageId === 'cuisine' && !cuisine) message = 'Choose a cuisine to continue.'
    if (stageId === 'category' && !category) message = 'Choose a category to continue.'
    if (stageId === 'dish' && !dish) message = 'Choose a dish to continue.'
    if (stageId === 'dessert-intent' && wantsDessert === null) message = 'Choose whether you would like dessert.'
    if (stageId === 'conflicts' && conflicts.some(conflict => !reviewed.includes(conflict.id))) message = 'Review each dependency change using its revisit button before continuing.'
    if (message) {
      setError(message)
      track(sessionId, 'validation_error', stageId, { message })
      return
    }
    if (activeSuggestion) {
      track(sessionId, 'suggestion_rejected', stageId, { recommendation: suggestionKey, reason: 'continued' })
      setSuggestionResponded(current => [...current, suggestionKey])
    }
    if (returnToConflicts) {
      setReturnToConflicts(false)
      navigate('conflicts')
      return
    }
    if (stageIndex === steps.length - 1) {
      finishSession(sessionId, 'completed')
      setPage('debrief')
    } else navigate(steps[stageIndex + 1].id)
  }

  function exit() {
    finishSession(sessionId, 'abandoned')
    setPage('debrief')
  }

  function dessertIntent(value: boolean) {
    decision('wantsDessert', wantsDessert === null ? '' : wantsDessert, value)
    setWantsDessert(value)
    if (!value && order?.dessertId) update({ dessertId: '' }, 'dessertId')
    if (value && stageId === 'reconsider') navigate('dessert')
  }

  const screen = page === 'dashboard' ? <Dashboard onClose={() => setPage(sessionId ? 'debrief' : 'home')} />
    : page === 'debrief' ? <Debrief sessionId={sessionId} onRestart={() => setPage('home')} onDashboard={() => setPage('dashboard')} />
    : page === 'home' ? (
      <>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><span className="live-dot" /> A LITTLE FOOD FOR THOUGHT</span>
            <h1>Good food.<br />How many<br /><em>decisions?</em></h1>
            <p className="hero-description">A world of flavors. Two ways to order.<br />Discover what happens when more choice<br className="desktop-only" /> isn’t always a good thing.</p>
            <a className="button" href="#experiences">Find your experience <ArrowRight size={18} /></a>
            <div className="hero-meta"><span><Globe2 size={15} />12 cuisines</span><span><ChefHat size={15} />120 dishes</span><span><Leaf size={15} />Zero real orders</span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of a colorful Mediterranean meal" role="img">
            <div className="art-caption">MADE TO MAKE YOU THINK</div>
            <div className="plate-shadow"><div className="food-plate"><span className="food-center">🥗</span><span className="plate-food food-one">🧆</span><span className="plate-food food-two">🍅</span><span className="plate-food food-three">🫒</span><span className="plate-food food-four">🫓</span></div></div>
            <div className="floating-note note-top"><Sparkles size={17} /><div>Perfectly curated.<small>Until it isn’t.</small></div></div>
            <div className="floating-note note-bottom"><span className="note-icon">↗</span><div>More options. Better experience?<small>Let’s put that to the test.</small></div></div>
            <span className="art-herb herb-one">✧</span><span className="art-herb herb-two">✦</span>
          </div>
        </section>
        <section id="experiences" className="experience-section">
          <div className="section-heading"><div><span className="eyebrow">SAME APPETITE. DIFFERENT JOURNEY.</span><h2>Pick your experience.</h2></div><p>There’s no right choice.<br />That’s kind of the point.</p></div>
          <div className="mode-grid">
            <article className="mode-card simple-card">
              <div className="mode-top"><span className="mode-tag">MODE A</span><span><Clock3 size={14} /> At your own pace</span></div>
              <div className="mode-symbol"><Leaf size={29} /></div><h3>Keep it simple.</h3>
              <p>A good meal, without the mental gymnastics.<br />A few meaningful choices. Then you’re done.</p>
              <div className="mode-bottom"><span>6 straightforward stages</span><button className="button" onClick={() => begin('simple')}>Start Simple Ordering <ArrowRight size={17} /></button></div>
            </article>
            <article className="mode-card impossible-card">
              <div className="mode-top"><span className="mode-tag">MODE B</span><span><Sparkles size={14} /> An exercise in excess</span></div>
              <div className="mode-symbol"><ShoppingBag size={29} /></div><h3>Explore the impossible.</h3>
              <p>Every detail is up to you. And the next detail.<br />And the one after that. How much is too much?</p>
              <div className="mode-bottom"><span>Progressively more decisions</span><button className="button button-dark" onClick={() => begin('impossible')}>Start Impossible Menu <ArrowRight size={17} /></button></div>
            </article>
          </div>
          <div className="ethics-note"><span className="info-mark">i</span><p><strong>An experiment, not a restaurant.</strong> This educational demo deliberately explores choice overload and UX anti-patterns. You can leave at any time. Anonymous results stay in this browser; nothing is sent to a server. No purchase or payment.</p></div>
        </section>
        <section className="cuisine-strip"><div><span className="eyebrow">A PASSPORT FOR YOUR PALATE</span><h2>One menu. A whole world.</h2></div><div className="cuisine-preview">{cuisines.map((name, index) => <span key={name}><span aria-hidden="true">{cuisineArt[index]}</span>{name}</span>)}</div></section>
      </>
    ) : (
      <section className="order-layout">
        <div className="order-main">
          <div className="order-top"><span className="eyebrow">{mode === 'simple' ? 'MODE A · SIMPLE ORDERING' : 'MODE B · IMPOSSIBLE MENU'}</span><button className="text-button" onClick={exit}><X size={16} /> Exit experiment</button></div>
          <div className="progress-meta"><span>Stage {stageIndex + 1} of {steps.length}</span><span>{steps.length - stageIndex - 1} remaining{mode === 'impossible' ? ' · dessert may add optional stages' : ''}</span></div>
          <progress value={stageIndex} max={steps.length} aria-label="Completed ordering stages" />
          <h1 ref={heading} tabIndex={-1} className="stage-heading">{stage.title}</h1><p className="stage-description">{stage.description}</p>
          {error && <div role="alert" className="notice error">{error}</div>}
          {notice && <div role="status" className="notice">{notice}</div>}
          {stageId === 'cuisine' && <div className="cuisine-grid">{cuisines.map((name, index) => <button key={name} className={`cuisine-card ${cuisine === name ? 'selected' : ''}`} aria-pressed={cuisine === name} onClick={() => {
            decision('cuisine', cuisine, name)
            track(sessionId, 'cuisine_selected', stageId, { cuisine: name })
            if (name !== cuisine) { setCategory(''); setOrder(null); setConflicts([]); setReviewed([]) }
            setCuisine(name)
          }}><span aria-hidden="true">{cuisineArt[index]}</span><strong>{name}</strong><small>10 dishes to discover</small></button>)}</div>}
          {stageId === 'category' && <div className="choice-grid">{categories.map(name => <button key={name} className={`choice-card ${category === name ? 'selected' : ''}`} aria-pressed={category === name} onClick={() => {
            decision('category', category, name)
            setCategory(name)
            if (dish && dish.category !== name) { setOrder(null); setConflicts([]); setReviewed([]) }
          }}>{name}</button>)}</div>}
          {stageId === 'dish' && <div className="dish-grid">{visibleDishes.map(item => <button key={item.id} className={`dish-card ${order?.dishId === item.id ? 'selected' : ''}`} aria-pressed={order?.dishId === item.id} onClick={() => {
            decision('dishId', order?.dishId ?? '', item.id)
            track(sessionId, 'dish_selected', stageId, { dish: item.id })
            if (order?.dishId !== item.id) { setOrder(createOrder(item)); setConflicts([]); setReviewed([]) }
          }}><div className="dish-art" aria-hidden="true">{cuisineArt[cuisines.indexOf(item.cuisine)]}<span>{item.category}</span></div><div className="dish-copy"><h3>{item.name}</h3><p>{item.description}</p><div className="dish-meta"><strong>${item.basePrice.toFixed(2)}</strong><span>~{item.baseCalories} kcal</span></div><small>{item.allergens.length ? `Contains: ${item.allergens.join(', ')}` : 'See ingredient metadata for allergens'}</small></div></button>)}</div>}
          {order && dish && ['customize', 'ingredients'].includes(stageId) && <Customization order={order} dish={dish} detailed={stageId === 'ingredients'} impossible={mode === 'impossible'} onChange={update} />}
          {order && stageId === 'sides' && <div className="panel field-stack"><SelectField label="Individual side" value={order.side} onChange={value => update({ side: value, combo: false }, 'side')} options={[{ value: '', label: 'No side' }, ...sides.filter(item => item.id !== 'combo').map(item => ({ value: item.id, label: `${item.name} · $${item.price.toFixed(2)} · ~${item.calories} kcal` })), ...(order.combo ? [{ value: 'combo', label: 'Included combo side' }] : [])]} /><label className="checkbox-field"><input type="checkbox" checked={order.combo} onChange={event => update({ combo: event.target.checked }, 'combo')} /><span>Make it a combo — replaces any individual side with included fries (+${sides.find(item => item.id === 'combo')?.price.toFixed(2)}, ~{sides.find(item => item.id === 'combo')?.calories} kcal). Never charged for two sides.</span></label></div>}
          {order && ['beverage', 'beverage-details'].includes(stageId) && <BeverageFields order={order} detailed={stageId === 'beverage-details'} simple={mode === 'simple'} onChange={update} onPresent={(key, count) => {
            const id = `beverage:${stageId}:${key}`
            if (!shown.current.has(id)) { shown.current.add(id); present(sessionId, stageId, count) }
          }} />}
          {stageId === 'upsell' && <div className="panel suggestion-panel"><Sparkles size={30} /><h2>One more comparison?</h2>{activeSuggestion ? <><p>{activeSuggestion.message}</p><div className="button-row"><button className="button" onClick={() => {
            if (!order) return
            track(sessionId, 'suggestion_accepted', stageId, { recommendation: suggestionKey })
            setSuggestionResponded(current => [...current, suggestionKey])
            update({ beverageSize: activeSuggestion.targetSize }, 'beverageSize')
          }}>Accept suggestion</button><button className="button button-secondary" onClick={() => { track(sessionId, 'suggestion_rejected', stageId, { recommendation: suggestionKey }); setSuggestionResponded(current => [...current, suggestionKey]) }}>Keep my choice</button></div></> : <p>{order?.beverageId ? 'You’ve seen this comparison. No more repeated suggestions — continue whenever you’re ready.' : 'No drink selected, so no drink upsell. You can continue.'}</p>}<small className="muted">An intentional UX anti-pattern: upgrading value can conflict with reducing calories. Neither is a moral judgment.</small></div>}
          {['dessert-intent', 'reconsider'].includes(stageId) && <div className="choice-grid"><button className={`choice-card ${wantsDessert === true ? 'selected' : ''}`} aria-pressed={wantsDessert === true} onClick={() => dessertIntent(true)}>Yes, explore desserts</button><button className={`choice-card ${wantsDessert === false ? 'selected' : ''}`} aria-pressed={wantsDessert === false} onClick={() => dessertIntent(false)}>{stageId === 'reconsider' ? 'Still no dessert' : 'No dessert'}</button></div>}
          {order && ['dessert', 'dessert-details'].includes(stageId) && <DessertFields order={order} detailed={stageId === 'dessert-details'} simple={mode === 'simple'} category={dessertCategory} onCategory={value => { decision('dessertCategory', dessertCategory, value); setDessertCategory(value) }} onChange={update} onPresent={(key, count) => {
            const id = `dessert:${stageId}:${key}`
            if (!shown.current.has(id)) { shown.current.add(id); present(sessionId, stageId, count) }
          }} />}
          {order && stageId === 'review' && <><OrderSummary order={order} expanded /><p className="muted">Want to adjust something? Use Back. Your compatible choices will be kept.</p></>}
          {stageId === 'conflicts' && <div className="field-stack">{conflicts.length ? conflicts.map(conflict => <div key={conflict.id} className="panel"><h3>{reviewed.includes(conflict.id) ? '✓ Reviewed' : 'Dependency change'}</h3><p>{conflict.message}</p><button className="button button-secondary" onClick={() => {
            setReviewed(current => [...current, conflict.id])
            setReturnToConflicts(true)
            revisit(steps.some(step => step.id === conflict.step) ? conflict.step : 'customize')
          }}>Revisit {conflict.step}</button></div>) : <div className="panel"><h3>Everything is compatible.</h3><p>No dependency changes need review. No invented conflict, no forced rework.</p></div>}</div>}
          {stageId === 'confirm' && <div className="panel"><ChefHat size={32} /><h2>Your choices are yours.</h2><p>Confirm this simulated order to see your experience summary. This will not place a real order or charge you.</p><p className="muted">Changed your mind? You can go back or exit without finishing.</p></div>}
          <div className="step-navigation"><button className="button button-secondary" disabled={stageIndex === 0} onClick={() => { setReturnToConflicts(false); revisit(steps[stageIndex - 1].id) }}>Back</button><button className="button" onClick={next}>{returnToConflicts ? 'Return to conflict review' : stageIndex === steps.length - 1 ? 'Complete simulated order' : 'Continue'}<ArrowRight size={17} /></button></div>
        </div>
        <aside className="order-sidebar">{order ? <OrderSummary order={order} /> : <div className="panel empty-cart"><ShoppingBag size={30} /><h3>A good meal starts here.</h3><p>Your selections, prices, and illustrative calorie estimates will appear here.</p></div>}<div className="sidebar-note"><Leaf size={17} /><p>No real ordering. No payment.<br />You’re always free to leave.</p></div></aside>
      </section>
    )

  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><button className="brand" aria-label={page === 'order' ? 'Exit experiment to debrief' : 'The Impossible Menu home'} onClick={() => {
    if (page === 'order') exit()
    else setPage('home')
  }}><span className="brand-icon"><ChefHat size={23} /></span><span>the impossible<span className="brand-light"> menu.</span></span></button><nav aria-label="Main navigation"><span className="nav-caption">An interactive UX experiment</span><button className="dashboard-link" aria-label={page === 'order' ? 'Exit to dashboard' : 'Research dashboard'} onClick={() => {
    if (page === 'order') { finishSession(sessionId, 'abandoned'); setPage('dashboard') } else setPage('dashboard')
  }}><ChartNoAxesCombined size={17} /><span>{page === 'order' ? 'Exit to dashboard' : 'Research dashboard'}</span><MoveUpRight size={13} /></button></nav></header><main id="main">{screen}</main><footer><span>the impossible menu. <span className="muted">A little less choice. A little more perspective.</span></span><span>Made for curiosity, not commerce.</span></footer></>
}

export default App
