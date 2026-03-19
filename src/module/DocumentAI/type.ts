export interface InvoiceEntity {
    type: string;
    value: string;
    score: number;
}

export interface Invoice {
    entities: InvoiceEntity[];
}

export type VatInvoice = Invoice;

export type TaxiInvoice = Invoice;

export type TrainInvoice = Invoice;

export type VehicleInvoice = Invoice;
