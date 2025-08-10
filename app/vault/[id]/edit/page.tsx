import fs from 'fs/promises';
import path from 'path';
import ReactMarkdown from 'react-markdown';

interface Memory {
  title: string;
  date: string;
  body: string;
}

export default async function EditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const filePath = path.join(process.cwd(), 'app/vault', `${id}.json`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const memory: Memory = JSON.parse(fileContents);

    return (
      <div className="max-w-4xl mx-auto p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Edit: {memory.title}</h1>
        <p><strong>Date:</strong> {memory.date}</p>
        <div className="prose prose-invert">
          <ReactMarkdown>{memory.body}</ReactMarkdown>
        </div>
      </div>
    );
  } catch (err) {
    const fallbackMemory: Memory = {
      title: 'New Memory',
      date: new Date().toISOString(),
      body: '## This memory doesn’t exist yet, but you can create it now.'
    };

    return (
      <div className="max-w-4xl mx-auto p-8 text-yellow-300">
        <h1 className="text-3xl font-bold mb-4">Edit: {fallbackMemory.title}</h1>
        <p><strong>Date:</strong> {fallbackMemory.date}</p>
        <div className="prose prose-invert">
          <ReactMarkdown>{fallbackMemory.body}</ReactMarkdown>
        </div>
      </div>
    );
  }
}

