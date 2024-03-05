import { Injectable } from "@angular/core";
import { DocumentDetails } from "@app-models";
import { CRUDService } from "./crud.service";
import { BaseService } from "./base.service";

@Injectable()
export class DocumentService extends CRUDService<DocumentDetails> {

    constructor(private _baseService: BaseService) {
        super(_baseService, "onlinedocument");
    }

}