export interface DocumentAIEntity<T extends string = string> {
    type: T;
    value: string;
}

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

export type BankCardEntityType = 'card_number' | 'date_of_expiry';

export interface BankCard {
    entities: DocumentAIEntity<BankCardEntityType>[];
}

export interface ResumeEducation {
    school: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    major: string;
    degree: string;
    qualification: number;
}

export interface ResumeCareer {
    company: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    title: string;
    type: number;
    type_str: string;
    job_description: string;
}

export interface ResumeProject {
    name: string;
    title: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    description: string;
}

export interface ResumeLanguage {
    level: number;
    description: string;
}

export interface ResumeAward {
    award: string;
    date: string;
    description: string;
}

export interface ResumeCertificate {
    name: string;
    desc: string;
}

export interface ResumeCompetition {
    name: string;
    desc: string;
}

export interface Resume {
    file_md5: string;
    content: string;
    new_content: string;
    name: string;
    email: string;
    mobile: string;
    mobile_is_virtual: boolean;
    country_code: string;
    educations: ResumeEducation[];
    careers: ResumeCareer[];
    projects: ResumeProject[];
    work_year: number;
    date_of_birth: string;
    gender: number;
    willing_positions: string[];
    current_location: string;
    willing_locations: string[];
    home_location: string;
    languages: ResumeLanguage[];
    awards: ResumeAward[];
    certificates: ResumeCertificate[];
    competitions: ResumeCompetition[];
    self_evaluation: string;
    urls: string[];
    social_links: string[];
}

export type ContractOCRMode = 'force' | 'auto' | 'unused';

export interface ContractExtractPrice {
    contract_price: number;
    contract_price_original: string;
    text: string;
}

export interface ContractExtractTerm {
    initial_time: string;
    initial_unit: string;
}

export interface ContractExtractTime {
    time_start: string;
    time_end: string;
    original_time_start: string;
    original_time_end: string;
    text_start: string;
    text_end: string;
    initial_term: ContractExtractTerm;
    text_initial_term: string;
}

export interface ContractExtractCopy {
    copy_num: number;
    original_copy: string;
    key: string;
    text: string;
}

export interface ContractExtractCurrency {
    currency_name: string;
    currency_text: string;
}

export interface ContractBodyEntity {
    address: string;
    contacts: string;
    email: string;
    phone: string;
    id_number: string;
    legal_representative: string;
    party: string;
}

export type ContractPartyType = 'buy' | 'sell' | 'third';

export interface ContractBodyInfo {
    body_type: ContractPartyType;
    value: ContractBodyEntity;
}

export interface ContractBankEntity {
    account_name: string;
    bank_name: string;
    account_number: string;
    phone: string;
    contacts: string;
    tax_number: string;
    address: string;
    id_number: string;
    email: string;
}

export interface ContractBankInfo {
    bank_type:
        | ContractPartyType
        | `${ContractPartyType}_bank`
        | 'uncertain_bank'
        | 'unceratin_bank';
    value: ContractBankEntity;
}

export interface ContractFieldExtraction {
    file_id: string;
    price: ContractExtractPrice;
    time: ContractExtractTime;
    copy: ContractExtractCopy;
    currency: ContractExtractCurrency;
    header: string;
    body_info: ContractBodyInfo[];
    bank_info: ContractBankInfo[];
}
