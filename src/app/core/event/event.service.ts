import { Subject, Observable } from 'rxjs';
import { Injectable } from "@angular/core";

interface BroadcastEvent {
    key: any;
    data?: any;
}

@Injectable()
export class EventService {
    private _eventBus: Subject<BroadcastEvent>;

    constructor() {
        this._eventBus = new Subject<BroadcastEvent>();
    }

    broadcast(key: any, data?: any) {
        this._eventBus.next(data);
    }

    on(key: any): Observable<any> {
        return this._eventBus.asObservable();
    }
}