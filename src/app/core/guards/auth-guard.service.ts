import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserAuthService } from '../service/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private auth: UserAuthService, private router: Router) {

    }

    canActivate(): boolean {
        if (!this.auth.isLoggedIn()) {
            this.router.navigate(['unauthorized']);
            return;
        }

        return true;
    }
}