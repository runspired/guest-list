import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class DownloadCsvComponent extends Component {
    @service stats;

    get tagName() {
        return '';
    }

    @computed('stats.csvData')
    get dataUrl() {
      let data = this.stats.csvData;
      let csvContent = data.map(row => row.join(','));
      csvContent = csvContent.join('\r\n');

      let blob = new Blob([csvContent],{ type: 'text/csv;charset=utf-8;' });
      let url = URL.createObjectURL(blob);

      return url;
    }
}
