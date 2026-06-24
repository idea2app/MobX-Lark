import { makeFormData, readAs } from 'koajax';
import { BaseModel, RESTClient, toggle } from 'mobx-restful';

import { LarkData } from '../../type';
import {
    BankCardEntity,
    BusinessCard,
    BusinessLicense,
    Contract,
    IDCard,
    Resume,
    TaxiInvoice,
    TrainInvoice,
    VatInvoice,
    VehicleInvoice
} from './type';

export * from './type';

export abstract class DocumentAIModel extends BaseModel {
    baseURI = 'document_ai/v1';

    abstract client: RESTClient;

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/vat_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeVatInvoices(file: File) {
        const { body } = await this.client.post<
            LarkData<{ vat_invoices: { entities: VatInvoice[] }[] }>
        >(`${this.baseURI}/vat_invoice/recognize`, makeFormData({ file }));

        return body!.data!.vat_invoices;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/taxi_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeTaxiInvoices(file: File) {
        const { body } = await this.client.post<
            LarkData<{ taxi_invoices: { entities: TaxiInvoice[] }[] }>
        >(`${this.baseURI}/taxi_invoice/recognize`, makeFormData({ file }));

        return body!.data!.taxi_invoices;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/train_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeTrainInvoices(file: File) {
        const { body } = await this.client.post<
            LarkData<{ train_invoices: { entities: TrainInvoice[] }[] }>
        >(`${this.baseURI}/train_invoice/recognize`, makeFormData({ file }));

        return body!.data!.train_invoices;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/vehicle_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeVehicleInvoice(file: File) {
        const { body } = await this.client.post<
            LarkData<{ vehicle_invoice: { entities: VehicleInvoice[] } }>
        >(`${this.baseURI}/vehicle_invoice/recognize`, makeFormData({ file }));

        return body!.data!.vehicle_invoice;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/ai/optical_char_recognition-v1/basic_recognize}
     */
    @toggle('uploading')
    async recognizeText(image: File) {
        const URI = (await readAs(image, 'dataURL').result) as string;

        const [, base64] = URI.split(',');

        const { body } = await this.client.post<LarkData<{ text_list: string[] }>>(
            'optical_char_recognition/v1/image/basic_recognize',
            { image: base64 }
        );
        return body!.data!.text_list;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/bank_card/recognize}
     */
    @toggle('uploading')
    async recognizeBankCard(file: File) {
        const { body } = await this.client.post<
            LarkData<{ bank_card: { entities: BankCardEntity[] } }>
        >(`${this.baseURI}/bank_card/recognize`, makeFormData({ file }));

        return body!.data!.bank_card.entities;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/id_card/recognize}
     */
    @toggle('uploading')
    async recognizeIDCard(file: File) {
        type IDCardTypo = Omit<IDCard, 'corners'> & { conners: number[] };

        const { body } = await this.client.post<LarkData<{ id_card: IDCardTypo }>>(
            `${this.baseURI}/id_card/recognize`,
            makeFormData({ file })
        );
        const { conners: corners, ...idCard } = body!.data!.id_card;

        return { ...idCard, corners } as IDCard;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/ai/document_ai-v1/business_card/recognize}
     */
    @toggle('uploading')
    async recognizeBusinessCard(file: File) {
        const { body } = await this.client.post<LarkData<{ business_cards: BusinessCard[] }>>(
            `${this.baseURI}/business_card/recognize`,
            makeFormData({ file })
        );
        return body!.data!.business_cards;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/business_license/recognize}
     */
    @toggle('uploading')
    async recognizeBusinessLicense(file: File) {
        const { body } = await this.client.post<LarkData<{ business_license: BusinessLicense }>>(
            `${this.baseURI}/business_license/recognize`,
            makeFormData({ file })
        );
        return body!.data!.business_license;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/resume/parse}
     */
    @toggle('uploading')
    async parseResume(file: File) {
        const { body } = await this.client.post<LarkData<{ resumes: Resume[] }>>(
            `${this.baseURI}/resume/parse`,
            makeFormData({ file })
        );
        return body!.data!.resumes;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/ai/document_ai-v1/contract/field_extraction}
     */
    @toggle('uploading')
    async extractContract(
        file: File,
        ocr_mode: 'unused' | 'force' | 'auto' = 'auto',
        pdf_page_limit = 100
    ) {
        const { body } = await this.client.post<LarkData<Contract>>(
            `${this.baseURI}/contract/field_extraction`,
            makeFormData({ file, ocr_mode, pdf_page_limit })
        );
        return body!.data!;
    }
}
