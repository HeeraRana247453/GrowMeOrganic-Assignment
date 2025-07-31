import React from 'react';
import ArtworkTable from './components/ArtworkTable.tsx';

const App: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Artworks Gallery</h2>
      <ArtworkTable />
    </div>
  );
};

export default App;