// ponytail: shared placeholder for Lab 1; each page replaces it with real UI in Labs 2–5.
export default function StubPage({ title, lab, endpoints = [], children }) {
  return (
    <section>
      <h1>{title}</h1>
      <p className="stub">Заглушка экрана. Реализация — ЛР №{lab}.</p>
      {endpoints.length > 0 && (
        <>
          <h2>API</h2>
          <ul>
            {endpoints.map((endpoint) => (
              <li key={endpoint}>
                <code>{endpoint}</code>
              </li>
            ))}
          </ul>
        </>
      )}
      {children}
    </section>
  );
}
