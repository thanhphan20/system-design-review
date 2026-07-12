export default function CritiqueResult({ critique }: { critique: string }) {
  return (
    <section>
      <h2>Critique</h2>
      <pre>{critique}</pre>
    </section>
  );
}
