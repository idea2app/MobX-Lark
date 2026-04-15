import { makeFormData } from 'koajax';
import { BaseModel, RESTClient, toggle } from 'mobx-restful';

import { LarkData } from '../../type';
import {
    BankCard,
    ContractEntity,
    OcrText,
    ResumeEntity,
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
     * @param image Base64-encoded image string
     */
    @toggle('uploading')
    async recognizeText(image: string) {
        const { body } = await this.client.post<LarkData<{ texts: OcrText[] }>>(
            'optical_char_recognition/v1/image/basic_recognize',
            { image }
        );

        return body!.data!.texts;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/bank_card/recognize}
     */
    @toggle('uploading')
    async recognizeBankCard(file: File) {
        const { body } = await this.client.post<
            LarkData<{ bank_cards: { entities: BankCard[] }[] }>
        >(`${this.baseURI}/bank_card/recognize`, makeFormData({ file }));

        return body!.data!.bank_cards;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/resume/parse}
     */
    @toggle('uploading')
    async parseResume(file: File) {
        const { body } = await this.client.post<
            LarkData<{ resumes: { entities: ResumeEntity[] }[] }>
        >(`${this.baseURI}/resume/parse`, makeFormData({ file }));

        return body!.data!.resumes;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/ai/document_ai-v1/contract/field_extraction}
     */
    @toggle('uploading')
    async extractContractFields(file: File) {
        const { body } = await this.client.post<
            LarkData<{ contracts: { entities: ContractEntity[] }[] }>
        >(`${this.baseURI}/contract/field_extraction`, makeFormData({ file }));

        return body!.data!.contracts;
    }
}
