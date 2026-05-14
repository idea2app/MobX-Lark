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
    items: Record<'type' | 'value', string>[][][];
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

// Bank Card Recognition

export interface BankCardEntity {
    type: 'card_number' | 'date_of_expiry';
    value: string;
}

export interface BankCard {
    entities: BankCardEntity[];
}

// Resume Parsing

export type Qualification =
    | 1 // primary school
    | 2 // junior high school
    | 3 // secondary vocational
    | 4 // high school
    | 5 // specialist
    | 6 // undergraduate
    | 7 // master
    | 8 // doctoral
    | 9; // other

export interface ResumeEducation {
    school: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    major: string;
    degree: string;
    qualification: Qualification;
}

export interface ResumeCareer {
    company: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    title: string;
    type: 1 | 2;
    type_str: 'internship' | 'full-time';
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
    work_year: number | null;
    date_of_birth: string;
    gender: 0 | 1 | 2;
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

// Contract Field Extraction

export interface ExtractPrice {
    contract_price: number;
    contract_price_original: string;
    text: string;
}

export interface ExtractTime {
    time_start: string;
    time_end: string;
    original_time_start: string;
    original_time_end: string;
    text_start: string;
    text_end: string;
}

export interface ExtractTerm {
    initial_time: string;
    initial_unit: string;
    text_initial_term: string;
}

export interface ExtractCopy {
    copy_num: number;
    original_copy: string;
    key: string;
    text: string;
}

export interface ExtractCurrency {
    currency_name: string;
    currency_text: string;
}

export interface BodyEntity {
    address: string;
    contacts: string;
    email: string;
    phone: string;
    id_number: string;
    legal_representative: string;
    party: string;
}

export interface BodyInfo {
    body_type: 'buy' | 'sell' | 'third';
    value: BodyEntity;
}

export interface BankEntity {
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

export interface BankInfo {
    bank_type: 'buy_bank' | 'sell_bank' | 'third_bank' | 'unceratin_bank';
    value: BankEntity;
}

export interface ContractField {
    file_id: string;
    price: ExtractPrice;
    time: ExtractTime & { initial_term: ExtractTerm };
    copy: ExtractCopy;
    currency: ExtractCurrency;
    header: string;
    body_info: BodyInfo[];
    bank_info: BankInfo[];
}
