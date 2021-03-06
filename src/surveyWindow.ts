import { Base } from "./base";
import { SurveyModel } from "./survey";
import { LocalizableString } from "./localizablestring";

/**
 * A Model for a survey running in the Window.
 */
export class SurveyWindowModel extends Base {
  public static surveyElementName = "windowSurveyJS";
  surveyValue: SurveyModel;
  windowElement: HTMLDivElement;

  templateValue: string;
  expandedChangedCallback: () => void;
  showingChangedCallback: () => void;
  closeWindowOnCompleteCallback: () => void;

  constructor(jsonObj: any, initialModel: SurveyModel = null) {
    super();
    if (initialModel) {
      this.surveyValue = initialModel;
    } else {
      this.surveyValue = this.createSurvey(jsonObj);
    }
    this.surveyValue.showTitle = false;
    if ("undefined" !== typeof document) {
      this.windowElement = <HTMLDivElement>document.createElement("div");
    }
    var self = this;
    this.survey.onComplete.add(function (survey, options) {
      self.onSurveyComplete();
    });
  }
  public getType(): string {
    return "window";
  }
  /**
   * A survey object.
   * @see SurveyModel
   */
  public get survey(): SurveyModel {
    return this.surveyValue;
  }
  /**
   * Set this value to negative value, for example -1, to avoid closing the window on completing the survey. Leave it equals to 0 (default value) to close the window immediately, or set it to 3, 5, 10, ... to close the window in 3, 5, 10 seconds.
   */
  public closeOnCompleteTimeout: number = 0;
  /**
   * Returns true if the window is currently showing. Set it to true to show the window and false to hide it.
   * @see show
   * @see hide
   */
  public get isShowing(): boolean {
    return this.getPropertyValue("isShowing", false);
  }
  public set isShowing(val: boolean) {
    if (this.isShowing == val) return;
    this.setPropertyValue("isShowing", val);
    if (this.showingChangedCallback) this.showingChangedCallback();
  }
  /**
   * Show the window
   * @see hide
   * @see isShowing
   */
  public show() {
    this.isShowing = true;
  }
  /**
   * Hide the window
   * @see show
   * @see isShowing
   */
  public hide() {
    this.isShowing = false;
  }
  /**
   * Returns true if the window is expanded. Set it to true to expand the window or false to collapse it.
   * @see expand
   * @see collapse
   */
  public get isExpanded(): boolean {
    return this.getPropertyValue("isExpanded", false);
  }
  public set isExpanded(val: boolean) {
    this.setPropertyValue("isExpanded", val);
    if (!this.isLoadingFromJson && this.expandedChangedCallback)
      this.expandedChangedCallback();
  }
  /**
   * The window and survey title.
   */
  public get title(): string {
    return this.survey.title;
  }
  public set title(value: string) {
    this.survey.title = value;
  }
  get locTitle(): LocalizableString {
    return this.survey.locTitle;
  }
  /**
   * Expand the window to show the survey.
   */
  public expand() {
    this.expandcollapse(true);
  }
  /**
   * Collapse the window and show survey title only.
   */
  public collapse() {
    this.expandcollapse(false);
  }
  protected createSurvey(jsonObj: any): SurveyModel {
    return new SurveyModel(jsonObj);
  }
  protected expandcollapse(value: boolean) {
    this.isExpanded = value;
  }
  protected onSurveyComplete() {
    if (this.closeOnCompleteTimeout < 0) return;
    if (this.closeOnCompleteTimeout == 0) {
      this.closeWindowOnComplete();
    } else {
      var self = this;
      var timerId: any = null;
      var func = function () {
        self.closeWindowOnComplete();
        if (typeof window !== "undefined") {
          window.clearInterval(timerId);
        }
      };
      timerId =
        typeof window !== "undefined"
          ? window.setInterval(func, this.closeOnCompleteTimeout * 1000)
          : 0;
    }
  }
  protected closeWindowOnComplete() {
    if (!!this.closeWindowOnCompleteCallback) {
      this.closeWindowOnCompleteCallback();
    }
  }
}
