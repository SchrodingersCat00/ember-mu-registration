import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fetch } from 'fetch';

export default class MuUnregisterComponent extends Component {
  @tracked loading = false;
  @tracked errorMsg = '';

  get showFeedbackMsg() {
    return this.args.showFeedbackMsg === null ||
      this.args.showFeedbackMsg === undefined
      ? true
      : this.args.showFeedbackMsg;
  }

  basePath = this.args.basePath ?? '/accounts';

  @action
  async unregister(event) {
    event.preventDefault(); // Prevent page reload
    this.args.onUnregisterClicked?.();
    this.errorMsg = '';
    this.loading = true;

    const res = await fetch(`${this.basePath}/current`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });

    this.loading = false;

    if (res.ok) {
      this.args.onUnregisterSucceeded?.();
    } else {
      if (res.status === 404) {
        this.errorMsg = '404: Not found';
        this.args.onUnregisterFailed?.(this.errorMsg);
      } else if (res.status === 400) {
        const json = await res.json();
        const error = json.errors[0];
        this.statusMessage = error.title;
        this.args.onUnregisterFailed?.(error);
      }
    }
  }
}
