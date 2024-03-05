import { Component, OnInit } from '@angular/core';
import { Inquiry } from 'src/app/model/inquiry';
import { AccountService } from '../account/account.service';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-locationadmins',
  templateUrl: './locationadmins.component.html',
  styleUrls: ['./locationadmins.component.css']
})
export class LocationadminsComponent implements OnInit {
  admins: Array<any>;
  page = 1;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.getAdmins();
  }
  getAdmins() {
    this.profileService.getProfiles().subscribe((data) => {
      if (data) {
        console.log(data.filter(item=>item.role !== 'System Admin'))
      this.admins=data.filter(item=>item.role !== 'System Admin');
      }
    });
  }
  pageChanged(event) {
    this.page = event;
  }
}
