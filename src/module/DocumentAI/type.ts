/**
 * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uUDNxYjL1QTM24SN0EjN}
 */

export interface VATInvoice {
    /** 发票代码 */
    invoice_code?: string;
    /** 发票号码 */
    invoice_number?: string;
    /** 开票日期 */
    invoice_date?: string;
    /** 购买方名称 */
    buyer_name?: string;
    /** 购买方纳税人识别号 */
    buyer_tax_id?: string;
    /** 购买方地址电话 */
    buyer_address_phone?: string;
    /** 购买方开户行及账号 */
    buyer_bank_account?: string;
    /** 销售方名称 */
    seller_name?: string;
    /** 销售方纳税人识别号 */
    seller_tax_id?: string;
    /** 销售方地址电话 */
    seller_address_phone?: string;
    /** 销售方开户行及账号 */
    seller_bank_account?: string;
    /** 合计金额 */
    total_amount?: string;
    /** 价税合计（大写） */
    total_amount_cn?: string;
    /** 价税合计（小写） */
    total_amount_num?: string;
    /** 税额 */
    tax_amount?: string;
    /** 备注 */
    remark?: string;
    /** 收款人 */
    payee?: string;
    /** 复核人 */
    reviewer?: string;
    /** 开票人 */
    drawer?: string;
    /** 发票类型 */
    invoice_type?: string;
    /** 校验码 */
    check_code?: string;
    /** 是否有效 */
    valid?: boolean;
}

export interface TaxiInvoice {
    /** 发票代码 */
    invoice_code?: string;
    /** 发票号码 */
    invoice_number?: string;
    /** 开票日期 */
    invoice_date?: string;
    /** 上车时间 */
    get_on_time?: string;
    /** 下车时间 */
    get_off_time?: string;
    /** 单价 */
    unit_price?: string;
    /** 里程 */
    distance?: string;
    /** 金额 */
    amount?: string;
    /** 车牌号 */
    license_plate?: string;
    /** 发票类型 */
    invoice_type?: string;
    /** 是否有效 */
    valid?: boolean;
}

export interface TrainInvoice {
    /** 发票代码 */
    invoice_code?: string;
    /** 发票号码 */
    invoice_number?: string;
    /** 开票日期 */
    invoice_date?: string;
    /** 出发站 */
    departure_station?: string;
    /** 到达站 */
    arrival_station?: string;
    /** 车次 */
    train_number?: string;
    /** 出发时间 */
    departure_time?: string;
    /** 座位类型 */
    seat_type?: string;
    /** 座位号 */
    seat_number?: string;
    /** 金额 */
    amount?: string;
    /** 乘客姓名 */
    passenger_name?: string;
    /** 身份证号 */
    passenger_id?: string;
    /** 发票类型 */
    invoice_type?: string;
    /** 是否有效 */
    valid?: boolean;
}

export interface VehicleInvoice {
    /** 发票代码 */
    invoice_code?: string;
    /** 发票号码 */
    invoice_number?: string;
    /** 开票日期 */
    invoice_date?: string;
    /** 购买方名称 */
    buyer_name?: string;
    /** 购买方身份证号/纳税人识别号 */
    buyer_id?: string;
    /** 销售方名称 */
    seller_name?: string;
    /** 销售方纳税人识别号 */
    seller_tax_id?: string;
    /** 车辆类型 */
    vehicle_type?: string;
    /** 厂牌型号 */
    brand_model?: string;
    /** 车辆识别代号 */
    vin?: string;
    /** 发动机号码 */
    engine_number?: string;
    /** 价税合计 */
    total_amount?: string;
    /** 销售方开户行及账号 */
    seller_bank_account?: string;
    /** 发票类型 */
    invoice_type?: string;
    /** 是否有效 */
    valid?: boolean;
}

export interface DocumentAIResult<T> {
    /** 识别结果 */
    data?: T;
    /** 请求ID */
    request_id?: string;
    /** 错误码 */
    code?: number;
    /** 错误信息 */
    msg?: string;
}
