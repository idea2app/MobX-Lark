export type InvoiceEntityType =
    | `invoice_${'code' | 'no' | 'special_seal'}`
    | `seller_${'name' | 'taxpayer_no'}_in_seal`;

export type TrafficInvoiceEntityType = 'total_amount' | 'price';

export interface VatInvoice {
    type:
        | InvoiceEntityType
        | `invoice_${'name' | 'date'}`
        | `total_${'price' | 'tax'}`
        | `${'big_' | ''}total_price_and_tax`
        | 'check_code'
        | `buyer_${'name' | 'taxpayer_no' | 'address_phone' | 'account'}`
        | `seller_${'name' | 'taxpayer_no' | 'address_phone' | 'account'}`
        | 'payee'
        | 'password_area'
        | 'remarks'
        | 'reviewer'
        | 'drawer'
        | 'is_sealed'
        | 'machine_num';
    value: string;
    items: Record<'type' | 'value', string>[][];
}

export interface TaxiInvoice {
    type:
        | InvoiceEntityType
        | TrafficInvoiceEntityType
        | 'car_number'
        | 'start_date'
        | `${'start' | 'end'}_time`
        | 'distance'
        | `${'dispatch' | 'additional'}_fee`
        | 'is_sealed'
        | 'title_trial';
    value: string;
}

export interface TrainInvoice {
    type:
        | TrafficInvoiceEntityType
        | 'name'
        | 'id_num'
        | 'time'
        | `${'start' | 'end'}_station`
        | `sale_${'num' | 'station'}`
        | `${'train' | 'seat' | 'ticket'}_num`
        | `seat_${'num' | 'cls'}`;
    value: string;
}

export interface VehicleInvoice {
    type:
        | 'date'
        | `invoice_${'code' | 'num'}`
        | `print_${'code' | 'num'}`
        | `buyer_${'name' | 'id'}`
        | `saler_${'name' | 'id' | 'addr'}`
        | 'vehicle_type'
        | 'product_model'
        | `${'certificate' | 'machine' | 'engine'}_num`
        | 'vin'
        | `tax${'' | '_rate'}`
        | 'price'
        | `total_price${'' | '_little'}`;
    value: string;
}

export interface OcrText {
    text: string;
    /** Array of corner points (top-left, top-right, bottom-right, bottom-left) for the text bounding box */
    positions: { x: number; y: number }[];
}

export interface BankCard {
    type: 'bank_card_number' | 'bank_card_date_of_expiry';
    value: string;
}

export interface ResumeEntity {
    type:
        | 'name'
        | 'gender'
        | 'date_of_birth'
        | 'marital_status'
        | 'nationality'
        | 'job_title'
        | 'email'
        | 'phone'
        | 'address'
        | `${'education' | 'work_experience' | 'project_experience' | 'award'}_history`
        | 'self_description'
        | 'skills'
        | 'certificates'
        | 'languages';
    value: string;
}

export interface ContractEntity {
    type:
        | 'contract_name'
        | 'contract_type'
        | 'contract_amount'
        | 'contract_period'
        | 'sign_date'
        | 'effective_date'
        | 'expiration_date'
        | 'terms_of_payment'
        | `party_${'a' | 'b'}`
        | `party_${'a' | 'b'}_signatory`;
    value: string;
}
