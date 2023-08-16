import { Constants } from './constants';
import { Pages } from './pages/pages';
export class AppConfig {
  config: any;
  constructor() {
    this.config = {
      constants: Constants.constants,
      pages: Pages.pages
    };
  }
}
