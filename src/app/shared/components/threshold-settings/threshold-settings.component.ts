import { ThresholdSettingsService } from './../../services/threshold-settings/threshold-settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbDialogRef, NbDialogService, NbThemeService } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ConfirmationPopUp } from '../confirmation-pop-up/confirmation-pop-up.component';
import { ThresholdTypeSettings } from '@app/shared/config/thresholdTypeSettings';

@Component({
  selector: 'app-threshold-settings',
  templateUrl: './threshold-settings.component.html',
  styleUrls: ['./threshold-settings.component.scss']
})
export class ThresholdSettingsComponent implements OnInit, OnDestroy {
  thresholdData: any;
  tableForm: FormGroup;
  cols = ['Parameter', 'Lower threshold', 'Upper threshold'];
  totalRecords: number;
  tableRowCount = 20;
  errorMessage: string;
  warningMessage: string;
  errorFlag: boolean;
  warningFlag: boolean;
  loading: boolean = true;
  theme: any;
  constants: any;
  themeSubscription: Subscription;
  isEditing: boolean = false;
  editAllowed: boolean;
  editLocked: boolean = false;
  consolidationTimeInfo: string = '';
  thresholdTypeConfig: any;
  thresholdTypes: any;
  updatedParams = [];
  tableHeight = 'calc(58.5vh - 6.575rem)';

  constructor(
    protected ref: NbDialogRef<ThresholdSettingsComponent>,
    private thresholdService: ThresholdSettingsService,
    private toastr: ToastrService,
    private config: AppConfigService,
    private customTheme: CustomThemeService,
    private fb: FormBuilder,
    private themeService: NbThemeService,
    private dialogService: NbDialogService
  ) {}

  cancel() {
    this.ref.close();
  }

  async ngOnInit() {
    this.thresholdTypeConfig = ThresholdTypeSettings.config;
    this.thresholdTypes = this.thresholdTypeConfig.map(type => type.id);
    this.errorFlag = false;
    this.tableForm = this.fb.group({
      parameters: this.fb.array([])
    });
    this.initThemeOptions();
    await this.getParameters();
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    const theme = this.themeService.currentTheme;
    if (theme) {
      this.theme = theme === this.constants.darkTheme ? 'dark' : 'light';
    } else {
      this.theme = this.constants.defaultTheme === this.constants.darkTheme ? 'dark' : 'light';
    }
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? 'dark' : 'light';
    });
  }

  async getParameters() {
    try {
      const response = await this.thresholdService.getParameterData();
      if (response && response.length > 0) {
        this.thresholdData = response;
        let parameters = this.tableForm.get('parameters') as FormArray;
        for (let i = 0; i < this.thresholdData.length; i++) {
          parameters.push(
            this.fb.group({
              displayName: [this.thresholdData[i].displayName, [Validators.required]],
              id: [this.thresholdData[i].id, [Validators.required]],
              minThreshold: this.fb.group({
                '15minute': [
                  this.thresholdData[i].minThreshold['15minute'],
                  [Validators.required]
                ],
                hourly: [this.thresholdData[i].minThreshold['hourly'], [Validators.required]],
                daily: [this.thresholdData[i].minThreshold['daily'], [Validators.required]]
              }),
              maxThreshold: this.fb.group({
                '15minute': [
                  this.thresholdData[i].maxThreshold['15minute'],
                  [Validators.required]
                ],
                hourly: [this.thresholdData[i].maxThreshold['hourly'], [Validators.required]],
                daily: [this.thresholdData[i].maxThreshold['daily'], [Validators.required]]
              }),
              thresholdType: [this.thresholdData[i].thresholdType, [Validators.required]],
              warningBoxRequired: [
                this.thresholdData[i].warningBoxRequired,
                [Validators.required]
              ],
              unit: [this.thresholdData[i].unit, [Validators.required]],
              aggregateType: [this.thresholdData[i].aggregateType, [Validators.required]]
            })
          );
        }
        this.totalRecords = response.length;
        this.loading = false;
      } else {
        this.cancel();
      }
    } catch (err) {
      this.loading = false;
      this.cancel();
    }
  }

  get getFormControls() {
    const control = this.tableForm.get('parameters') as FormArray;
    return control;
  }

  checkThresholds() {
    const params = this.getFormControls.controls;
    this.errorFlag = false;
    this.errorMessage = null;
    params.forEach((param, i) => {
      if (param.touched && param.dirty && !this.errorFlag) {
        for (let j = 0; j < this.thresholdTypes.length; j++) {
          const type = this.thresholdTypes[j];
          let keys = param.value;
          let minThresholdVal = this.getThresholdController(i, type, 'min').value;
          let maxThresholdVal = this.getThresholdController(i, type, 'max').value;
          let minVal = Number(minThresholdVal);
          let maxVal = Number(maxThresholdVal);
          if (!maxVal && maxVal != 0) {
            this.errorFlag = true;
            this.errorMessage =
              keys.thresholdType === 'normal'
                ? `Upper threshold required for ${keys.displayName}`
                : `Lower threshold required for ${keys.displayName}`;
          } else if (!minVal && minVal != 0) {
            this.errorFlag = true;
            this.errorMessage =
              keys.thresholdType === 'inverse'
                ? `Upper threshold required for ${keys.displayName}`
                : `Lower threshold required for ${keys.displayName}`;
          } else if (keys.id != 'rssi' && (minVal < 0 || maxVal < 0)) {
            this.errorFlag = true;
            const errorParam =
              minVal < 0
                ? keys.thresholdType === 'normal'
                  ? 'Lower threshold'
                  : 'Upper threshold'
                : keys.thresholdType === 'inverse'
                ? 'Lower threshold'
                : 'Upper threshold';
            this.errorMessage = `For ${keys.displayName}, ${errorParam} should be greater than or equal to 0`;
          } else if (keys.id === 'rssi' && (minVal > 0 || maxVal > 0)) {
            this.errorFlag = true;
            const errorParam = minVal > 0 ? 'Upper threshold' : 'Lower threshold';
            this.errorMessage = `For ${keys.displayName}, ${errorParam} should be less than or equal to 0`;
          } else if (
            (keys.thresholdType === 'normal' && maxVal < minVal) ||
            (keys.thresholdType === 'inverse' && maxVal > minVal)
          ) {
            this.errorFlag = true;
            this.errorMessage = `For ${keys.displayName}, Upper threshold should be greater than Lower threshold`;
          } else if (minVal === maxVal) {
            this.errorFlag = true;
            this.errorMessage = `Lower threshold and Upper threshold can not be equal`;
          }
        }
      }
    });
    return this.errorFlag;
  }

  onSubmit() {
    this.loading = true;
    if (this.tableForm.touched && this.tableForm.dirty) {
      this.thresholdData.forEach(oldParam => {
        const newParams = this.getFormControls.value;
        newParams.forEach(newParam => {
          if (oldParam.id === newParam.id) {
            this.checkParamUpdated(oldParam, newParam);
          }
        });
      });
    }
    if (this.updatedParams.length) {
      this.dialogService
        .open(ConfirmationPopUp, {
          closeOnEsc: false,
          closeOnBackdropClick: false,
          context: {
            id: 'confirmation',
            header: 'Save',
            content: 'Do you want to save changes?'
          }
        })
        .onClose.subscribe(resp => {
          if (resp) {
            this.setNewParams();
          } else {
            this.loading = false;
          }
        });
    } else {
      this.loading = false;
      this.cancel();
    }
  }

  checkParamUpdated(oldParam, newParam) {
    const newParamObj = {};
    let isParamsUpdated = false;
    for (let i = 0; i < this.thresholdTypes.length && !isParamsUpdated; i++) {
      const type = this.thresholdTypes[i];
      if (
        oldParam.minThreshold[type] != newParam.minThreshold[type] ||
        oldParam.maxThreshold[type] != newParam.maxThreshold[type]
      ) {
        isParamsUpdated = true;
        newParamObj['id'] = newParam.id;
        newParamObj['minThreshold'] = {};
        newParamObj['maxThreshold'] = {};
        for (let j = 0; j < this.thresholdTypes.length; j++) {
          const innerType = this.thresholdTypes[j];
          if (newParam.aggregateType === 'avg') {
            newParamObj['minThreshold'][innerType] = newParam.minThreshold['15minute'];
            newParamObj['maxThreshold'][innerType] = newParam.maxThreshold['15minute'];
          } else {
            newParamObj['minThreshold'][innerType] = newParam.minThreshold[innerType];
            newParamObj['maxThreshold'][innerType] = newParam.maxThreshold[innerType];
          }
        }
      }
    }
    if (isParamsUpdated) {
      this.updatedParams.push(newParamObj);
    }
  }

  async setNewParams() {
    const response = await this.thresholdService.updateParameterData(this.updatedParams);
    this.loading = false;
    this.updatedParams = [];
    if (response) {
      this.toastr.success('Successfully changed thresholds', 'Success');
      this.cancel();
    }
  }

  async onClickEdit() {
    this.loading = true;
    let response = await this.thresholdService.getLatestParameterData();
    if (response.status === 'Blocked') {
      this.editLocked = true;
      this.warningFlag = true;
      this.warningMessage = `Can't edit thresholds during consolidation.`;
      this.loading = true;
    } else if (response && response.parameters.length > 0) {
      this.isEditing = true;
      this.editLocked = false;
      this.thresholdData = response.parameters;
      this.changeTableValues();
      this.loading = true;
      let consolidationTimeResp = await this.thresholdService.getNextConsolidationTime();
      if (consolidationTimeResp) {
        const time = moment
          .utc(consolidationTimeResp)
          .local()
          .format('YYYY-MM-DD HH:mm:ss');
        this.consolidationTimeInfo = ` approximately by ${time}.`;
      }
    }
    this.loading = false;
  }

  async onClickCancel() {
    this.loading = true;
    const response = await this.thresholdService.getParameterData();
    if (response && response.length > 0) {
      this.thresholdData = response;
      this.isEditing = false;
      this.changeTableValues();
      this.loading = false;
    }
  }

  async onDiscard() {
    this.dialogService
      .open(ConfirmationPopUp, {
        closeOnEsc: false,
        closeOnBackdropClick: false,
        context: {
          id: 'confirmation',
          header: 'Discard',
          content: 'Are you sure you want to discard all the changes?'
        }
      })
      .onClose.subscribe(async resp => {
        if (resp) {
          const response = await this.thresholdService.discardUpdates();
          if (response) {
            this.toastr.info('Discarded all updates', 'Info');
            await this.onClickCancel();
          }
        }
      });
  }

  changeTableValues() {
    const newParams = [];
    this.thresholdData.forEach(param => {
      newParams.push({
        displayName: param.displayName,
        id: param.id,
        minThreshold: param.minThreshold,
        maxThreshold: param.maxThreshold,
        thresholdType: param.thresholdType,
        warningBoxRequired: param.warningBoxRequired,
        unit: param.unit ? param.unit : '',
        aggregateType: param.aggregateType
      });
    });
    this.getFormControls.setValue(newParams);
  }

  getThresholdController(paramIndex, thresholdType, thresholdKey) {
    const threshold = thresholdKey === 'min' ? 'minThreshold' : 'maxThreshold';
    const paramGroup = this.getFormControls.controls[paramIndex] as FormGroup;
    const thresholdGroup = paramGroup.get(threshold) as FormGroup;
    const control = thresholdGroup.get(thresholdType) as FormControl;
    return control;
  }

  isEditDisabled(thresholdType, aggregateType) {
    return this.isEditing
      ? thresholdType === '15minute'
        ? false
        : aggregateType === 'sum'
        ? false
        : true
      : true;
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
