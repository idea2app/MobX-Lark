import { RESTClient } from 'mobx-restful';
import { toggle } from 'mobx-restful';

import { LarkData } from '../../type';
import { DocumentAIResult, TaxiInvoice, TrainInvoice, VATInvoice, VehicleInvoice } from './type';

export * from './type';

/**
 * Document AI Model for FeiShu/Lark intelligent document parsing
 *
 * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uUDNxYjL1QTM24SN0EjN}
 */
export abstract class DocumentAIModel {
    abstract client: RESTClient;
    baseURI = 'ai/document_ai/v1';

    /**
     * Recognize VAT Invoice (增值税发票)
     *
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/vat_invoice/recognize}
     */
    @toggle('downloading')
    async recognizeVATInvoice(file: File | { file_token: string }) {
        const formData = file instanceof File ? { file } : file;
        const { body } = await this.client.post<LarkData<DocumentAIResult<VATInvoice>>>(
            `${this.baseURI}/vat_invoice/recognize`,
            formData
        );
        return body!.data!.data!;
    }

    /**
     * Recognize Taxi Invoice (出租车发票)
     *
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/taxi_invoice/recognize}
     */
    @toggle('downloading')
    async recognizeTaxiInvoice(file: File | { file_token: string }) {
        const formData = file instanceof File ? { file } : file;
        const { body } = await this.client.post<LarkData<DocumentAIResult<TaxiInvoice>>>(
            `${this.baseURI}/taxi_invoice/recognize`,
            formData
        );
        return body!.data!.data!;
    }

    /**
     * Recognize Train Invoice (火车票)
     *
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/train_invoice/recognize}
     */
    @toggle('downloading')
    async recognizeTrainInvoice(file: File | { file_token: string }) {
        const formData = file instanceof File ? { file } : file;
        const { body } = await this.client.post<LarkData<DocumentAIResult<TrainInvoice>>>(
            `${this.baseURI}/train_invoice/recognize`,
            formData
        );
        return body!.data!.data!;
    }

    /**
     * Recognize Vehicle Invoice (机动车发票)
     *
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/vehicle_invoice/recognize}
     */
    @toggle('downloading')
    async recognizeVehicleInvoice(file: File | { file_token: string }) {
        const formData = file instanceof File ? { file } : file;
        const { body } = await this.client.post<LarkData<DocumentAIResult<VehicleInvoice>>>(
            `${this.baseURI}/vehicle_invoice/recognize`,
            formData
        );
        return body!.data!.data!;
    }
}
