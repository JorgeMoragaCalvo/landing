import { useEffect } from "react";

function App() {
  useEffect(() => {
    window.location.replace("/preventa-corralco.html");
  }, []);

  return (
    <main className="redirect-shell" aria-live="polite">
      <p>Loading Corralco replica...</p>
    </main>
  );
}

export default App;
