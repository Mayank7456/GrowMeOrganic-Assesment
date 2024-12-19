import React, { useEffect, useState } from "react";
import "./App.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { DataTable, DataTablePageEvent, DataTableSelectionChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";

interface Artwork {
    id: number;
    title: string;
    date_end: string | null;
    date_start: string | null;
    place_of_origin: string | null;
    artist_display: string | null;
    inscriptions: string | null;
}

interface ApiResponse {
    data: Artwork[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
        next_url: string | null;
    };
}

const App: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [data, setData] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [rows, setRows] = useState<number>(12);
    const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
    const [itemsToSelect, setItemsToSelect] = useState<number | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
    const url = "https://api.artic.edu/api/v1/artworks";

    const fetchTableData = async () => {
        try {
            const response = await fetch(`${url}?page=${page}&limit=${rows}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const res: ApiResponse = await response.json();
            const updatedData: Artwork[] = res?.data?.map((item) => ({
                id: item.id,
                title: item.title,
                date_end: item.date_end,
                date_start: item.date_start,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                inscriptions: item.inscriptions,
            }));
            setData(updatedData);
            setTotalRecords(res.pagination.total);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    const onPageChange = (event: DataTablePageEvent) => {
        const newPage = event.first / event.rows + 1;
        setPage(newPage);
        setRows(event.rows);
    };

    const handleConfirmSelection = () => {
        if (itemsToSelect !== null && itemsToSelect > 0) {
            const selected = data.slice(0, itemsToSelect);
            setSelectedRows(selected);
        }
        setIsDialogVisible(false);
    };

    useEffect(() => {
        fetchTableData();
    }, [page, rows]);

    return (
        <div className="datatable-container">
            <h1>Artwork Data Table</h1>

            <Button style={{ color: "black" }}
                label="Select Items"
                onClick={() => setIsDialogVisible(true)}
                className="p-button-success"
            />

            <Dialog
                header="Select Number of Items"
                visible={isDialogVisible}
                style={{ width: "50vw" }}
                onHide={() => setIsDialogVisible(false)}
                footer={
                    <Button style={{ color: "black" }}
                        label="Confirm"
                        onClick={handleConfirmSelection}
                        autoFocus
                    />
                }
            >
                <label htmlFor="itemsToSelect">Enter number of items to select </label>
                <InputNumber
                    id="itemsToSelect"
                    value={itemsToSelect}
                    onValueChange={(e) => setItemsToSelect(e.value)}
                    min={1}
                    max={totalRecords}
                    mode="decimal"
                />
            </Dialog>

            <DataTable
                value={data}
                paginator
                rows={rows}
                lazy
                totalRecords={totalRecords}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onPage={onPageChange}
                selection={selectedRows}
                onSelectionChange={(e: DataTableSelectionChangeEvent) => {
                    const currentSelection = Array.isArray(e.value) ? e.value : [e.value];
                    setSelectedRows(currentSelection);
                }}
                selectionMode="checkbox"
            >
                <Column selectionMode="multiple" headerStyle={{ width: "3em" }}></Column>
                <Column field="title" header="Title"></Column>
                <Column field="place_of_origin" header="Place of Origin"></Column>
                <Column field="artist_display" header="Artist Display"></Column>
                <Column field="inscriptions" header="Inscriptions"></Column>
                <Column field="date_start" header="Date Start"></Column>
                <Column field="date_end" header="Date End"></Column>
            </DataTable>

        </div>
    );
};

export default App;
