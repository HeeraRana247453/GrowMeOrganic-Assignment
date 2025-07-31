import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import './ArtworkTable.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworkTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<{ [key: number]: Artwork }>({});
  const [rowsToSelect, setRowsToSelect] = useState<number>(0);

  const rowsPerPage = 10;
  const overlayRef = useRef<OverlayPanel>(null);

  const fetchArtworks = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}&limit=${rowsPerPage}`
      );
      setArtworks(response.data.data);
      setTotalRecords(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  const onPage = (e: DataTablePageEvent) => {
    setPage(e.page ?? 0);
  };


  const handleSelectionChange = (e: { value: Artwork[] }) => {
    const updatedGlobalSelection = { ...selectedArtworks };

    e.value.forEach((art) => {
      updatedGlobalSelection[art.id] = art;
    });

    artworks.forEach((art) => {
      const stillSelected = e.value.find((a) => a.id === art.id);
      if (!stillSelected) {
        delete updatedGlobalSelection[art.id];
      }
    });

    setSelectedArtworks(updatedGlobalSelection);
  };

  const selectedOnCurrentPage = artworks.filter((art) => selectedArtworks[art.id]);

  const handleSelectRowsSubmit = () => {
    const toSelect = rowsToSelect;
    const updated = { ...selectedArtworks };

    let selectedCount = 0;
    let tempPage = page;

    const selectRows = async () => {
      while (selectedCount < toSelect && tempPage * rowsPerPage < totalRecords) {
        const res = await axios.get(
          `https://api.artic.edu/api/v1/artworks?page=${tempPage + 1}&limit=${rowsPerPage}`
        );
        const data: Artwork[] = res.data.data;

        for (let i = 0; i < data.length && selectedCount < toSelect; i++) {
          updated[data[i].id] = data[i];
          selectedCount++;
        }

        tempPage++;
      }
      setSelectedArtworks(updated);
    };

    selectRows();
    overlayRef.current?.hide();
  };

  const header = (
    <div className="mb-3">
      <h3>Selected Artworks: {Object.keys(selectedArtworks).length}</h3>
    </div>
  );

  const customChevronColumn = (
    <Button
      icon="pi pi-chevron-down"
      className="p-button-text"
      onClick={(e) => overlayRef.current?.toggle(e)}
      tooltip="Custom row select"
    />
  );

  return (
    <div>
      {header}

      <OverlayPanel ref={overlayRef} showCloseIcon>
        <div className="p-2" style={{ minWidth: '200px' }}>
          <h4>Enter Rows</h4>
          <InputNumber
            value={rowsToSelect}
            onValueChange={(e) => setRowsToSelect(e.value ?? 0)}
            showButtons
            min={1}
            max={totalRecords}
            placeholder="Enter number of rows"
            className=" mb-2"
          /><br/>
          <Button label="Submit" onClick={handleSelectRowsSubmit} className="" />
        </div>
      </OverlayPanel>

      <DataTable
        value={artworks}
        selection={selectedOnCurrentPage}
        onSelectionChange={handleSelectionChange}
        selectionMode="multiple"
        dataKey="id"
        lazy
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        loading={loading}
        first={page * rowsPerPage}
        onPage={onPage}
        className="artwork-table-wrapper"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column header={customChevronColumn} body={() => null} headerStyle={{ width: '3rem' }}></Column>
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default ArtworkTable;
