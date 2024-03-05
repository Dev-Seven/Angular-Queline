import { Component, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "activity-search-panel",
  templateUrl: "./search-panel.component.html",
})
export class ActivitySearchPanelComponent {
  @Output()
  searchChanged = new EventEmitter();

  searchData: { [key: string]: any } = {};
  searchKey = "username,email,phone,companyName,location";

  updateSearchTerms(key: string, value) {
    this.searchData[key] = value;
    this.searchChanged.emit(this.searchData);
  }
}
