import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { DeviceDetailsService } from '@app/pages/services/device-details/device-details.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multi-info',
  templateUrl: './multi-info.component.html',
  styleUrls: ['./multi-info.component.scss']
})
export class MultiInfoComponent implements OnInit, OnDestroy {
  @Input() multiInfoOptions;
  cardData;
  deviceId;
  cardUpdation: Subscription;
  isCardLoading = false;
  isDataAvailable = false;
  constants;
  memParams = {};

  constructor(
    private deviceDetailsService: DeviceDetailsService,
    private dashboardService: DashBoardService,
    private dataUpdationService: DataUpdateService,
    private config: AppConfigService
  ) {}

  async ngOnInit() {
    this.initCardDataUpdation();
  }

  async initCardDataUpdation() {
    this.constants = this.config.getConstants();
    this.cardUpdation = this.dataUpdationService.updateDeviceData$.subscribe(async event => {
      if (this.multiInfoOptions && this.multiInfoOptions.dataEndPoint) {
        try {
          this.isCardLoading = true;
          this.deviceId = event.id;
          const cardData = await this.getCardData(this.deviceId);
          if (cardData) {
            this.cardData = this.processCardData(cardData);
          }
          this.isDataAvailable = Boolean(Array.isArray(this.cardData) && this.cardData.length);
        } catch (err) {
          this.dashboardService.logError(err);
        } finally {
          this.isCardLoading = false;
        }
      }
    });
  }

  processCardData(cardData) {
    let processedData = [];
    const data = cardData.data;
    const headers = cardData.headers;
    const units = cardData.units;
    let index = 0;
    let length = 0;
    let keys = Object.keys(data);
    const categories = this.multiInfoOptions.categories;
    categories.forEach(section => {
      let processedObj = {};
      processedObj['title'] = section.title;
      processedObj['icon'] = section.icon;
      processedObj['data'] = {};
      length += section.parameter.length;
      for (index; index < length; index++) {
        let key = keys[index];
        if (data[key]) {
          if (headers[index] === 'Uptime') {
            processedObj['data'][headers[index]] = this.deviceDetailsService.formatUpTime(data[key]);
          } else if (this.constants.memoryParams.includes(headers[index])) {
            this.memParams[headers[index]] = { val: data[key], unit: units[index] };
            processedObj['data'][headers[index]] = this.deviceDetailsService.formatMemoryParams(data[key], units[index]);
          } else {
            const unit = units[index] ? units[index] : ``;
            processedObj['data'][headers[index]] = data[key] + ' ' + unit;
          }
        }
      }
      processedData.push(processedObj);
    });
    const finalData = this.processDataByParam(processedData);
    return finalData;
  }

  processDataByParam(processedData) {
    const data = processedData.filter(section => {
      const keys = Object.keys(section.data);
      if (keys.length != 0) {
        if (keys.includes('Memory Free') && keys.includes('Memory Total')) {
          const memFree = this.memParams['Memory Free'];
          const memTotal = this.memParams['Memory Total'];
          const memUsed = this.deviceDetailsService.formatMemoryParams(memTotal.val - memFree.val, memTotal.unit);
          section.data['Memory ( Used/Total )'] = memUsed + '/' + section.data['Memory Total'];
          delete section.data['Memory Free'];
          delete section.data['Memory Total'];
        }
        if (keys.includes('Storage Free') && keys.includes('Total Storage')) {
          const storageFree = this.memParams['Storage Free'];
          const storageTotal = this.memParams['Total Storage'];
          const storageUsed = this.deviceDetailsService.formatMemoryParams(storageTotal.val - storageFree.val, storageTotal.unit);
          section.data['Storage ( Used/Total )'] = storageUsed + '/' + section.data['Total Storage'];
          delete section.data['Storage Free'];
          delete section.data['Total Storage'];
        }
        return section;
      }
    });
    return data;
  }

  getCardData(deviceId) {
    const parameter = [];
    this.multiInfoOptions.categories.forEach(section => {
      section.parameter.forEach(element => {
        parameter.push(element);
      });
    });
    let params = {
      parameter,
      deviceId
    };
    return this.dashboardService.getDashBoardData(this.multiInfoOptions.dataEndPoint, params);
  }

  originalOrder = (a, b) => 0;

  ngOnDestroy() {
    if (this.cardUpdation) {
      this.cardUpdation.unsubscribe();
    }
  }
}
