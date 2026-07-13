import { useState, useEffect } from 'react';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('checking...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data.status))
      .catch(err => setHealthStatus('error: ' + err.message));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sales Transformation Engine</h1>
      <p>API Health Status: <strong>{healthStatus}</strong></p>
    </div>
  );
}

export default App;
