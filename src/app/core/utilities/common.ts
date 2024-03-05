import { CommonConstant } from "../constant";
import { List } from "@app-models";

export class CommonUtility {
  static isNull(item): boolean {
    return item === undefined || item === null;
  }

  static isEmpty(item): boolean {
    return (
      item === undefined ||
      item === null ||
      item.length === 0 ||
      item === 0 ||
      item === "" ||
      item === "null"
    );
  }

  static isNotNull(item): boolean {
    return item !== undefined && item !== null;
  }

  static isNotEmpty(item): boolean {
    return item !== undefined && item !== null && item.length !== 0;
  }

  static isObjectEmpty(obj): boolean {
    return (
      CommonUtility.isNull(obj) ||
      Object.keys(obj).length === 0 ||
      !Object.keys(obj).some((k) => CommonUtility.isNotEmpty(obj[k]))
    );
  }
  static isString(value) {
    return typeof value === "string" || value instanceof String;
  }

  static splitKeys(keys: string, separator: string = ","): string[] {
    return keys.split(separator);
  }

  static convertObjectToParams(paramObj: object) {
    let params = new URLSearchParams();
    for (let key in paramObj) {
      if (paramObj.hasOwnProperty(key) && paramObj[key]) {
        params.set(key, paramObj[key]);
      }
    }
    return params;
  }

  static defaultOp(key, value) {
    const type: string = typeof value;
    switch (type) {
      case "string":
        return `${key}~${CommonConstant.searchOperators.cn}~`;
      case "number":
      case "date":
      case "boolean":
        return `${key}~${CommonConstant.searchOperators.eq}~`;
      default:
        return key;
    }
  }

  static getFilterObjectToString({
    page,
    pageSize,
    sort,
    sortDirection,
    filter,
  }: any): string {
    let query = `page=${page}&pageSize=${pageSize}`;
    if (sort) {
      query += `&sort=${sort}`;
    }
    if (sortDirection) {
      query += `&sortdirection=${sortDirection}`;
    }
    if (CommonUtility.isObjectEmpty(filter)) {
      return query;
    }
    query += `&filter=`;
    let filterQuery = "";
    Object.keys(filter).forEach((key) => {
      if (CommonUtility.isNotEmpty(filter[key])) {
        let keyFields = CommonUtility.splitKeys(key);
        keyFields.forEach((k) => {
          if (filterQuery) {
            filterQuery += `~or~`;
          }
          if (k.indexOf("~") > 0) {
            filterQuery += k + filter[key];
          } else {
            filterQuery += `${CommonUtility.defaultOp(k, filter[key])}${
              filter[key]
            }`;
          }
        });
      }
    });
    return query + filterQuery;
  }

  static getParameter(paramName) {
    var searchString = window.location.search.substring(1),
      i,
      val,
      params = searchString.split("&");

    for (i = 0; i < params.length; i++) {
      val = params[i].split("=");
      if (val[0] == paramName) {
        return val[1];
      }
    }
    return null;
  }

  static dateLarger(date1: Date, date2: Date): boolean {
    return new Date(date1) > new Date(date2);
  }

  static addTimezoneOffset(date: Date): Date {
    var utcDate = new Date(date.toString().substring(4, 15));

    if (utcDate.getTimezoneOffset() < 0) {
      utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
    } else {
      utcDate.setMinutes(utcDate.getMinutes() + utcDate.getTimezoneOffset());
    }

    return utcDate;
  }

  static addTimezoneOffset1(date: Date): Date {
    var utcDate = date;

    if (utcDate.getTimezoneOffset() < 0) {
      utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
    } else {
      utcDate.setMinutes(utcDate.getMinutes() + utcDate.getTimezoneOffset());
    }

    return utcDate;
  }

  static getSelectedIds(list: List[]) {
    var ids = "";

    list.forEach((item) => {
      if (ids === "") {
        ids += item.id.toString();
      } else {
        ids += "," + item.id.toString();
      }
    });

    return ids;
  }

  static round(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNo = number * factor;
    var roundedTempNo = Math.round(tempNo);

    return roundedTempNo / factor;
  }

  static scroll(element: HTMLElement) {
    let start = null;
    let target = element && element ? element.getBoundingClientRect().top : 0;
    let firstPos = window.pageYOffset || document.documentElement.scrollTop;
    let pos = 0;

    (function () {
      var browser = ["ms", "moz", "webkit", "o"];

      for (
        var x = 0, length = browser.length;
        x < length && !window.requestAnimationFrame;
        x++
      ) {
        window.requestAnimationFrame =
          window[browser[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame =
          window[browser[x] + "CancelAnimationFrame"] ||
          window[browser[x] + "CancelRequestAnimationFrame"];
      }
    })();

    function showAnimation(timestamp) {
      if (!start) {
        start = timestamp || new Date().getTime();
      } //get id of animation

      var elapsed = timestamp - start;
      var progress = elapsed / 600;

      var outQuad = function outQuad(n) {
        return n * (2 - n);
      };

      var easeInPercentage = +outQuad(progress).toFixed(2);
      pos =
        target === 0
          ? firstPos - firstPos * easeInPercentage
          : firstPos + target * easeInPercentage;
      window.scrollTo(0, pos);

      if (
        (target !== 0 && pos >= firstPos + target) ||
        (target === 0 && pos <= 0)
      ) {
        cancelAnimationFrame(start);

        if (element) {
          element.setAttribute("tabindex", "-1");
          element.focus();
        }

        pos = 0;
      } else {
        window.requestAnimationFrame(showAnimation);
      }
    }

    window.requestAnimationFrame(showAnimation);
  }

  static isSmallScreen(): boolean {
    const mq = window.matchMedia("(max-width: 767px)");
    return mq.matches;
  }
}
