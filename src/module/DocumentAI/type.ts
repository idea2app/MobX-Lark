import { Gender } from '../User/type';

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

export interface IDCardEntity {
    type:
        | 'identity_code'
        | 'identity_name'
        | 'address'
        | 'valid_date_start'
        | 'valid_date_end'
        | 'gender'
        | 'race'
        | 'issued_by'
        | 'birth';
    value: string;
}

export interface IDCard {
    entities: IDCardEntity[];
    side: 0 | 1;
    conners: number[];
    corners?: number[];
}

export interface BusinessCardEntity {
    type:
        | 'contact_names'
        | 'company_names'
        | 'departments'
        | 'job_titles'
        | 'emails'
        | 'websites'
        | 'addresses'
        | 'mobile_phones'
        | 'work_phones'
        | 'other_phones'
        | 'faxes';
    value: string;
}

export interface BusinessCard {
    entities: BusinessCardEntity[];
}

export interface BusinessLicenseEntity {
    type:
        | 'certificate_type'
        | 'unified_social_credit_code'
        | 'company_name'
        | 'company_type'
        | 'domicile'
        | 'legal_representative'
        | 'registered_capital'
        | 'established_time'
        | 'established_date'
        | 'business_scope'
        | 'website'
        | 'approval_date';
    value: string;
}

export interface BusinessLicense {
    entities: BusinessLicenseEntity[];
}

export type ResumePeriod = Record<`${'start' | 'end'}_${'date' | 'time'}`, string>;

export enum EducationQualification {
    PrimarySchool = 1,
    JuniorHighSchool = 2,
    VocationalHighSchool = 3,
    HighSchool = 4,
    AssociateDegree = 5,
    BachelorDegree = 6,
    MasterDegree = 7,
    Doctorate = 8,
    Other = 9
}

export interface ResumeEducation
    extends ResumePeriod, Record<'school' | 'major' | 'degree', string> {
    qualification: EducationQualification;
}

export enum CareerType {
    Internship = 1,
    FullTime = 2
}

export interface ResumeCareer
    extends ResumePeriod, Record<'company' | 'title' | 'type_str' | 'job_description', string> {
    type: CareerType;
}

export type ResumeProject = ResumePeriod & Record<'name' | 'title' | 'description', string>;

export interface ResumeLanguage {
    level: number;
    description: string;
}

export type ResumeAward = Record<'award' | 'date' | 'description', string>;

export type ResumeCertificate = Record<'name' | 'desc', string>;

export type ResumeCompetition = ResumeCertificate;

export interface Resume
    extends
        Record<
            | 'file_md5'
            | `${'' | 'new_'}content`
            | 'name'
            | 'email'
            | 'mobile'
            | 'country_code'
            | 'date_of_birth'
            | `${'current' | 'home'}_location`
            | 'self_evaluation',
            string
        >,
        Record<`willing_${'positions' | 'locations'}` | 'urls' | 'social_links', string[]> {
    mobile_is_virtual: boolean;
    educations: ResumeEducation[];
    careers: ResumeCareer[];
    projects: ResumeProject[];
    work_year: number | null;
    gender: Gender;
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

export type ContractInitialTerm = Record<`initial_${'time' | 'unit'}`, string>;

export interface ContractTime extends Record<
    `${'' | 'original_'}time_${'start' | 'end'}` | `text_${'start' | 'end' | 'initial_term'}`,
    string
> {
    initial_term: ContractInitialTerm;
}

export interface ContractCopy extends Record<'original_copy' | 'key' | 'text', string> {
    copy_num: number;
}

export type ContractCurrency = Record<`currency_${'name' | 'text'}`, string>;

export type ContractBodyType = 'buy' | 'sell' | 'third';

export type ContractContact = Record<
    'contacts' | 'id_number' | 'phone' | 'email' | 'address',
    string
>;
export type ContractBodyEntity = ContractContact & Record<'legal_representative' | 'party', string>;

export interface ContractBodyInfo {
    body_type: ContractBodyType;
    value: ContractBodyEntity;
}

export type ContractBankType = `${'buy' | 'sell' | 'third' | 'uncertain'}_bank`;

export type ContractBankEntity = ContractContact &
    Record<'bank_name' | `account_${'name' | 'number'}` | 'tax_number', string>;

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
