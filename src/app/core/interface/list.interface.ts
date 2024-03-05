import { Observable } from "rxjs";
import { List } from '@app-models';

export interface IListService {

    getList: (listName: string) => Observable<List[]>;
}