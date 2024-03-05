import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  private scripts: any = {};
  constructor() {}
  load(scripts) {
    var promises: any[] = [];
    scripts.forEach((script) =>
      promises.push(this.loadScript(script.name, !!script.canReload))
    );
    return Promise.all(promises);
  }
  loadScript(name: string, canReload: boolean = false) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.scripts[name].loaded && !canReload) {
        resolve({ script: name, loaded: true, status: "Already Loaded" });
      } else {
        //load script
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = this.scripts[name].src;

        script.onload = () => {
          this.scripts[name].loaded = true;
          resolve({ script: name, loaded: true, status: "Loaded" });
        };

        script.onerror = (error: any) =>
          resolve({ script: name, loaded: false, status: "Loaded" });
        document.getElementsByTagName("head")[0].appendChild(script);
      }
    });
  }
  loadAllScripts() {
    const ScriptStore = [
      {
        name: "bootstrap-bundle",
        src: "assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js",
      },
      {
        name: "vertical-aside",
        src: "assets/vendor/hs-navbar-vertical-aside/hs-navbar-vertical-aside.min.js",
      },
      {
        name: "vertical-aside-cache",
        src: "assets/vendor/hs-navbar-vertical-aside/hs-navbar-vertical-aside-mini-cache.js",
      },
      {
        name: "hs-unfold",
        src: "assets/vendor/hs-unfold/dist/hs-unfold.min.js",
      },
      {
        name: "hs-form-search",
        src: "assets/vendor/hs-form-search/dist/hs-form-search.min.js",
      },
      {
        name: "select2",
        src: "assets/vendor/select2/dist/js/select2.full.min.js",
      },
      { name: "chartjs", src: "assets/vendor/chart.js/dist/Chart.min.js" },
      {
        name: "chartjs-ext",
        src: "assets/vendor/chart.js.extensions/chartjs-extensions.js",
      },
      {
        name: "chartjs-plugin",
        src: "assets/vendor/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js",
      },
      { name: "moment", src: "assets/vendor/daterangepicker/moment.min.js" },
      {
        name: "daterangepicker",
        src: "assets/vendor/daterangepicker/daterangepicker.js",
      },
      {
        name: "select",
        src: "assets/vendor/datatables.net.extensions/select/select.min.js",
      },
      {
        name: "clipboard",
        src: "assets/vendor/clipboard/dist/clipboard.min.js",
      },
      {
        name: "hs-toggle-password",
        src: "assets/vendor/hs-toggle-password/dist/js/hs-toggle-password.js",
      },
      { name: "hs.datatables", src: "assets/js/hs.datatables.js" },
      { name: "hs.core", src: "assets/js/hs.core.js" },
      { name: "hs.select2", src: "assets/js/hs.select2.js" },
      { name: "hs.chartjs", src: "assets/js/hs.chartjs.js" },
      { name: "hs.clipboard", src: "assets/js/hs.clipboard.js" },
      { name: "theme", src: "assets/js/theme.min.js" },
      { name: "custom", src: "assets/js/custom.js" },
    ];
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src,
      };
    });
    
    this.load(ScriptStore);
  }
}

export class CustomHttpParams extends HttpParams {
  constructor(public loader: boolean) {
    super();
  }
}
