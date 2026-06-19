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

export interface BankCardEntity {
    type: 'card_number' | 'date_of_expiry';
    value: string;
}

export type ResumePeriod = Record<'start_date' | 'start_time' | 'end_date' | 'end_time', string>;

export interface ResumeEducation
    extends ResumePeriod, Record<'school' | 'major' | 'degree', string> {
    qualification: number;
}

export interface ResumeCareer
    extends ResumePeriod, Record<'company' | 'title' | 'type_str' | 'job_description', string> {
    type: number;
}

export type ResumeProject = ResumePeriod & Record<'name' | 'title' | 'description', string>;

export interface ResumeLanguage {
    level: number;
    description: string;
}

export type ResumeAward = Record<'award' | 'date' | 'description', string>;

export type ResumeCertificate = Record<'name' | 'desc', string>;

export type ResumeCompetition = Record<'name' | 'desc', string>;

export interface Resume
    extends
        Record<
            | 'file_md5'
            | 'content'
            | 'new_content'
            | 'name'
            | 'email'
            | 'mobile'
            | 'country_code'
            | 'date_of_birth'
            | 'current_location'
            | 'home_location'
            | 'self_evaluation',
            string
        >,
        Record<'willing_positions' | 'willing_locations' | 'urls' | 'social_links', string[]> {
    mobile_is_virtual: boolean;
    educations: ResumeEducation[];
    careers: ResumeCareer[];
    projects: ResumeProject[];
    work_year: number | null;
    gender: number;
    languages: ResumeLanguage[];
    awards: ResumeAward[];
    certificates: ResumeCertificate[];
    competitions: ResumeCompetition[];
}

export interface ContractPrice {
    contract_price: number;
    contract_price_original: string;
    text: string;
}

export type ContractInitialTerm = Record<'initial_time' | 'initial_unit', string>;

export interface ContractTime extends Record<
    | 'time_start'
    | 'time_end'
    | 'original_time_start'
    | 'original_time_end'
    | 'text_start'
    | 'text_end'
    | 'text_initial_term',
    string
> {
    initial_term: ContractInitialTerm;
}

export interface ContractCopy extends Record<'original_copy' | 'key' | 'text', string> {
    copy_num: number;
}

export type ContractCurrency = Record<'currency_name' | 'currency_text', string>;

export type ContractBodyType = 'buy' | 'sell' | 'third';

export type ContractBodyEntity = Record<
    'address' | 'contacts' | 'email' | 'phone' | 'id_number' | 'legal_representative' | 'party',
    string
>;

export interface ContractBodyInfo {
    body_type: ContractBodyType;
    value: ContractBodyEntity;
}

export type ContractBankType = 'buy_bank' | 'sell_bank' | 'third_bank' | 'uncertain_bank';

export type ContractBankEntity = Record<
    | 'account_name'
    | 'bank_name'
    | 'account_number'
    | 'phone'
    | 'contacts'
    | 'tax_number'
    | 'address'
    | 'id_number'
    | 'email',
    string
>;

export interface ContractBankInfo {
    bank_type: ContractBankType;
    value: ContractBankEntity;
}

export interface Contract extends Record<'file_id' | 'header', string> {
    price: ContractPrice;
    time: ContractTime;
    copy: ContractCopy;
    currency: ContractCurrency;
    body_info: ContractBodyInfo[];
    bank_info: ContractBankInfo[];
}
