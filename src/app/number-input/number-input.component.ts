import {
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  Self,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import {
  ErrorStateMatcher,
  MAT_INPUT_VALUE_ACCESSOR,
  MatFormFieldControl,
} from '@angular/material';

import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: NumberInputComponent }
  ]
})
export class NumberInputComponent implements OnInit, OnDestroy, DoCheck, OnChanges, MatFormFieldControl<any>, ControlValueAccessor {

  static nextId = 0;

  readonly stateChanges = new Subject<void>();
  focused = false;
  get errorState() {
    return this.ngControl.errors !== null && this.ngControl.touched;
  }
  controlType = 'app-number-input';
  protected _previousNativeValue: any;
  private _inputValueAccessor: { value: any };
  errorStateMatcher: ErrorStateMatcher;

  @HostBinding() id = `${this.controlType}-${NumberInputComponent.nextId++}`;
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }
  @HostBinding('attr.aria-describedBy') describedBy = '';

  private _required = false;
  private _disabled = false;
  private _placeholder = '';

  @Input() min: number;
  @Input() max: number;

  propogateChange = (_: any) => {
  }
  propogateTouched = () => {
  }

  constructor(private fm: FocusMonitor,
    private _elementRef: ElementRef<HTMLInputElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() private _parentForm: NgForm,
    @Optional() private _parentFormGroup: FormGroupDirective,
    private _defaultErrorStateMatcher: ErrorStateMatcher,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    @Optional() @Self() @Inject(MAT_INPUT_VALUE_ACCESSOR) inputValueAccessor: any) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this._previousNativeValue = this.value;

    fm.monitor(this._elementRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled() {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }
  set disabled(dis) {
    this._disabled = coerceBooleanProperty(dis);

    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  @Input()
  get value(): string {
    return this.empty ? null : this._elementRef.nativeElement.value || '';
  }
  set value(value: string) {
    this.writeValue(value);
    this.stateChanges.next();
    this.propogateChange(value);
  }

  get empty(): boolean {
    return !this._elementRef.nativeElement.value;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);
  }

  ngDoCheck() {
    this._dirtyCheckNativeValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.stateChanges.next();
  }

  writeValue(value: any): void {
    this.renderer.setProperty(this._elementRef.nativeElement.querySelector('input'), 'value', value);
    this.renderer.setProperty(this._elementRef.nativeElement, 'value', value);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.propogateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propogateTouched = fn;
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  onContainerClick() {
    if (!this.focused) {
      this.focus();
    }
  }

  @HostListener('change', ['$event'])
  onChange(event) {
    const value = event.target.value;
    this.value = value;
  }

  @HostListener('focusout')
  onBlur() {
    this.focused = false;
    this.propogateTouched();
    this.stateChanges.next();
  }

  increment() {
    let value = +this.value;
    // const max = +this.max;
    value += 1;
    // if (this.max && value > max) {
    //   value = max;
    // }
    this.value = value.toString();
  }

  decrement() {
    let value = +this.value;
    // const min = +this.min;
    value -= 1;
    // if (this.min && value < min) {
    //   value = min;
    // }
    this.value = value.toString();
  }

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  protected _dirtyCheckNativeValue() {
    const newValue = this._elementRef.nativeElement.value;

    if (this._previousNativeValue !== newValue) {
      this._previousNativeValue = newValue;
      this.stateChanges.next();
    }
  }

  @HostListener('input')
  _onInput() {
  }

}
