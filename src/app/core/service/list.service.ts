import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IListService } from "../interface";
import { BaseService } from "./base.service";
import { List } from "@app-models";
import { APIConstant } from "../constant";

@Injectable()
export class ListService implements IListService {

    constructor(private baseService: BaseService) {
    }

    getList(listName: string): Observable<List[]> {
        return this.baseService.get(`${APIConstant.list[listName]}`);
    }

}