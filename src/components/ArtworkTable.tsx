import React,{useEffect,useState,useRef } from 'react';
import  {DataTable,type DataTablePageEvent} from 'primereact/datatable';
import {Column} from 'primereact/column';
import  {Button} from 'primereact/button';
import {OverlayPanel} from 'primereact/overlaypanel';
import {InputNumber} from 'primereact/inputnumber';

import axios from 'axios';
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
  const [tableData, setTableData] = useState< Artwork[]> ([]);
  const [totalArtworkCount, setTotalArtworkCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [selectedItems, setSelectedItems] = useState<{[key:number]: Artwork }>({});
  const [rowsToSelect, setRowsToSelect] = useState< number>(0);

  const rowsPerPage = 10;
  const overlayRef = useRef<OverlayPanel>(null);

  const fetchArtworks = async (pageNumber: number) => {
    setIsLoading(true);
    try{
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${pageNumber+1}&limit=${rowsPerPage}`);
      setTableData(response.data.data);
      setTotalArtworkCount(response.data.pagination.total);
      handleSelectRowsSubmit();
    } 
    catch(err) {
      console.error('Error in fetching data:', err);
    } 
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(currentPage);
  },[currentPage]);

  const onPage = (e: DataTablePageEvent) => {
    setCurrentPage(e.page ?? 0);
  };


  const handleSelectionChange = (e: { value: Artwork[] }) => {
    const updatedGlobalSelection = { ...selectedItems };

    e.value.forEach((art) => {
      updatedGlobalSelection[art.id] = art;
    });

    tableData.forEach((art) => {
      const stillSelected = e.value.find((a) => a.id === art.id);
      if (!stillSelected) {
        delete updatedGlobalSelection[art.id];
      }
    });

    setSelectedItems(updatedGlobalSelection);
  };

  const selectedOnCurrentPage = tableData.filter((art) => selectedItems[art.id]);

  const handleSelectRowsSubmit = async () => {
    const toSelect = rowsToSelect;
    const updated: { [key: number]: Artwork } = {};
    // const updated = {...selectedItems};

    let selectedCount = rowsPerPage*(currentPage);
    let tempPage = currentPage;

    const selectRows = async () => {
    //   while (selectedCount < toSelect && tempPage*rowsPerPage < totalArtworkCount){
        const res = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${tempPage + 1}&limit=${rowsPerPage}`);
        const data:Artwork[] = res.data.data;

        for (let i = 0; i < data.length && selectedCount < toSelect; i++) {
          updated[data[i].id] = data[i];
          selectedCount++;
        }

    //     tempPage++;
    //   }

      setSelectedItems(updated);
    };

    await selectRows();
    overlayRef.current?.hide();
  };

  const header = (
    <div className="mb-3 text-center">
      {/* <h3>Selected Artworks: {Object.keys(selectedItems).length}</h3> */}
      <h3>Selected Artworks: {rowsToSelect}</h3>
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
        <div className="p-2 " style={{minWidth: '205px'}}>
          <h4>Enter No. of Rows</h4>
          <InputNumber
            className=" mb-2"
            placeholder="Enter number of rows"
            value={rowsToSelect}
            onValueChange={(e) => setRowsToSelect(e.value ?? 0)}
            showButtons
            min={1}
            max={totalArtworkCount}
          />
          <br/>
          <Button label="Submit" onClick={handleSelectRowsSubmit} className="" />
        </div>
      </OverlayPanel>

      <DataTable
        className="artwork-table-wrapper"
        value={tableData}
        selection={selectedOnCurrentPage}
        rows={rowsPerPage}
        totalRecords={totalArtworkCount}
        loading={isLoading}
        first={currentPage*rowsPerPage}
        onSelectionChange={handleSelectionChange}
        onPage={onPage}
        selectionMode="multiple"
        dataKey="id"
        lazy
        paginator
      >
        <Column selectionMode="multiple" headerStyle={{width:'3rem'}}></Column>
        <Column header={customChevronColumn} body={() => null} headerStyle={{width:'3rem'}}></Column>
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start-Date" />
        <Column field="date_end" header="End-Date" />
      </DataTable>
    </div>
  );
};

export default ArtworkTable;
