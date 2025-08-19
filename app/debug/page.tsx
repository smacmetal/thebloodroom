export default function DebugConsole() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) return <div className="p-6">🔒 Debug Console hidden in production.</div>;

  const envSafe = {
    NODE_ENV: process.env.NODE_ENV,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET: process.env.S3_BUCKET || process.env.S3_BUCKET_NAME,
    // keys masked on purpose
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***' : '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***' : '',
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🛠️ Debug Console</h1>
      <div className="text-sm opacity-80">
        <div className="font-semibold">Environment (safe view):</div>
        <pre className="bg-black/10 p-3 rounded">{JSON.stringify(envSafe, null, 2)}</pre>
      </div>
      <p className="text-sm opacity-80">Add more diagnostics here as needed.</p>
    </div>
  );
}
