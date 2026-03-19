import { makeFormData } from 'koajax';
import { BaseModel, RESTClient, toggle } from 'mobx-restful';

import { LarkData } from '../../type';
import { TaxiInvoice, TrainInvoice, VatInvoice, VehicleInvoice } from './type';

export * from './type';

export abstract class DocumentAIModel extends BaseModel {
    baseURI = 'document_ai/v1';
    abstract client: RESTClient;

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/vat_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeVatInvoice(file: File) {
        const { body } = await this.client.post<LarkData<{ vat_invoices: VatInvoice[] }>>(
            `${this.baseURI}/vat_invoice/recognize`,
            makeFormData({ file })
        );
        return body!.data!.vat_invoices;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/taxi_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeTaxiInvoice(file: File) {
        const { body } = await this.client.post<LarkData<{ taxi_invoices: TaxiInvoice[] }>>(
            `${this.baseURI}/taxi_invoice/recognize`,
            makeFormData({ file })
        );
        return body!.data!.taxi_invoices;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/train_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeTrainInvoice(file: File) {
        const { body } = await this.client.post<LarkData<{ train_invoices: TrainInvoice[] }>>(
            `${this.baseURI}/train_invoice/recognize`,
            makeFormData({ file })
        );
        return body!.data!.train_invoices;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ai/document_ai-v1/vehicle_invoice/recognize}
     */
    @toggle('uploading')
    async recognizeVehicleInvoice(file: File) {
        const { body } = await this.client.post<LarkData<{ vehicle_invoices: VehicleInvoice[] }>>(
            `${this.baseURI}/vehicle_invoice/recognize`,
            makeFormData({ file })
        );
        return body!.data!.vehicle_invoices;
    }
}
