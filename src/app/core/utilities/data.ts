import { CommonUtility } from "./common";

export class DataUtility {

    static getCheckboxSeletedEnumData(value: any[], list: Object): any[] {
        return value.map((item, i) => {
            if (item) {
                return list[list[Object.keys(list)[i]]]
            }
        }).filter(v => CommonUtility.isNotNull(v));
    }
}