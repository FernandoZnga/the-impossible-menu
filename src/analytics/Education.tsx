export function Education() {
  return (
    <section className="panel" aria-labelledby="learning-title">
      <p className="eyebrow">What this experiment explores</p>
      <h2 id="learning-title">More choices aren’t always more freedom.</h2>
      <dl>
        <dt><strong>Hick–Hyman law</strong></dt>
        <dd>For simple choice tasks, decision time often grows roughly with the logarithm of the number of plausible alternatives. Real menu choices also depend on familiarity and preference; this is not a universal stopwatch formula.</dd>
        <dt><strong>Choice overload</strong></dt>
        <dd>A large, hard-to-compare set can reduce confidence or satisfaction. More options are not inherently worse: organization, expertise, and the task matter.</dd>
        <dt><strong>Cognitive load</strong></dt>
        <dd>Remembering ingredients, restrictions, and tradeoffs uses limited working memory. Clear grouping and relevant recommendations can reduce that burden.</dd>
        <dt><strong>Decision fatigue and paralysis</strong></dt>
        <dd>Repeated decisions may feel increasingly effortful; too many difficult tradeoffs can also leave someone unable to commit. Neither a long visit nor an abandoned run diagnoses these experiences.</dd>
        <dt><strong>Dark patterns versus poor UX</strong></dt>
        <dd>Confusing design can be poor UX without being manipulative. Dark patterns steer people against their interests through deceptive defaults, hidden costs, pressure, or obstructed exits. Ethical guidance preserves informed choice and an easy way to say no.</dd>
      </dl>
      <p className="muted">These browser-local observations illustrate hypotheses, not causal evidence. Small, self-selected samples, practice effects, repeated runs, and differences in preferences or devices can explain differences between modes. Anonymous browser IDs are not verified people; clearing browser storage or switching devices changes the ID.</p>
    </section>
  )
}
